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

const getAllWithdrawalSchema = Joi.object({
  Account_number: Joi.number().integer().required()
})

const getWithdrawSchema = Joi.object({
  Account_number: Joi.number().integer().required(),
  Transaction_id: Joi.string().length(16).required()
})

const transferSchema = Joi.object({
  Source_account: Joi.number().integer().required(),
  Destination_account: Joi.number().integer().required(),
  Amount: Joi.number().integer().precision(2).positive().required()
})

const getAllTransferSchema = Joi.object({
  Account_number: Joi.number().integer().required()
})

const getTransferSchema = Joi.object({
  Account_number: Joi.number().integer().required(),
  Transaction_id: Joi.string().length(16).required()
})

const billSchema = Joi.object({
  Source_account: Joi.number().integer().required(),
  Amount: Joi.number().integer().precision(2).positive().required(),
  Bill_type: Joi.string().valid('Airtime', 'Betting', 'Electricity', 'Data').required()
})

const getAllBillsSchema = Joi.object({
  Account_number: Joi.number().integer().required()
})

const getBillsSchema = Joi.object({
  Account_number: Joi.number().integer().required(),
  Transaction_id: Joi.string().length(16).required()
})

module.exports = {
  depositSchema,
  getAlldepositSchema,
  getdepositSchema,
  withdrawalSchema,
  getAllWithdrawalSchema,
  getWithdrawSchema,
  transferSchema,
  getAllTransferSchema,
  getTransferSchema,
  billSchema,
  getAllBillsSchema,
  getBillsSchema
}