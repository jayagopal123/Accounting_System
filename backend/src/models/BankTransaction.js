import mongoose from "mongoose";

const bankTransactionSchema = new mongoose.Schema(
  {
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },

    transactionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    transactionType: {
      type: String,
      enum: ["Deposit", "Withdrawal", "Transfer"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    referenceType: {
      type: String,
      enum: ["Payment", "SalesInvoice", "PurchaseInvoice", "JournalEntry", "Manual", "Transfer", "Interest", "Charge", "Other"],
      default: "Manual",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cheque", "Online", "Cash", "Other"],
      default: "Bank Transfer",
    },

    chequeNumber: {
      type: String,
      trim: true,
      default: "",
    },

    chequeDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Cleared", "Pending", "Bounced", "Cancelled"],
      default: "Pending",
    },

    reconciliationStatus: {
      type: String,
      enum: ["Unreconciled", "Reconciled", "Partial"],
      default: "Unreconciled",
    },

    reconciledAt: {
      type: Date,
      default: null,
    },

    reconciledIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankReconciliation",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

bankTransactionSchema.index({ bankAccount: 1, transactionDate: -1 });
bankTransactionSchema.index({ bankAccount: 1, reconciliationStatus: 1 });
bankTransactionSchema.index({ referenceType: 1, referenceId: 1 });
bankTransactionSchema.index({ status: 1 });
bankTransactionSchema.index({ chequeNumber: 1 });

export default mongoose.model("BankTransaction", bankTransactionSchema);
