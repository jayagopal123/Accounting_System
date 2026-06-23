import purchaseInvoiceRepository from "../repositories/PurchaseInvoiceRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import ApiError from "../utils/ApiError.js";

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

    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;

    invoiceData.invoiceNumber = invoiceNumber;
    invoiceData.subtotal = subtotal;
    invoiceData.taxAmount = taxAmount;
    invoiceData.grandTotal = grandTotal;

    return purchaseInvoiceRepository.create(invoiceData);
  }

  async getPurchaseInvoices() {
    return purchaseInvoiceRepository.findAll();
  }

  async getPurchaseInvoiceById(id) {
    const invoice =
      await purchaseInvoiceRepository.findById(id);

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

    await journalEntryRepository.create({
      voucherNumber: `JE-PI-${invoice.invoiceNumber}`,
      remarks: `Purchase Invoice ${invoice.invoiceNumber}`,
      totalDebit: invoice.grandTotal,
      totalCredit: invoice.grandTotal,
      status: "Submitted",
      createdBy: invoice.createdBy,
      lineItems: [
        {
          account: purchaseExpense._id,
          debitAmount: invoice.grandTotal,
          creditAmount: 0,
        },
        {
          account: accountsPayable._id,
          debitAmount: 0,
          creditAmount: invoice.grandTotal,
        },
      ],
    });

    return purchaseInvoiceRepository.submit(id);
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

    return purchaseInvoiceRepository.cancel(id);
  }
}

export default new PurchaseInvoiceService();