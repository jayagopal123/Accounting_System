import salesInvoiceRepository from "../repositories/SalesInvoiceRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import ApiError from "../utils/ApiError.js";

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

    return salesInvoiceRepository.create(invoiceData);
  }

  async getSalesInvoices() {
    return salesInvoiceRepository.findAll();
  }

  async getSalesInvoiceById(id) {
    const invoice = await salesInvoiceRepository.findById(id);

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

    return salesInvoiceRepository.submit(id);
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

    return salesInvoiceRepository.cancel(id);
  }
}

export default new SalesInvoiceService();