import mongoose from "mongoose"; // Fixed syntax error
import SalesInvoice from "../models/SalesInvoice.js";
import PurchaseInvoice from "../models/PurchaseInvoice.js";
import CustomerStatementRepository from "../repositories/CustomerStatementRepository.js";
import VendorStatementRepository from "../repositories/VendorStatementRepository.js";
import CustomerAgingRepository from "../repositories/CustomerAgingRepository.js";
import VendorAgingRepository from "../repositories/VendorAgingRepository.js";
import CustomerRepository from "../repositories/CustomerRepository.js";
import SupplierRepository from "../repositories/SupplierRepository.js";
import PaymentRepository from "../repositories/PaymentRepository.js";
import ApiError from "../utils/ApiError.js";

class PaymentSyncService {
  /**
   * Calculate aging buckets for an invoice
   */
  static calculateAgingBuckets(invoiceDate, dueDate, outstandingAmount) {
    const today = new Date();
    const invoiceDateObj = new Date(invoiceDate);
    const dueDateObj = dueDate ? new Date(dueDate) : invoiceDateObj;
    const daysPastDue = Math.max(0, Math.floor((today - dueDateObj) / (1000 * 60 * 60 * 24)));

    const buckets = {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDays: 0,
      overNinetyDays: 0,
    };

    if (daysPastDue <= 0) {
      buckets.current = outstandingAmount;
    } else if (daysPastDue <= 30) {
      buckets.thirtyDays = outstandingAmount;
    } else if (daysPastDue <= 60) {
      buckets.sixtyDays = outstandingAmount;
    } else if (daysPastDue <= 90) {
      buckets.ninetyDays = outstandingAmount;
    } else {
      buckets.overNinetyDays = outstandingAmount;
    }

    return buckets;
  }

  /**
   * Sync payment with sales invoice (Receipt)
   */
  static async syncSalesInvoice(invoiceId, session = null) {
    const invoice = await SalesInvoice.findById(invoiceId).session(session);
    if (!invoice) throw new ApiError(404, "Sales invoice not found");

    const payments = await PaymentRepository.model.find({
      invoice: invoiceId,
      invoiceType: "SalesInvoice",
      status: { $ne: "Cancelled" },
    }).session(session);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid > invoice.grandTotal) {
      throw new ApiError(400, "Total paid amount exceeds invoice total");
    }

    const remainingBalance = invoice.grandTotal - totalPaid;

    let paymentStatus = "Unpaid";
    if (totalPaid === 0) {
      paymentStatus = "Unpaid";
    } else if (remainingBalance === 0) {
      paymentStatus = "Paid";
    } else {
      paymentStatus = "Partially Paid";
    }

    // Update invoice
    invoice.totalPaid = totalPaid;
    invoice.remainingBalance = remainingBalance;
    invoice.paymentStatus = paymentStatus;
    invoice.payments = payments.map(p => p._id);
    await invoice.save({ session });

    // Update or create aging record
    const agingBuckets = this.calculateAgingBuckets(
      invoice.invoiceDate,
      null,
      remainingBalance,
    );

    let agingRecord = await CustomerAgingRepository.findByInvoice(invoiceId);
    if (agingRecord) {
      agingRecord.totalAmount = invoice.grandTotal;
      agingRecord.paidAmount = totalPaid;
      agingRecord.outstandingAmount = remainingBalance;
      agingRecord.agingBuckets = agingBuckets;
      agingRecord.lastUpdated = new Date();
      await agingRecord.save({ session });
    } else {
      await CustomerAgingRepository.create({
        customer: invoice.customer,
        invoice: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        totalAmount: invoice.grandTotal,
        paidAmount: totalPaid,
        outstandingAmount: remainingBalance,
        agingBuckets: agingBuckets,
      }, { session });
    }

    return invoice;
  }

  /**
   * Sync payment with purchase invoice (Payment)
   */
  static async syncPurchaseInvoice(invoiceId, session = null) {
    const invoice = await PurchaseInvoice.findById(invoiceId).session(session);
    if (!invoice) throw new ApiError(404, "Purchase invoice not found");

    const payments = await PaymentRepository.model.find({
      invoice: invoiceId,
      invoiceType: "PurchaseInvoice",
      status: { $ne: "Cancelled" },
    }).session(session);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid > invoice.grandTotal) {
      throw new ApiError(400, "Total paid amount exceeds invoice total");
    }

    const remainingBalance = invoice.grandTotal - totalPaid;

    let paymentStatus = "Unpaid";
    if (totalPaid === 0) {
      paymentStatus = "Unpaid";
    } else if (remainingBalance === 0) {
      paymentStatus = "Paid";
    } else {
      paymentStatus = "Partially Paid";
    }

    // Update invoice
    invoice.totalPaid = totalPaid;
    invoice.remainingBalance = remainingBalance;
    invoice.paymentStatus = paymentStatus;
    invoice.payments = payments.map(p => p._id);
    await invoice.save({ session });

    // Update or create aging record
    const agingBuckets = this.calculateAgingBuckets(
      invoice.invoiceDate,
      null,
      remainingBalance,
    );

    let agingRecord = await VendorAgingRepository.findByInvoice(invoiceId);
    if (agingRecord) {
      agingRecord.totalAmount = invoice.grandTotal;
      agingRecord.paidAmount = totalPaid;
      agingRecord.outstandingAmount = remainingBalance;
      agingRecord.agingBuckets = agingBuckets;
      agingRecord.lastUpdated = new Date();
      await agingRecord.save({ session });
    } else {
      await VendorAgingRepository.create({
        supplier: invoice.supplier,
        invoice: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        totalAmount: invoice.grandTotal,
        paidAmount: totalPaid,
        outstandingAmount: remainingBalance,
        agingBuckets: agingBuckets,
      }, { session });
    }

    return invoice;
  }

  /**
   * Add entry to customer statement
   */
  static async addCustomerStatementEntry(
    customerId,
    transactionData,
    session = null,
  ) {
    // Get previous balance
    const lastStatement = await CustomerStatementRepository.findLatestByCustomer(
      customerId,
    );
    let previousBalance = 0;
    if (lastStatement) {
      previousBalance = lastStatement.runningBalance;
    } else {
      const customer = await CustomerRepository.findById(customerId);
      if (customer && customer.openingBalance) {
        previousBalance = customer.openingBalance;
      }
    }

    const newBalance =
      previousBalance + transactionData.debitAmount - transactionData.creditAmount;

    return await CustomerStatementRepository.create(
      {
        customer: customerId,
        ...transactionData,
        runningBalance: newBalance,
      },
      { session },
    );
  }

  /**
   * Add entry to vendor statement
   */
  static async addVendorStatementEntry(
    supplierId,
    transactionData,
    session = null,
  ) {
    const lastStatement = await VendorStatementRepository.findLatestBySupplier(
      supplierId,
    );
    let previousBalance = 0;
    if (lastStatement) {
      previousBalance = lastStatement.runningBalance;
    } else {
      const supplier = await SupplierRepository.findById(supplierId);
      if (supplier && supplier.openingBalance) {
      previousBalance = supplier.openingBalance;
      }
    }

    const newBalance =
      previousBalance + transactionData.debitAmount - transactionData.creditAmount;

    return await VendorStatementRepository.create(
      {
        supplier: supplierId,
        ...transactionData,
        runningBalance: newBalance,
      },
      { session },
    );
  }

  /**
   * Handle payment creation and sync all
   */
  static async handlePaymentCreated(payment, session = null) {
    if (payment.paymentType === "Receipt") {
      await this.syncSalesInvoice(payment.invoice, session);
      
      await this.addCustomerStatementEntry(payment.customer, {
        date: payment.paymentDate,
        transactionType: "Receipt",
        referenceType: "Payment",
        referenceId: payment._id,
        referenceNumber: payment.paymentNumber,
        description: "Receipt against invoice payment",
        debitAmount: 0,
        creditAmount: payment.amount,
        createdBy: payment.createdBy,
      }, session);
    } else {
      await this.syncPurchaseInvoice(payment.invoice, session);
      await this.addVendorStatementEntry(payment.supplier, {
        date: payment.paymentDate,
        transactionType: "Payment",
        referenceType: "Payment",
        referenceId: payment._id,
        referenceNumber: payment.paymentNumber,
        description: "Payment to supplier",
        debitAmount: payment.amount,
        creditAmount: 0,
        createdBy: payment.createdBy,
      }, session);
    }
  }

  /**
   * Recalculate all statements for customer (after deletion/update)
   */
  static async recalculateCustomerStatements(customerId, session = null) {
    // Delete existing statements for later
  }
}

export default PaymentSyncService;
