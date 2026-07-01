import Joi from "joi";

export const createCustomerSchema = Joi.object({
  customerCode: Joi.string().required(),

  customerName: Joi.string().required(),

  customerGroup: Joi.string(),

  customerType: Joi.string(),

  territory: Joi.string(),

  company: Joi.string(),

  gstNumber: Joi.string(),

  panNumber: Joi.string(),

  taxCategory: Joi.string(),

  creditLimit: Joi.number().min(0),

  openingBalance: Joi.number().min(0),

  paymentTerms: Joi.string(),

  creditDays: Joi.number().min(0),

  allowCreditSales: Joi.boolean(),

  remarks: Joi.string(),

  tags: Joi.array().items(Joi.string()),

  addresses: Joi.array().items(
    Joi.object({
      addressType: Joi.string()
        .valid("Billing", "Shipping")
        .required(),

      addressLine1: Joi.string(),

      addressLine2: Joi.string(),

      city: Joi.string(),

      state: Joi.string(),

      country: Joi.string(),

      postalCode: Joi.string()
    })
  ),

  contacts: Joi.array().items(
    Joi.object({
      contactPerson: Joi.string(),

      phone: Joi.string(),

      mobile: Joi.string(),

      email: Joi.string().email()
    })
  )
});

export const updateCustomerSchema = createCustomerSchema.fork(
  ["customerCode", "customerName"],
  field => field.optional()
);