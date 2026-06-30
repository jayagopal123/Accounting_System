import debitNoteRepository from "../repositories/DebitNoteRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import taxGroupService from "./TaxGroupService.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class DebitNoteService {
  async createDebitNote(noteData) {
    const latestNote = await debitNoteRepository.getLatestDebitNote();

    let debitNoteNumber = "DN-00001";

    if (latestNote) {
      const lastNumber = parseInt(
        latestNote.debitNoteNumber.replace("DN-", ""),
      );
      debitNoteNumber = `DN-${String(lastNumber + 1).padStart(5, "0")}`;
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

    noteData.debitNoteNumber = debitNoteNumber;
    noteData.subtotal = subtotal;
    noteData.taxBreakdown = taxBreakdown;
    noteData.taxAmount = taxAmount;
    noteData.grandTotal = grandTotal;

    const note = await debitNoteRepository.create(noteData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "DebitNote",
      entityId: note._id,
      entityName: note.debitNoteNumber,
      description: `Debit Note ${note.debitNoteNumber} was created for ${grandTotal.toFixed(2)}`,
      category: "business",
      performedBy: note.createdBy,
      performedByName: "",
      metadata: { grandTotal, supplier: noteData.supplier },
    });

    return note;
  }

  async getDebitNotes() {
    return debitNoteRepository.find({}, "supplier");
  }

  async getDebitNoteById(id) {
    const note = await debitNoteRepository.findById(id, "supplier");

    if (!note) {
      throw new ApiError(404, "Debit note not found", "DEBIT_NOTE_NOT_FOUND");
    }

    return note;
  }

  async updateDebitNote(id, data) {
    const note = await this.getDebitNoteById(id);

    if (note.status !== "Draft") {
      throw new ApiError(400, "Only draft debit notes can be updated", "INVALID_STATUS");
    }

    return debitNoteRepository.update(id, data);
  }

  async submitDebitNote(id) {
    const note = await this.getDebitNoteById(id);

    if (note.status !== "Draft") {
      throw new ApiError(400, "Only draft debit notes can be submitted", "INVALID_STATUS");
    }

    // Debit Note = reverse Purchase Invoice
    // We need to: debit Accounts Payable (reduce liability), credit Purchase Expense, credit Input Tax
    const purchaseExpense = await accountRepository.findByCode("5001");
    const accountsPayable = await accountRepository.findByCode("2001");

    if (!purchaseExpense || !accountsPayable) {
      throw new ApiError(404, "Required accounts not found", "ACCOUNT_NOT_FOUND");
    }

    const lineItems = [
      {
        account: accountsPayable._id,
        debitAmount: note.grandTotal,
        creditAmount: 0,
        description: "Accounts Payable reduction via Debit Note",
      },
      {
        account: purchaseExpense._id,
        debitAmount: 0,
        creditAmount: note.subtotal,
        description: "Purchase Returns / Debit Note",
      },
    ];

    // Add reverse input tax lines
    if (note.taxBreakdown && note.taxBreakdown.length > 0) {
      for (const tax of note.taxBreakdown) {
        const accountCode =
          tax.taxType === "CGST" ? "1301" :
          tax.taxType === "SGST" ? "1302" :
          tax.taxType === "IGST" ? "1303" : "1300";
        const inputTaxAccount = await accountRepository.findByCode(accountCode);
        if (!inputTaxAccount) {
          throw new ApiError(404, `Input tax account ${accountCode} not found for ${tax.taxName}.`, "TAX_ACCOUNT_NOT_FOUND");
        }
        lineItems.push({
          account: inputTaxAccount._id,
          debitAmount: 0,
          creditAmount: tax.amount,
          description: `${tax.taxName} reversal (${tax.taxCode})`,
        });
      }
    }

    await journalEntryRepository.create({
      voucherNumber: `JE-DN-${note.debitNoteNumber}`,
      remarks: `Debit Note ${note.debitNoteNumber}`,
      totalDebit: note.grandTotal,
      totalCredit: note.grandTotal,
      referenceType: "DebitNote",
      referenceNumber: note.debitNoteNumber,
      lineItems,
      createdBy: note.createdBy,
      status: "Submitted",
    });

    const submittedNote = await debitNoteRepository.submit(id);

    await activityLogService.logActivity({
      action: "Submitted",
      entity: "DebitNote",
      entityId: submittedNote._id,
      entityName: submittedNote.debitNoteNumber,
      description: `Debit Note ${submittedNote.debitNoteNumber} was submitted and posted`,
      category: "business",
      performedBy: submittedNote.createdBy,
      performedByName: "",
    });

    return submittedNote;
  }

  async cancelDebitNote(id) {
    const note = await this.getDebitNoteById(id);

    if (note.status === "Cancelled") {
      throw new ApiError(400, "Debit note already cancelled", "INVALID_STATUS");
    }

    if (note.status === "Submitted") {
      const relatedJournal = await journalEntryRepository.findOne({
        referenceType: "DebitNote",
        referenceNumber: note.debitNoteNumber,
        status: "Submitted",
      });

      if (relatedJournal) {
        await journalEntryRepository.cancel(relatedJournal._id);

        await activityLogService.logActivity({
          action: "Cancelled",
          entity: "JournalEntry",
          entityId: relatedJournal._id,
          entityName: relatedJournal.voucherNumber,
          description: `Journal Entry ${relatedJournal.voucherNumber} was reversed due to cancellation of Debit Note ${note.debitNoteNumber}`,
          category: "business",
          performedBy: note.createdBy,
          performedByName: "",
        });
      }
    }

    const cancelledNote = await debitNoteRepository.cancel(id);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "DebitNote",
      entityId: cancelledNote._id,
      entityName: cancelledNote.debitNoteNumber,
      description: `Debit Note ${cancelledNote.debitNoteNumber} was cancelled`,
      category: "business",
      performedBy: cancelledNote.createdBy,
      performedByName: "",
    });

    return cancelledNote;
  }
}

export default new DebitNoteService();
