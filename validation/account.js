const Joi = require('joi');

const createSchema = Joi.object({
  email: Joi.string().email().required(),
  accountNumber: Joi.number().integer().max(9999999999).required(),
  account_type: Joi.string().valid('Savings', 'Current', 'Fixed').required()
})

const otherCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  accountNumber: Joi.number().integer().required(),
  account_type: Joi.string().valid('Savings', 'Current', 'Fixed').required(),
  currency: Joi.string().length(3).required()
})

const depositSchema = Joi.object({
  Amount : Joi.number().integer().precision(2).positive().required(),
  Destination_account: Joi.number().integer().required(),
})

const withdrawalSchema = Joi.object({
  Amount : Joi.number().integer().precision(2).positive().required(),
  Source_account: Joi.number().integer().required(),
})

const closeSchema = Joi.object({
  account_number: Joi.number().integer().required(),
  role: Joi.string().required()
})

const billSchema = Joi.object({
  Source_account: Joi.number().integer().required(),
  Amount: Joi.number().integer().precision(2).positive().required(),
  Bill_type: Joi.string().valid('airtime', 'betting', 'electricity', 'subscription').required()
})

module.exports = { 
  createSchema,
  depositSchema,
  closeSchema,
  withdrawalSchema,
  otherCreateSchema,
  billSchema
}