const dB = require('../config/db');
const config = require('../config/env');
const schema = require("../validation/admin");
const { warningEmail } = require('../utils/email')

// CHECK ADMIN
async function check(email) {
  const query = `
    SELECT COUNT(*) as count
    FROM admins
    WHERE Email = ?
  `;
  const values = [email];
  const result = (await dB).query(query, values);
  return result;
}

// Create Currency
async function createCurrency(payload) {
  try {
    const { error, value } = schema.currencySchema.validate(payload);

    if (error) {
      console.log(error.details, error.message)
      throw Error(error);
    }

    const { currency } = value

    const query = `
      INSERT INTO Currency (Type)
      VALUES (?) 
    `;

    const values = [currency]
    const result = (await dB).query(query, values)

    return result;

  } catch (error) {
    throw Error(error.message)
  }
}

// GET A SPECIFIC ACCOUNT AS AN ADMIN
async function getSpecificAccount(payload, id) {
  try {
    const { error, value } = schema.getSchema.validate(payload);

    if (error) {
      console.log(error.details, error.message)
      throw Error(error);
    }
    const { account_number } = value;

    if (id == account_number) {

      const query = `
        SELECT Account_No, Account_Type, Balance, Currency FROM Accounts
        WHERE Account_No = ?
      `;

      const values = [account_number]
      const result = (await dB).query(query, values)

      return result;
    } else {
      throw new Error(`ID and Account Number don't match`);
    }

  } catch (err) {
    throw Error(err)
  }
}

// GET ALL ACCOUNTS
async function getAccounts(payload) {
  try {
    const { error, value } = schema.getAllSchema.validate(payload);

    if (error) {
      console.log(error.details, error.message)
      throw Error(error);
    }

    const { email, role } = value;

      const query = `
      SELECT Users.Email, Users.Username, Accounts.Account_No, Accounts.Balance, Accounts.Account_Type, Accounts.Currency
      FROM Users
      INNER JOIN Accounts ON Users.Email = Accounts.User_Email
    `;

      const values = [email, role]
      const result = (await dB).query(query, values)

      return result;

  } catch (err) {
    throw Error(err)
  }
}

// Close SPECIFIC ACCOUNTS
async function closeAccount(payload, id) {
  try {
    const { error, value } = schema.closeSchema.validate(payload);

    if (error) {
      console.log(error.details, error.message)
      throw Error(error);
    }

    const { email, Account_number } = value

    const query = `
      UPDATE Accounts
      SET Status = False
      WHERE Account_No = ? AND User_Email = ?
    `;
    
    if (id == Account_number) {
      const value = [Account_number, email]
      const result = (await dB).query(query, value)
      const response = await warningEmail(email, config.SENDER_EMAIL)
      console.log(response);

      return result;
    } else {
      throw Error(`ID doesn't match`);
    }

  } catch (error) {
    throw Error(error.message)
  }
}

// ACTIVATE THE ACCOUNT
async function activeAccount(payload, id) {
  try {
    const { error, value } = schema.openSchema.validate(payload);

    if (error) {
      console.log(error.details, error.message)
      throw Error(error);
    }

    const { email, Account_number } = value

    const query = `
      UPDATE Accounts
      SET Status = True
      WHERE Account_No = ? AND User_Email = ?
    `;
    
    if (id == Account_number) {
      const value = [Account_number, email]
      const result = (await dB).query(query, value)
      const response = await warningEmail(email, config.SENDER_EMAIL)

      return result;
    } else {
      throw Error(`ID doesn't match`);
    }

  } catch (error) {
    throw Error(error.message)
  }
}

module.exports = {
  createCurrency,
  getAccounts,
  getSpecificAccount,
  closeAccount,
  activeAccount
}