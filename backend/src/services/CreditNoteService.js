import creditNoteRepository from "../repositories/CreditNoteRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import taxGroupService from "./TaxGroupService.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class CreditNoteService {
  async createCreditNote(noteData) {
    const latestNote = await creditNoteRepository.getLatestCreditNote();

    let creditNoteNumber = "CN-00001";

    if (latestNote) {
      const lastNumber = parseInt(
        latestNote.creditNoteNumber.replace("CN-", ""),
      );
      creditNoteNumber = `CN-${String(lastNumber + 1).padStart(5, "0")}`;
    }

    let subtotal = 0;
    for (const item of noteData.items) {
      item.amount = item.quantity * item.rate;
      subtotal += item.amount;
    }

    let taxAmount = 0;
    let taxBreakdown = [];

    if (noteData.taxGroup) {
      const taxResult = await taxGroupService.calculateTax(
        noteData.taxGroup,
        subtotal,
      );
      taxBreakdown = taxResult.taxBreakdown;
      taxAmount = taxResult.totalTax;
    }

    const grandTotal = subtotal + taxAmount;

    noteData.creditNoteNumber = creditNoteNumber;
    noteData.subtotal = subtotal;
    noteData.taxBreakdown = taxBreakdown;
    noteData.taxAmount = taxAmount;
    noteData.grandTotal = grandTotal;

    const note = await creditNoteRepository.create(noteData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "CreditNote",
      entityId: note._id,
      entityName: note.creditNoteNumber,
      description: `Credit Note ${note.creditNoteNumber} was created for ${grandTotal.toFixed(2)}`,
      category: "business",
      performedBy: note.createdBy,
      performedByName: "",
      metadata: { grandTotal, customer: noteData.customer },
    });

    return note;
  }

  async getCreditNotes() {
    return creditNoteRepository.find({}, "customer");
  }

  async getCreditNoteById(id) {
    const note = await creditNoteRepository.findById(id, "customer");

    if (!note) {
      throw new ApiError(404, "Credit note not found", "CREDIT_NOTE_NOT_FOUND");
    }

    return note;
  }

  async updateCreditNote(id, data) {
    const note = await this.getCreditNoteById(id);

    if (note.status !== "Draft") {
      throw new ApiError(400, "Only draft credit notes can be updated", "INVALID_STATUS");
    }

    return creditNoteRepository.update(id, data);
  }

  async submitCreditNote(id) {
    const note = await this.getCreditNoteById(id);

    if (note.status !== "Draft") {
      throw new ApiError(400, "Only draft credit notes can be submitted", "INVALID_STATUS");
    }

    // Reverse journal entry: Debit sales returns / Credit accounts receivable
    const accountsReceivable = await accountRepository.findByCode("1101");
    const salesRevenue = await accountRepository.findByCode("4001");

    if (!accountsReceivable || !salesRevenue) {
      throw new ApiError(404, "Required accounts not found", "ACCOUNT_NOT_FOUND");
    }

    // Debit: reverse sales revenue (subtotal) + reverse output tax liability (tax)
    // Credit: reduce accounts receivable (grandTotal = subtotal + tax)
    const lineItems = [
      {
        account: salesRevenue._id,
        debitAmount: note.subtotal,
        creditAmount: 0,
        description: "Sales Returns / Credit Note",
      },
    ];

    // Add reverse tax lines on debit side
    if (note.taxBreakdown && note.taxBreakdown.length > 0) {
      for (const tax of note.taxBreakdown) {
        const accountCode =
          tax.taxType === "CGST" ? "2401" :
          tax.taxType === "SGST" ? "2402" :
          tax.taxType === "IGST" ? "2403" : "2400";
        const outputTaxAccount = await accountRepository.findByCode(accountCode);
        if (!outputTaxAccount) {
          throw new ApiError(404, `Output tax account ${accountCode} not found for ${tax.taxName}.`, "TAX_ACCOUNT_NOT_FOUND");
        }
        lineItems.push({
          account: outputTaxAccount._id,
          debitAmount: tax.amount,
          creditAmount: 0,
          description: `${tax.taxName} reversal (${tax.taxCode})`,
        });
      }
    }

    // Credit side: reduce accounts receivable
    lineItems.push({
      account: accountsReceivable._id,
      debitAmount: 0,
      creditAmount: note.grandTotal,
      description: "Accounts Receivable reduction via Credit Note",
    });

    await journalEntryRepository.create({
      voucherNumber: `JE-CN-${note.creditNoteNumber}`,
      remarks: `Credit Note ${note.creditNoteNumber}`,
      totalDebit: note.grandTotal,
      totalCredit: note.grandTotal,
      referenceType: "CreditNote",
      referenceNumber: note.creditNoteNumber,
      lineItems: lineItems,
      createdBy: note.createdBy,
      status: "Submitted",
    });

    const submittedNote = await creditNoteRepository.submit(id);

    await activityLogService.logActivity({
      action: "Submitted",
      entity: "CreditNote",
      entityId: submittedNote._id,
      entityName: submittedNote.creditNoteNumber,
      description: `Credit Note ${submittedNote.creditNoteNumber} was submitted and posted`,
      category: "business",
      performedBy: submittedNote.createdBy,
      performedByName: "",
    });

    return submittedNote;
  }

  async cancelCreditNote(id) {
    const note = await this.getCreditNoteById(id);

    if (note.status === "Cancelled") {
      throw new ApiError(400, "Credit note already cancelled", "INVALID_STATUS");
    }

    if (note.status === "Submitted") {
      const relatedJournal = await journalEntryRepository.findOne({
        referenceType: "CreditNote",
        referenceNumber: note.creditNoteNumber,
        status: "Submitted",
      });

      if (relatedJournal) {
        await journalEntryRepository.cancel(relatedJournal._id);

        await activityLogService.logActivity({
          action: "Cancelled",
          entity: "JournalEntry",
          entityId: relatedJournal._id,
          entityName: relatedJournal.voucherNumber,
          description: `Journal Entry ${relatedJournal.voucherNumber} was reversed due to cancellation of Credit Note ${note.creditNoteNumber}`,
          category: "business",
          performedBy: note.createdBy,
          performedByName: "",
        });
      }
    }

    const cancelledNote = await creditNoteRepository.cancel(id);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "CreditNote",
      entityId: cancelledNote._id,
      entityName: cancelledNote.creditNoteNumber,
      description: `Credit Note ${cancelledNote.creditNoteNumber} was cancelled`,
      category: "business",
      performedBy: cancelledNote.createdBy,
      performedByName: "",
    });

    return cancelledNote;
  }
}

export default new CreditNoteService();
