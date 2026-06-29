import salesInvoiceRepository from "../repositories/SalesInvoiceRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
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

    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;

    invoiceData.invoiceNumber = invoiceNumber;
    invoiceData.subtotal = subtotal;
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

    await journalEntryRepository.create({
      voucherNumber: `JE-SI-${invoice.invoiceNumber}`,
      remarks: `Sales Invoice ${invoice.invoiceNumber}`,
      totalDebit: invoice.grandTotal,
      totalCredit: invoice.grandTotal,
      lineItems: [
        {
          account: accountsReceivable._id,
          debitAmount: invoice.grandTotal,
          creditAmount: 0
        },
        {
          account: salesRevenue._id,
          debitAmount: 0,
          creditAmount: invoice.grandTotal
        }
      ],
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