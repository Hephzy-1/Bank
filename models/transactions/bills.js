const dB = require('../../config/db');
const jwt = require('../../utils/jwt');
const uuid = require('uuid');
const schema = require('../../validation/account');
const logger = require('../../middlewares/logger')

// CUSTOM ERRORS

// Currency doesn't out
class CurrencyNotMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "Currency doesn't match";
    this.code = 404;
  }
}

// Account was closed
class AccClosedError extends Error {
  constructor(message) {
    super(message);
    this.name = "This Account has been closed";
    this.code = 400;
  };
}

// ID and Account number doesn't match
class AccNotMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "This id doesn't match the account number";
    this.code = 404;
  };
}

// INSUFFICIENT AMOUNT
class InsufficientError extends Error {
  constructor(message) {
    super(message);
    this.name = "Insuficient Amount";
    this.code = 400;
  };
}

// ID and Transaction ID doesn't match
class IDNotMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "This id doesn't match the transaction id";
    this.code = 404;
  };
}

// Make a bill payment.
async function bills(input, id) {

  const { error, value } = schema.billSchema.validate(input)

  if (error) {
    throw error.message
  }

  const { Source_account, Amount, Bill_type } = value;

  try {
    if (id == Source_account) {

      const accActive = await checkStatus(Source_account)

      if (!accActive) {
        logger.warn('This account has been closed. Cannot Transact')
        throw new AccClosedError(message)
      }

      if (Amount >= 50) {

        const query = `
          INSERT INTO Bills (Transaction_id, Type, Amount, Source_account)
          VALUES (?, ?, ?, ?);
        `;

        // Generate a UUID (version 4)
        const generatedUUID = uuid.v4();

        // Remove hyphens and take the first 16 digits
        const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

        console.log(transaction_id)

        const hasAmount = await checkBalance(Source_account)

        if (hasAmount >= Amount) {

          const value = [transaction_id, Amount, Source_account, Bill_type]
          const answer = (await dB).query(query, value);

          if (answer) {

            const accountQuery = `
              UPDATE Accounts
              SET Balance = Balance - ?, Last_Updated = current_timestamp() 
              WHERE Account_No = ?
            `;

            const values = [Amount, Source_account]
            const result = (await dB).query(accountQuery, values)

            return result;
          } else {
            logger.warn(`Could not insert into Bills table`)
            return false;
          }
        } else {
          logger.warn(`Insufficient Amount`)
          throw new InsufficientError(message)
        }
      } else {
        throw new CurrencyNotMatchError(message)
      }
    }
  } catch (error) {
    throw Error(error.message)
  }

}

// GET ALL BILLS TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getBills(input, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number } = input;

  const query = `
    SELECT Source_account, Type, Amount, Created_at
    FROM Bills
    WHERE Source_account = ?
  `;

  try {
    if (!decoded) {
      return false;
    } else {
      if (id === Account_number) {
        const value = [Account_number]
        const result = (await dB).query(query, value)

        return result;
      } else {
        return false;
      }
    }

  } catch (error) {
    throw Error(error.message)
  }
}

// GET BILLS TRANSACTIONS ABOUT SPECIFIC BILLS
async function getSpecificBills(input, id, bills, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number, Bill_type } = input

  const query = `
    SELECT Transaction_id, Type, Source_account, Amount, Created_at 
    FROM Bills
    WHERE Source_account = ? AND Type = ?
  `;

  try {
    if (!decoded) {
      return false;
    } else {
      if (id == Account_number) {
        if (bills == Bill_type) {

          const value = [Account_number]
          const result = (await dB).query(query, value)

          return result;
        } else {
          throw new IDNotMatchError(message)
        }

      } else {
        throw new AccNotMatchError(message)
      }
    }

  } catch (error) {
    throw Error(error.message)
  }
}