const Joi = require("joi");

const createAccountSchema = Joi.object({
  companyId: Joi.string().required(),

  accountCode: Joi.string()
    .trim()
    .required(),

  accountName: Joi.string()
    .trim()
    .required(),

  accountType: Joi.string()
    .valid(
      "ASSET",
      "LIABILITY",
      "EQUITY",
      "INCOME",
      "EXPENSE"
    )
    .required(),

  parentAccount: Joi.string()
    .allow(null, ""),

  isGroup: Joi.boolean(),

  currency: Joi.string(),

  description: Joi.string()
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "ACTIVE",
      "INACTIVE"
    )
    .required()
});

module.exports = {
  createAccountSchema,
  updateStatusSchema
};