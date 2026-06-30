import mongoose from "mongoose";

const budgetLineSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const budgetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    fiscalYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FiscalYear",
      required: true,
    },

    costCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CostCenter",
      default: null,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Approved", "Closed"],
      default: "Draft",
    },

    lineItems: [budgetLineSchema],

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

budgetSchema.index({ fiscalYear: 1, status: 1 });
budgetSchema.index({ costCenter: 1 });

// Auto-calculate totalAmount before saving
budgetSchema.pre("save", function (next) {
  if (this.lineItems && this.lineItems.length > 0) {
    this.totalAmount = this.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }
  next();
});

export default mongoose.model("Budget", budgetSchema);
