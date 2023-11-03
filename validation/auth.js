const Joi = require("joi")

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  username: Joi.string().alphanum().min(5).required(),
  DOB: Joi.date().required(),
  password: Joi.string().min(8).required()
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(5).required(),
  password: Joi.string().min(8).required(),
})

const resetLinkSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(5).required() 
})

const resetSchema = Joi.object({
  email: Joi.string().email().required(), 
  username: Joi.string().alphanum().min(5).required(), 
  password: Joi.string().min(8).required(),
  confirmpassword: Joi.string().min(8).required()
})

module.exports = {
  registerSchema,
  loginSchema,
  resetSchema,
  resetLinkSchema
}