import mongoose from "mongoose";

const vendorStatementSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    transactionType: {
      type: String,
      enum: [
        "Opening Balance",
        "Invoice",
        "Payment",
        "Credit Note",
        "Debit Note",
      ],
      required: true,
    },

    referenceType: {
      type: String,
      enum: [
        "PurchaseInvoice",
        "Payment",
        "CreditNote",
        "DebitNote",
      ],
      default: null,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceNumber: {
      type: String,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    debitAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    creditAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    runningBalance: {
      type: Number,
      required: true,
    },

    isOpeningBalance: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicates
vendorStatementSchema.index(
  { supplier: 1, referenceType: 1, referenceId: 1 },
  { unique: true, sparse: true },
);

export default mongoose.model("VendorStatement", vendorStatementSchema);
