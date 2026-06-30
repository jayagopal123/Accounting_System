import mongoose from "mongoose";

const taxGroupItemSchema = new mongoose.Schema(
  {
    taxRate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaxRate",
      required: true,
    },
  },
  { _id: false },
);

const taxGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },

    groupCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    taxes: [taxGroupItemSchema],

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

taxGroupSchema.index({ groupCode: 1 });

export default mongoose.model("TaxGroup", taxGroupSchema);
