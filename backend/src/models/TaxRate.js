import mongoose from "mongoose";

const taxRateSchema = new mongoose.Schema(
  {
    taxName: {
      type: String,
      required: true,
      trim: true,
    },

    taxCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    taxType: {
      type: String,
      enum: ["CGST", "SGST", "IGST", "CESS", "OTHER"],
      required: true,
    },

    effectiveFrom: {
      type: Date,
      default: Date.now,
    },

    effectiveTo: {
      type: Date,
      default: null,
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

taxRateSchema.index({ taxCode: 1 });
taxRateSchema.index({ taxType: 1, isActive: 1 });

export default mongoose.model("TaxRate", taxRateSchema);
