import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import ApiError from "../utils/ApiError.js";

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

    return journalEntryRepository.create(journalData);
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

    return journalEntryRepository.submit(id);
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

    return journalEntryRepository.cancel(id);
  }
}

export default new JournalEntryService();