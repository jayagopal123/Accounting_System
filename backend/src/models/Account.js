const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

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

    currency: {
      type: String,
      default: "USD"
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
    companyId: 1,
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

module.exports = mongoose.model(
  "Account",
  accountSchema
);