import mongoose from "mongoose";

const statementEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    withdrawalAmount: { type: Number, default: 0, min: 0 },
    depositAmount: { type: Number, default: 0, min: 0 },
    referenceNumber: { type: String, trim: true, default: "" },
  },
  { _id: true },
);

const bankReconciliationSchema = new mongoose.Schema(
  {
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
    },

    reconciliationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    statementStartDate: {
      type: Date,
      required: true,
    },

    statementEndDate: {
      type: Date,
      required: true,
    },

    openingBalance: {
      type: Number,
      required: true,
    },

    closingBalance: {
      type: Number,
      required: true,
    },

    systemBalance: {
      type: Number,
      required: true,
    },

    difference: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Completed", "Verified"],
      default: "Draft",
    },

    matchedTransactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankTransaction",
      },
    ],

    unmatchedSystemTransactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankTransaction",
      },
    ],

    unmatchedStatementEntries: [statementEntrySchema],

    notes: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

bankReconciliationSchema.index({ bankAccount: 1, status: 1 });
bankReconciliationSchema.index({ bankAccount: 1, reconciliationDate: -1 });
bankReconciliationSchema.index({ status: 1 });

export default mongoose.model("BankReconciliation", bankReconciliationSchema);
