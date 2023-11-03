const jwt = require("jsonwebtoken");
const config  = require("../config/env.js");
require("dotenv").config();

async function generateToken(email) {
  return jwt.sign({email}, process.env.JWT_SECRET,{ expiresIn: process.env.EXPIRY }); 
}

// Function to verify and decode a JWT token
async function verifyToken(token) {
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (err) {
    return Error(err.message);
  }
}

module.exports = {
  generateToken,
  verifyToken
}