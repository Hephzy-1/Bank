const Joi = require('joi')

const depositSchema = Joi.object({
  Amount : Joi.number().integer().precision(2).positive().required(),
  Destination_account: Joi.number().integer().required(),
})

const getAlldepositSchema = Joi.object({
  Account_number: Joi.number().integer().required()
})

const getdepositSchema = Joi.object({
  Account_number: Joi.number().integer().required(),
  Transaction_id: Joi.string().length(16).required()
})

const withdrawalSchema = Joi.object({
  Amount : Joi.number().integer().precision(2).positive().required(),
  Source_account: Joi.number().integer().required(),
})

const billSchema = Joi.object({
  Source_account: Joi.number().integer().required(),
  Amount: Joi.number().integer().precision(2).positive().required(),
  Bill_type: Joi.string().valid('airtime', 'betting', 'electricity', 'subscription').required()
})

module.exports = {
  depositSchema,
  getAlldepositSchema,
  getdepositSchema,
  withdrawalSchema,
  billSchema
}