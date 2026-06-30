import mongoose from "mongoose";

const assetCategorySchema = new mongoose.Schema(
  {
    categoryCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    defaultUsefulLife: {
      type: Number, // in months
      required: true,
      min: 1,
    },

    defaultDepreciationMethod: {
      type: String,
      enum: ["StraightLine", "WrittenDownValue", "SumOfYearsDigits", "None"],
      default: "StraightLine",
    },

    defaultSalvageValuePercent: {
      type: Number,
      default: 5, // 5% of cost
      min: 0,
      max: 100,
    },

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

assetCategorySchema.index({ categoryCode: 1 }, { unique: true });
assetCategorySchema.index({ isActive: 1 });

export default mongoose.model("AssetCategory", assetCategorySchema);
