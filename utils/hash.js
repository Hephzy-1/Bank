const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  return bcrypt.hash(password, 5);
}

const comparePassword = async (password, userPassword) => {
  return await bcrypt.compare(password, userPassword)
}

module.exports = {
  hashPassword,
  comparePassword
}
