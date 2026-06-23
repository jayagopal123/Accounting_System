import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    addressType: {
      type: String,
      enum: ["Billing", "Shipping"],
      required: true
    },
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    contactPerson: String,

    phone: {
      type: String,
      trim: true
    },

    mobile: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    }
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
  {
    supplierCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    supplierName: {
      type: String,
      required: true,
      trim: true
    },

    supplierGroup: {
      type: String,
      default: "General"
    },

    supplierType: {
      type: String,
      default: "Individual"
    },

    territory: {
      type: String,
      trim: true
    },

    defaultCurrency: {
      type: String,
      default: "INR"
    },

    company: {
      type: String,
      trim: true
    },

    gstNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },

    panNumber: {
      type: String,
      trim: true
    },

    taxCategory: {
      type: String,
      trim: true
    },

    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },

    openingBalance: {
      type: Number,
      default: 0,
      min: 0
    },

    paymentTerms: {
      type: String,
      trim: true
    },

    creditDays: {
      type: Number,
      default: 0,
      min: 0
    },

    allowCreditPurchase: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    addresses: [addressSchema],

    contacts: [contactSchema],

    remarks: {
      type: String,
      trim: true
    },

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    status: {
      type: String,
      enum: ["Draft", "Active", "Inactive", "Blocked"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Supplier", supplierSchema);