import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountCode: {
      type: String,
      required: true,
      trim: true
    },

    accountName: {
      type: String,
      required: true,
      trim: true
    },

    accountType: {
      type: String,
      enum: [
        "ASSET",
        "LIABILITY",
        "EQUITY",
        "INCOME",
        "EXPENSE"
      ],
      required: true
    },

    parentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null
    },

    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account"
      }
    ],

    isGroup: {
      type: Boolean,
      default: false
    },

    level: {
      type: Number,
      default: 1
    },

    amount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },

    description: {
      type: String,
      trim: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

accountSchema.index(
  {
    accountCode: 1
  },
  {
    unique: true
  }
);

accountSchema.index({
  parentAccount: 1
});

accountSchema.index({
  ancestors: 1
});

export default mongoose.model(
  "Account",
  accountSchema
);
