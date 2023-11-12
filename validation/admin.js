const Joi = require('joi');

const currencySchema = Joi.object({
  currency: Joi.string().length(3).required()
})

// const getSchema = Joi.object({
//   account_number: Joi.number().integer().max(9999999999).required()
// })

const getAllSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin').required()
})

const closeSchema = Joi.object({
  email: Joi.string().email().required(),
  Account_number: Joi.number().integer().required()
})

const openSchema = Joi.object({
  email: Joi.string().email().required(),
  Account_number: Joi.number().integer().required()
})

module.exports = {
  currencySchema,
  closeSchema,
  openSchema,
  // getSchema,
  getAllSchema

}