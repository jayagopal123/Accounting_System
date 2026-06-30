import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    bankName: {
      type: String,
      required: true,
      trim: true,
    },

    branchName: {
      type: String,
      trim: true,
    },

    ifscCode: {
      type: String,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["Savings", "Current", "Overdraft", "Fixed Deposit", "Other"],
      default: "Current",
    },

    openingBalance: {
      type: Number,
      default: 0,
    },

    currentBalance: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

bankAccountSchema.index({ accountNumber: 1 });
bankAccountSchema.index({ bankName: 1 });
bankAccountSchema.index({ isActive: 1 });

export default mongoose.model("BankAccount", bankAccountSchema);
