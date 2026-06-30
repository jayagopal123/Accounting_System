import mongoose from "mongoose";

const numberingSeriesSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: [
        "Account",
        "Customer",
        "Supplier",
        "JournalEntry",
        "SalesInvoice",
        "PurchaseInvoice",
        "Payment",
      ],
    },

    prefix: {
      type: String,
      required: true,
      trim: true,
    },

    startingNumber: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    currentNumber: {
      type: Number,
      default: 0,
      min: 0,
    },

    padLength: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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

numberingSeriesSchema.index({ isActive: 1 });

export default mongoose.model("NumberingSeries", numberingSeriesSchema);
