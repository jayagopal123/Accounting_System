import mongoose from "mongoose";

const customerAgingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesInvoice",
      required: true,
    },

    invoiceNumber: {
      type: String,
      trim: true,
      required: true,
    },

    invoiceDate: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    agingBuckets: {
      current: {
        type: Number,
        default: 0,
      },
      thirtyDays: {
        type: Number,
        default: 0,
      },
      sixtyDays: {
        type: Number,
        default: 0,
      },
      ninetyDays: {
        type: Number,
        default: 0,
      },
      overNinetyDays: {
        type: Number,
        default: 0,
      },
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Unique index on customer + invoice
customerAgingSchema.index(
  { customer: 1, invoice: 1 },
  { unique: true },
);

export default mongoose.model("CustomerAging", customerAgingSchema);
