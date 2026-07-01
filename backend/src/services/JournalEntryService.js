import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class JournalEntryService {
  async createJournalEntry(journalData) {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const item of journalData.lineItems) {
      totalDebit += item.debitAmount || 0;
      totalCredit += item.creditAmount || 0;
    }

    if (totalDebit !== totalCredit) {
      throw new ApiError(
        400,
        "Total debit must equal total credit",
        "UNBALANCED_ENTRY"
      );
    }

    const latestVoucher =
      await journalEntryRepository.getLatestVoucher();

    let voucherNumber = "JE-00001";

    if (latestVoucher) {
      const lastNumber = parseInt(
        latestVoucher.voucherNumber.replace("JE-", "")
      );

      voucherNumber = `JE-${String(lastNumber + 1).padStart(5, "0")}`;
    }

    journalData.voucherNumber = voucherNumber;
    journalData.totalDebit = totalDebit;
    journalData.totalCredit = totalCredit;

    const journal = await journalEntryRepository.create(journalData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "JournalEntry",
      entityId: journal._id,
      entityName: journal.voucherNumber,
      description: `Journal Entry ${journal.voucherNumber} was created for ₹${totalDebit.toFixed(2)}`,
      category: "business",
      performedBy: journal.createdBy,
      performedByName: "",
      metadata: { totalDebit, totalCredit },
    });

    return journal;
  }

  async getJournalEntries() {
    return journalEntryRepository.findAll();
  }

  async getJournalEntryById(id) {
    const journalEntry =
      await journalEntryRepository.findById(id);

    if (!journalEntry) {
      throw new ApiError(
        404,
        "Journal entry not found",
        "JOURNAL_ENTRY_NOT_FOUND"
      );
    }

    return journalEntry;
  }

  async updateJournalEntry(id, data) {
    const journalEntry =
      await this.getJournalEntryById(id);

    if (journalEntry.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft entries can be updated",
        "INVALID_STATUS"
      );
    }

    return journalEntryRepository.update(id, data);
  }

  async submitJournalEntry(id) {
    const journalEntry =
      await this.getJournalEntryById(id);

    if (journalEntry.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft entries can be submitted",
        "INVALID_STATUS"
      );
    }

    const journal = await journalEntryRepository.submit(id);

    await activityLogService.logActivity({
      action: "Submitted",
      entity: "JournalEntry",
      entityId: journal._id,
      entityName: journal.voucherNumber,
      description: `Journal Entry ${journal.voucherNumber} was posted`,
      category: "business",
      performedBy: journal.createdBy,
      performedByName: "",
    });

    return journal;
  }

  async cancelJournalEntry(id) {
    const journalEntry =
      await this.getJournalEntryById(id);

    if (journalEntry.status === "Cancelled") {
      throw new ApiError(
        400,
        "Journal entry already cancelled",
        "INVALID_STATUS"
      );
    }

    const journal = await journalEntryRepository.cancel(id);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "JournalEntry",
      entityId: journal._id,
      entityName: journal.voucherNumber,
      description: `Journal Entry ${journal.voucherNumber} was cancelled`,
      category: "business",
      performedBy: journal.createdBy,
      performedByName: "",
    });

    return journal;
  }
}

export default new JournalEntryService();