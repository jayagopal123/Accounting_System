import mongoose from "mongoose";

const currencyExchangeRateSchema = new mongoose.Schema(
  {
    fromCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    toCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    effectiveDate: {
      type: Date,
      default: Date.now,
      required: true,
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

currencyExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, effectiveDate: -1 });
currencyExchangeRateSchema.index({ isActive: 1 });

export default mongoose.model("CurrencyExchangeRate", currencyExchangeRateSchema);
