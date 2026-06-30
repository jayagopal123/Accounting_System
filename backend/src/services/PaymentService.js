import paymentRepository from "../repositories/PaymentRepository.js";
import journalEntryRepository from "../repositories/JournalEntryRepository.js";
import accountRepository from "../repositories/AccountRepository.js";
import salesInvoiceRepository from "../repositories/SalesInvoiceRepository.js";
import purchaseInvoiceRepository from "../repositories/PurchaseInvoiceRepository.js";
import bankTransactionRepository from "../repositories/BankTransactionRepository.js";
import bankAccountRepository from "../repositories/BankAccountRepository.js";
import bankAccountService from "./BankAccountService.js";
import ApiError from "../utils/ApiError.js";
import activityLogService from "./ActivityLogService.js";

class PaymentService {
  async createPayment(paymentData) {
    const latestPayment = await paymentRepository.getLatestPayment();

    let paymentNumber = "PMT-00001";
    if (latestPayment) {
      const lastNumber = parseInt(
        latestPayment.paymentNumber.replace(/^(PMT|RCT)-/, ""),
        10,
      );
      paymentNumber = `PMT-${String(lastNumber + 1).padStart(5, "0")}`;
    }

    paymentData.paymentNumber = paymentNumber;

    // Resolve customer/supplier from invoice and validate it is Submitted
    if (paymentData.invoiceType === "SalesInvoice") {
      const invoice = await salesInvoiceRepository.findById(
        paymentData.invoice,
      );
      if (!invoice) {
        throw new ApiError(404, "Sales invoice not found", "INVOICE_NOT_FOUND");
      }
      if (invoice.status !== "Submitted") {
        throw new ApiError(
          400,
          "Cannot create payment against a non-submitted sales invoice",
          "INVOICE_NOT_SUBMITTED",
        );
      }
      paymentData.customer = invoice.customer;
    } else {
      const invoice = await purchaseInvoiceRepository.findById(
        paymentData.invoice,
      );
      if (!invoice) {
        throw new ApiError(
          404,
          "Purchase invoice not found",
          "INVOICE_NOT_FOUND",
        );
      }
      if (invoice.status !== "Submitted") {
        throw new ApiError(
          400,
          "Cannot create payment against a non-submitted purchase invoice",
          "INVOICE_NOT_SUBMITTED",
        );
      }
      paymentData.supplier = invoice.supplier;
    }

    const payment = await paymentRepository.create(paymentData);

    await activityLogService.logActivity({
      action: "Created",
      entity: "Payment",
      entityId: payment._id,
      entityName: payment.paymentNumber,
      description: `${payment.paymentType} ${payment.paymentNumber} was created for ${payment.invoiceType}`,
      category: "business",
      performedBy: payment.createdBy,
      performedByName: "",
    });

    return payment;
  }

  async getPayments() {
    return paymentRepository.find({}, [
      { path: "customer", select: "customerName customerCode" },
      { path: "supplier", select: "supplierName supplierCode" },
      { path: "account", select: "accountCode accountName" },
    ]);
  }

  async getPaymentById(id) {
    const payment = await paymentRepository.findById(id, [
      { path: "customer", select: "customerName customerCode" },
      { path: "supplier", select: "supplierName supplierCode" },
      { path: "account", select: "accountCode accountName" },
      { path: "journalEntry" },
    ]);

    if (!payment) {
      throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
    }

    return payment;
  }

  async submitPayment(id) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
    }

    if (payment.status !== "Draft") {
      throw new ApiError(
        400,
        "Only draft payments can be submitted",
        "INVALID_STATUS",
      );
    }

    // Find the Cash/Bank account
    const cashAccount = await accountRepository.findById(payment.account);
    if (!cashAccount) {
      throw new ApiError(404, "Cash/Bank account not found", "ACCOUNT_NOT_FOUND");
    }

    let debitAccount, creditAccount;

    if (payment.paymentType === "Receipt") {
      // Receipt: Customer pays us → Dr. Cash, Cr. Receivables
      debitAccount = cashAccount;
      const accountsReceivable = await accountRepository.findByCode("1101");
      if (!accountsReceivable) {
        throw new ApiError(
          404,
          "Accounts Receivable account not found",
          "ACCOUNT_NOT_FOUND",
        );
      }
      creditAccount = accountsReceivable;
    } else {
      // Payment: We pay supplier → Dr. Payables, Cr. Cash
      const accountsPayable = await accountRepository.findByCode("2001");
      if (!accountsPayable) {
        throw new ApiError(
          404,
          "Accounts Payable account not found",
          "ACCOUNT_NOT_FOUND",
        );
      }
      debitAccount = accountsPayable;
      creditAccount = cashAccount;
    }

    const entityName =
      payment.paymentType === "Receipt"
        ? `Receipt ${payment.paymentNumber}`
        : `Payment ${payment.paymentNumber}`;

    // Create reversing Journal Entry
    const journal = await journalEntryRepository.create({
      voucherNumber: `JE-${payment.paymentNumber}`,
      date: payment.paymentDate || new Date(),
      referenceType: "Payment",
      referenceNumber: payment.paymentNumber,
      remarks: `${payment.paymentType} against ${payment.invoiceType} — ${entityName}`,
      totalDebit: payment.amount,
      totalCredit: payment.amount,
      status: "Submitted",
      createdBy: payment.createdBy,
      lineItems: [
        {
          account: debitAccount._id,
          debitAmount:
            payment.paymentType === "Receipt" ? payment.amount : 0,
          creditAmount:
            payment.paymentType === "Payment" ? payment.amount : 0,
          description:
            payment.paymentType === "Receipt"
              ? `Cash/Bank received from customer`
              : `Cash/Bank paid to supplier`,
        },
        {
          account: creditAccount._id,
          debitAmount:
            payment.paymentType === "Payment" ? payment.amount : 0,
          creditAmount:
            payment.paymentType === "Receipt" ? payment.amount : 0,
          description:
            payment.paymentType === "Receipt"
              ? `Accounts Receivable reduced`
              : `Accounts Payable settled`,
        },
      ],
    });

    // Update payment with journal reference and mark submitted
    const submittedPayment = await paymentRepository.submit(id);

    // Also update the payment with the journal entry reference
    await paymentRepository.update(id, { journalEntry: journal._id });

    // Create bank transaction for Bank Transfer / Cheque / Online payments
    if (["Bank Transfer", "Cheque", "Online"].includes(payment.paymentMethod)) {
      try {
        // Find a bank account linked to the cash/bank account
        const bankAccount = await bankAccountRepository.findOne({
          isActive: true,
        });

        if (bankAccount) {
          await bankTransactionRepository.create({
            bankAccount: bankAccount._id,
            transactionDate: payment.paymentDate || new Date(),
            transactionType:
              payment.paymentType === "Receipt" ? "Deposit" : "Withdrawal",
            amount: payment.amount,
            description: `${payment.paymentType} ${payment.paymentNumber} - ${payment.invoiceType}`,
            referenceType: "Payment",
            referenceId: payment._id,
            referenceNumber: payment.paymentNumber,
            paymentMethod: payment.paymentMethod,
            chequeNumber:
              payment.paymentMethod === "Cheque"
                ? payment.referenceNumber || ""
                : "",
            status: payment.paymentMethod === "Cheque" ? "Pending" : "Cleared",
            createdBy: payment.createdBy,
          });

          // Recalculate bank balance
          await bankAccountService.recalculateBalance(bankAccount._id);
        }
      } catch (err) {
        // Log but don't fail payment submission if bank transaction creation fails
        console.error(
          `Failed to create bank transaction for payment ${payment.paymentNumber}:`,
          err.message,
        );
      }
    }

    await activityLogService.logActivity({
      action: "Submitted",
      entity: "Payment",
      entityId: submittedPayment._id,
      entityName: submittedPayment.paymentNumber,
      description: `${payment.paymentType} ${payment.paymentNumber} was submitted — Journal Entry ${journal.voucherNumber} created`,
      category: "business",
      performedBy: payment.createdBy,
      performedByName: "",
    });

    // Fetch the updated payment with populated fields
    return this.getPaymentById(id);
  }

  async cancelPayment(id) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new ApiError(404, "Payment not found", "PAYMENT_NOT_FOUND");
    }

    if (payment.status === "Cancelled") {
      throw new ApiError(
        400,
        "Payment already cancelled",
        "INVALID_STATUS",
      );
    }

    // If the payment was submitted, also cancel the related Journal Entry
    if (payment.status === "Submitted" && payment.journalEntry) {
      await journalEntryRepository.cancel(payment.journalEntry);

      await activityLogService.logActivity({
        action: "Cancelled",
        entity: "JournalEntry",
        entityId: payment.journalEntry,
        entityName: `JE-${payment.paymentNumber}`,
        description: `Journal Entry JE-${payment.paymentNumber} was reversed due to cancellation of ${payment.paymentType} ${payment.paymentNumber}`,
        category: "business",
        performedBy: payment.createdBy,
        performedByName: "",
      });
    }

    const cancelledPayment = await paymentRepository.cancel(id);

    await activityLogService.logActivity({
      action: "Cancelled",
      entity: "Payment",
      entityId: cancelledPayment._id,
      entityName: cancelledPayment.paymentNumber,
      description: `${payment.paymentType} ${payment.paymentNumber} was cancelled`,
      category: "business",
      performedBy: payment.createdBy,
      performedByName: "",
    });

    return cancelledPayment;
  }
}

export default new PaymentService();
