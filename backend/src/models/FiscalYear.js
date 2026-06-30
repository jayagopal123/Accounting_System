import mongoose from "mongoose";

const fiscalYearSchema = new mongoose.Schema(
  {
    yearName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    isDefault: {
      type: Boolean,
      default: false,
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

fiscalYearSchema.index({ status: 1 });
fiscalYearSchema.index({ isDefault: 1 });

export default mongoose.model("FiscalYear", fiscalYearSchema);
