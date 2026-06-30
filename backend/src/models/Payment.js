import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    paymentType: {
      type: String,
      enum: ["Receipt", "Payment"],
      required: true,
    },

    invoiceType: {
      type: String,
      enum: ["SalesInvoice", "PurchaseInvoice"],
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "invoiceType",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "Online", "Other"],
      default: "Bank Transfer",
    },

    referenceNumber: {
      type: String,
      trim: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Submitted", "Cancelled"],
      default: "Draft",
    },

    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JournalEntry",
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

paymentSchema.index({ invoice: 1 });
paymentSchema.index({ invoiceType: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);
