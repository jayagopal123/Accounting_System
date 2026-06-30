import salesInvoiceRepository from "../repositories/SalesInvoiceRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import taxGroupService from "./TaxGroupService.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class SalesInvoiceService {
  async createSalesInvoice(invoiceData) {
    const latestInvoice = await salesInvoiceRepository.getLatestInvoice();

    let invoiceNumber = "SI-00001";

    if (latestInvoice) {
      const lastNumber = parseInt(
        latestInvoice.invoiceNumber.replace("SI-", "")
      );

      invoiceNumber = `SI-${String(lastNumber + 1).padStart(5, "0")}`;
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

    const invoice = await salesInvoiceRepository.create(invoiceData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "SalesInvoice",
      entityId: invoice._id,
      entityName: invoice.invoiceNumber,
      description: `Sales Invoice ${invoice.invoiceNumber} was created for $${grandTotal.toFixed(2)}`,
      category: "business",
      performedBy: invoice.createdBy,
      performedByName: "",
      metadata: { grandTotal, customer: invoiceData.customer },
    });

    return invoice;
  }

  async getSalesInvoices() {
    return salesInvoiceRepository.find({}, "customer");
  }

  async getSalesInvoiceById(id) {
    const invoice = await salesInvoiceRepository.findById(id, "customer");

    if (!invoice) {
      throw new ApiError(
        404,
        "Invoice not found",
        "INVOICE_NOT_FOUND"
      );
    }

    return invoice;
  }

  async updateSalesInvoice(id, data) {
    const invoice = await this.getSalesInvoiceById(id);

    if (invoice.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft invoices can be updated",
        "INVALID_STATUS"
      );
    }

    return salesInvoiceRepository.update(id, data);
  }

  async submitSalesInvoice(id) {
    const invoice = await this.getSalesInvoiceById(id);

    if (invoice.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft invoices can be submitted",
        "INVALID_STATUS"
      );
    }

    const accountsReceivable = await accountRepository.findByCode("1101");
    const salesRevenue = await accountRepository.findByCode("4001");

    if (!accountsReceivable || !salesRevenue) {
      throw new ApiError(
        404,
        "Required accounts not found",
        "ACCOUNT_NOT_FOUND"
      );
    }

    // Build journal entry line items
    const lineItems = [
      {
        account: accountsReceivable._id,
        debitAmount: invoice.grandTotal,
        creditAmount: 0,
        description: "Accounts Receivable",
      },
      {
        account: salesRevenue._id,
        debitAmount: 0,
        creditAmount: invoice.subtotal,
        description: "Sales Revenue",
      },
    ];

    // Add tax liability lines for output taxes (e.g., CGST, SGST, IGST)
    if (invoice.taxBreakdown && invoice.taxBreakdown.length > 0) {
      for (const tax of invoice.taxBreakdown) {
        const accountCode =
          tax.taxType === "CGST" ? "2401" :
          tax.taxType === "SGST" ? "2402" :
          tax.taxType === "IGST" ? "2403" : "2400";
        const outputTaxAccount = await accountRepository.findByCode(accountCode);
        if (!outputTaxAccount) {
          throw new ApiError(404, `Output tax account ${accountCode} not found for ${tax.taxName}. Please create it in Chart of Accounts.`, "TAX_ACCOUNT_NOT_FOUND");
        }
        lineItems.push({
          account: outputTaxAccount._id,
          debitAmount: 0,
          creditAmount: tax.amount,
          description: `${tax.taxName} (${tax.taxCode})`,
        });
      }
    }

    await journalEntryRepository.create({
      voucherNumber: `JE-SI-${invoice.invoiceNumber}`,
      remarks: `Sales Invoice ${invoice.invoiceNumber}`,
      totalDebit: invoice.grandTotal,
      totalCredit: invoice.grandTotal,
      referenceType: "SalesInvoice",
      referenceNumber: invoice.invoiceNumber,
      lineItems,
      createdBy: invoice.createdBy,
      status: "Submitted"
    });

    const submittedInvoice = await salesInvoiceRepository.submit(id);

    await activityLogService.logActivity({
      action: "Submitted",
      entity: "SalesInvoice",
      entityId: submittedInvoice._id,
      entityName: submittedInvoice.invoiceNumber,
      description: `Sales Invoice ${submittedInvoice.invoiceNumber} was submitted and posted`,
      category: "business",
      performedBy: submittedInvoice.createdBy,
      performedByName: "",
    });

    return submittedInvoice;
  }

  async cancelSalesInvoice(id) {
    const invoice = await this.getSalesInvoiceById(id);

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
        referenceType: "SalesInvoice",
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
          description: `Journal Entry ${relatedJournal.voucherNumber} was reversed due to cancellation of Sales Invoice ${invoice.invoiceNumber}`,
          category: "business",
          performedBy: invoice.createdBy,
          performedByName: "",
        });
      }
    }

    const cancelledInvoice = await salesInvoiceRepository.cancel(id);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "SalesInvoice",
      entityId: cancelledInvoice._id,
      entityName: cancelledInvoice.invoiceNumber,
      description: `Sales Invoice ${cancelledInvoice.invoiceNumber} was cancelled`,
      category: "business",
      performedBy: cancelledInvoice.createdBy,
      performedByName: "",
    });

    return cancelledInvoice;
  }
}

export default new SalesInvoiceService();