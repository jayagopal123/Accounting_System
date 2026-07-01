import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    addressType: {
      type: String,
      enum: ["Billing", "Shipping"],
      required: true,
    },
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false },
);

const contactSchema = new mongoose.Schema(
  {
    contactPerson: String,
    phone: {
      type: String,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerGroup: {
      type: String,
      default: "General",
    },

    customerType: {
      type: String,
      default: "Individual",
    },

    territory: {
      type: String,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    panNumber: {
      type: String,
      trim: true,
    },

    taxCategory: {
      type: String,
      trim: true,
    },

    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    openingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentTerms: {
      type: String,
      trim: true,
    },

    creditDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    allowCreditSales: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    addresses: [addressSchema],

    contacts: [contactSchema],

    remarks: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["Draft", "Active", "Inactive", "Blocked"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Customer", customerSchema);
