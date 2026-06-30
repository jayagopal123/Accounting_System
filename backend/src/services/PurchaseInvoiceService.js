import purchaseInvoiceRepository from "../repositories/PurchaseInvoiceRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import taxGroupService from "./TaxGroupService.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class PurchaseInvoiceService {
  async createPurchaseInvoice(invoiceData) {
    const latestInvoice =
      await purchaseInvoiceRepository.getLatestInvoice();

    let invoiceNumber = "PI-00001";

    if (latestInvoice) {
      const lastNumber = parseInt(
        latestInvoice.invoiceNumber.replace("PI-", "")
      );

      invoiceNumber = `PI-${String(lastNumber + 1).padStart(5, "0")}`;
    }

    let subtotal = 0;

    for (const item of invoiceData.items) {
      item.amount = item.quantity * item.rate;
      subtotal += item.amount;
    }

    let taxAmount = 0;
    let taxBreakdown = [];

    if (invoiceData.taxGroup) {
      const taxResult = await taxGroupService.calculateTax(invoiceData.taxGroup, subtotal);
      taxBreakdown = taxResult.taxBreakdown;
      taxAmount = taxResult.totalTax;
    }

    const grandTotal = subtotal + taxAmount;

    invoiceData.invoiceNumber = invoiceNumber;
    invoiceData.subtotal = subtotal;
    invoiceData.taxBreakdown = taxBreakdown;
    invoiceData.taxAmount = taxAmount;
    invoiceData.grandTotal = grandTotal;

    const invoice = await purchaseInvoiceRepository.create(invoiceData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "PurchaseInvoice",
      entityId: invoice._id,
      entityName: invoice.invoiceNumber,
      description: `Purchase Invoice ${invoice.invoiceNumber} was created for $${grandTotal.toFixed(2)}`,
      category: "business",
      performedBy: invoice.createdBy,
      performedByName: "",
      metadata: { grandTotal, supplier: invoiceData.supplier },
    });

    return invoice;
  }

  async getPurchaseInvoices() {
    return purchaseInvoiceRepository.find({}, "supplier");
  }

  async getPurchaseInvoiceById(id) {
    const invoice =
      await purchaseInvoiceRepository.findById(id, "supplier");

    if (!invoice) {
      throw new ApiError(
        404,
        "Purchase invoice not found",
        "PURCHASE_INVOICE_NOT_FOUND"
      );
    }

    return invoice;
  }

  async updatePurchaseInvoice(id, data) {
    const invoice = await this.getPurchaseInvoiceById(id);

    if (invoice.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft invoices can be updated",
        "INVALID_STATUS"
      );
    }

    return purchaseInvoiceRepository.update(id, data);
  }

  async submitPurchaseInvoice(id) {
    const invoice = await this.getPurchaseInvoiceById(id);

    if (invoice.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft invoices can be submitted",
        "INVALID_STATUS"
      );
    }

    const purchaseExpense =
      await accountRepository.findByCode("5001");

    const accountsPayable =
      await accountRepository.findByCode("2001");

    if (!purchaseExpense || !accountsPayable) {
      throw new ApiError(
        404,
        "Required accounts not found",
        "ACCOUNT_NOT_FOUND"
      );
    }

    // Build journal entry line items
    const lineItems = [
      {
        account: purchaseExpense._id,
        debitAmount: invoice.subtotal,
        creditAmount: 0,
        description: "Purchase Expense",
      },
    ];

    // Add input tax receivable lines (e.g., CGST, SGST, IGST)
    if (invoice.taxBreakdown && invoice.taxBreakdown.length > 0) {
      for (const tax of invoice.taxBreakdown) {
        const accountCode =
          tax.taxType === "CGST" ? "1301" :
          tax.taxType === "SGST" ? "1302" :
          tax.taxType === "IGST" ? "1303" : "1300";
        const inputTaxAccount = await accountRepository.findByCode(accountCode);
        if (!inputTaxAccount) {
          throw new ApiError(404, `Input tax account ${accountCode} not found for ${tax.taxName}. Please create it in Chart of Accounts.`, "TAX_ACCOUNT_NOT_FOUND");
        }
        lineItems.push({
          account: inputTaxAccount._id,
          debitAmount: tax.amount,
          creditAmount: 0,
          description: `${tax.taxName} (${tax.taxCode})`,
        });
      }
    }

    lineItems.push({
      account: accountsPayable._id,
      debitAmount: 0,
      creditAmount: invoice.grandTotal,
      description: "Accounts Payable",
    });

    await journalEntryRepository.create({
      voucherNumber: `JE-PI-${invoice.invoiceNumber}`,
      remarks: `Purchase Invoice ${invoice.invoiceNumber}`,
      totalDebit: invoice.grandTotal,
      totalCredit: invoice.grandTotal,
      referenceType: "PurchaseInvoice",
      referenceNumber: invoice.invoiceNumber,
      status: "Submitted",
      createdBy: invoice.createdBy,
      lineItems,
    });

    const submittedInvoice = await purchaseInvoiceRepository.submit(id);

    await activityLogService.logActivity({
      action: "Submitted",
      entity: "PurchaseInvoice",
      entityId: submittedInvoice._id,
      entityName: submittedInvoice.invoiceNumber,
      description: `Purchase Invoice ${submittedInvoice.invoiceNumber} was submitted and approved`,
      category: "business",
      performedBy: submittedInvoice.createdBy,
      performedByName: "",
    });

    return submittedInvoice;
  }

  async cancelPurchaseInvoice(id) {
    const invoice = await this.getPurchaseInvoiceById(id);

    if (invoice.status === "Cancelled") {
      throw new ApiError(
        400,
        "Invoice already cancelled",
        "INVALID_STATUS"
      );
    }

    // If the invoice was already Submitted, also cancel the related Journal Entry
    if (invoice.status === "Submitted") {
      const relatedJournal = await journalEntryRepository.findOne({
        referenceType: "PurchaseInvoice",
        referenceNumber: invoice.invoiceNumber,
        status: "Submitted"
      });

      if (relatedJournal) {
        await journalEntryRepository.cancel(relatedJournal._id);

        await activityLogService.logActivity({
          action: "Cancelled",
          entity: "JournalEntry",
          entityId: relatedJournal._id,
          entityName: relatedJournal.voucherNumber,
          description: `Journal Entry ${relatedJournal.voucherNumber} was reversed due to cancellation of Purchase Invoice ${invoice.invoiceNumber}`,
          category: "business",
          performedBy: invoice.createdBy,
          performedByName: "",
        });
      }
    }

    const cancelledInvoice = await purchaseInvoiceRepository.cancel(id);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "PurchaseInvoice",
      entityId: cancelledInvoice._id,
      entityName: cancelledInvoice.invoiceNumber,
      description: `Purchase Invoice ${cancelledInvoice.invoiceNumber} was cancelled`,
      category: "business",
      performedBy: cancelledInvoice.createdBy,
      performedByName: "",
    });

    return cancelledInvoice;
  }
}

export default new PurchaseInvoiceService();