import mongoose from "mongoose";

const journalLineSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
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

    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const journalEntrySchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
      required: true,
    },

    referenceType: {
      type: String,
      trim: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
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

    totalDebit: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCredit: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineItems: [journalLineSchema],

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

export default mongoose.model(
  "JournalEntry",
  journalEntrySchema,
);