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
async function getAccount(payload) {
  try {

    // const { error, value } = schema.getAll.validate(payload);

    // if (error) {
    //   console.log(error.details, error.message)
    //   throw Error(error);
    // }

    const { email, role } = payload;

    const adminExists = await check(email);

    if (!adminExists) {
      console.log("I don't exist");
      logger.warn(`This Admin doesn't Exists`)
      throw Error(`This Admin doesn't exist`);
    }

    const query = `
      SELECT Users.Email, Users.Username, Accounts.Account_No, Accounts.Balance, Accounts.Account_Type, Accounts.Currency
      FROM Users
      INNER JOIN Accounts ON Users.Email = Accounts.User_Email
    `;

    if (role === 'admin') {
      const values = [email, role]
      console.log(values);
      const result = (await dB).query(query, values)

      return result;
    } else {
      throw Error(`Only Admins can view this`);
    }

  } catch (error) {
    throw Error(error.message)
  }
}

// Close SPECIFIC ACCOUNTS
async function closeAccount(payload, role, id) {
  // const decoded = jwt.verifyToken(req.headers["authorization"])
  const { error, value } = schema.closeSchema.validate(payload);

  if (error) {
    console.log(error.details, error.message)
    throw Error(error);
  }

  const { email, Account_number } = value



  try {
    // if (!decoded) {
    //   throw Error(error);
    // } else {
    const query = `
        UPDATE Accounts
        SET Status = False
        WHERE Account_number = ? AND Email = ?
      `;
    if (role === 'admin') {
      if (id === Account_number) {
        const value = [Account_number, email]
        const response = await warningEmail(email, config.SENDER_EMAIL)
        const result = (await dB).query(query, value)

        return result;
      } else {
        throw Error(error);
      }
    } else {
      throw Error(error);
    }
    // }

  } catch (error) {
    throw Error(error.message)
  }
}

// TEMPORARILY CLOSE THE ACCOUNT
async function freezeAccount(payload, role, id) {
  const decoded = jwt.verifyToken(req.cookies.token)
  const { error, value } = schema.deleteSchema.validate(payload);

  if (error) {
    console.log(error.details, error.message)
    throw Error(error);
  }

  const { email, Account_number } = value

  const query = `
    UPDATE Accounts
    SET Status = False
    WHERE Account_number = ? AND Email = ?
  `;

  try {
    if (!decoded) {
      throw Error(error);
    } else {
      if (role === 'admin') {
        if (id === Account_number) {
          const value = [Account_number, email]
          const response = await temporarilyClosedEmail(email, config.SENDER_EMAIL)
          const result = (await dB).query(query, value, response)

          return result;
        } else {
          throw Error(error);
        }

      } else {
        throw Error(error);
      }
    }

  } catch (error) {
    throw Error(error.message)
  }
}

module.exports = {
  createCurrency,
  getAccount,
  getSpecificAccount,
  closeAccount,
  freezeAccount
}