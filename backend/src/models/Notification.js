import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "invoice_created",
        "invoice_submitted",
        "invoice_cancelled",
        "payment_received",
        "payment_made",
        "journal_submitted",
        "budget_approved",
        "budget_exceeded",
        "credit_note_issued",
        "debit_note_issued",
        "asset_depreciated",
        "reconciliation_completed",
        "system_alert",
        "general",
      ],
      default: "general",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    entityType: {
      type: String,
      trim: true,
      default: "",
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    link: {
      type: String,
      trim: true,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);
