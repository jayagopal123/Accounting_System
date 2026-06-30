import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    assetName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true,
    },

    // Financial details
    purchaseDate: {
      type: Date,
      required: true,
    },

    purchaseCost: {
      type: Number,
      required: true,
      min: 0,
    },

    usefulLife: {
      type: Number, // in months
      required: true,
      min: 1,
    },

    depreciationMethod: {
      type: String,
      enum: ["StraightLine", "WrittenDownValue", "SumOfYearsDigits", "None"],
      default: "StraightLine",
    },

    salvageValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentValue: {
      type: Number,
      default: 0,
    },

    accumulatedDepreciation: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastDepreciationDate: {
      type: Date,
      default: null,
    },

    nextDepreciationDate: {
      type: Date,
      default: null,
    },

    // GL account mappings (can override category defaults)
    glAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    depreciationExpenseAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    accumulatedDepreciationAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    // Status tracking
    status: {
      type: String,
      enum: ["Draft", "Active", "Depreciated", "Disposed", "Sold", "WrittenOff"],
      default: "Draft",
    },

    disposalDate: {
      type: Date,
      default: null,
    },

    disposalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    disposalRemarks: {
      type: String,
      trim: true,
    },

    // Location / assignment
    location: {
      type: String,
      trim: true,
    },

    assignedTo: {
      type: String,
      trim: true,
    },

    // Vendor info
    vendorName: {
      type: String,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      trim: true,
    },

    serialNumber: {
      type: String,
      trim: true,
    },

    // System fields
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

assetSchema.index({ assetCode: 1 }, { unique: true });
assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ purchaseDate: -1 });

export default mongoose.model("Asset", assetSchema);
