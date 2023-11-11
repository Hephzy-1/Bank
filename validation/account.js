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

const closeSchema = Joi.object({
  account_number: Joi.number().integer().required(),
  role: Joi.string().required()
})



module.exports = { 
  createSchema,
  closeSchema,
  otherCreateSchema
}