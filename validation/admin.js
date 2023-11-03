const Joi = require('joi');

const currencySchema = Joi.object({
  currency: Joi.string().length(3).required()
})

const getSchema = Joi.object({
  account_number: Joi.number().integer().max(9999999999).required()
})

const getAll = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin').required()
})

const deleteSchema = Joi.object({
  account_number: Joi.number().integer().required(),
  role: Joi.string().required()
})

module.exports = {
  currencySchema,
  deleteSchema,
  getSchema,
  getAll
}