import mongoose from "mongoose";

const taxBreakdownItemSchema = new mongoose.Schema(
  {
    taxName: { type: String, required: true },
    taxCode: { type: String, required: true },
    taxType: { type: String, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

const debitNoteItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const debitNoteSchema = new mongoose.Schema(
  {
    debitNoteNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseInvoice",
      default: null,
    },

    debitNoteDate: {
      type: Date,
      default: Date.now,
    },

    items: [debitNoteItemSchema],

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaxGroup",
      default: null,
    },

    taxBreakdown: [taxBreakdownItemSchema],

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Submitted", "Cancelled"],
      default: "Draft",
    },

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

export default mongoose.model("DebitNote", debitNoteSchema);
