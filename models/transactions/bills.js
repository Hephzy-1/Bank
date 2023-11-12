const dB = require('../../config/db');
const jwt = require('../../utils/jwt');
const uuid = require('uuid');
const schema = require('../../validation/transaction');
const logger = require('../../middlewares/logger');
const { log } = require('winston');

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

// CHECK IF ACCOUNT EXISTS AND IS ACTIVE
async function checkStatus(accountNumber) {
  const query = `
    SELECT Status
    FROM Accounts
    WHERE Account_No = ? AND Status = 1
  `;
  const values = [accountNumber];
  const result = (await dB).query(query, values);
  return result;
}

// CHECK IF ACCOUNT HAS ENOUGH MONEY TO TRANSACT AND THE CURRENCY USED TO TRANSACT
async function checkBalance(accountNumber) {
  const query = `
    SELECT Balance, Currency
    FROM Accounts
    WHERE Account_No = ?
  `;
  const values = [accountNumber];
  const result = (await dB).query(query, values);
  return result;
}

// Make a bill payment.
async function bills(payload, id) {

  const { error, value } = schema.billSchema.validate(payload)

  if (error) {
    console.log(error.message, error.details);
    throw error
  }

  const { Source_account, Amount, Bill_type } = value;

  try {
    if (id == Source_account) {

      const accActive = await checkStatus(Source_account)

      if (!accActive[0][0]) {
        logger.warn('This account has been closed. Cannot Transact')
        throw new Error('This account has been closed. Cannot Transact')
      }

      const hasAmount = await checkBalance(Source_account)

      if (Amount >= 50) {
        if (hasAmount[0][0].Balance >= Amount) {

          const query = `
            INSERT INTO Bills (Transaction_id, Type, Amount, Source_account)
            VALUES (?, ?, ?, ?);
          `;

          // Generate a UUID (version 4)
          const generatedUUID = uuid.v4();

          // Remove hyphens and take the first 16 digits
          const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

          console.log(transaction_id)

          const value = [transaction_id, Bill_type, Amount, Source_account]
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
          throw new Error(`Insufficient Amount`)
        }
      } else {
        logger.warn(`You can only make a bill payment of 50 ${hasAmount[0][0].Currency} or more`)
        throw new Error(`You can only make a bill payment of 50 or more`)
      }
    }

  } catch (error) {
    throw Error(error)
  }

}

// GET ALL BILLS TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getBills(payload, id) {

  const { error, value } = schema.getAllBillsSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }

  const { Account_number } = value;

  try {
    if (id == Account_number) {

      const query = `
        SELECT Transaction_id, Source_account, Type, Amount, Created_at
        FROM Bills
        WHERE Source_account = ?
      `;

      const value = [Account_number]
      const result = (await dB).query(query, value)

      return result;
    } else {
      throw Error(`ID Doesn't Match`);
    }

  } catch (error) {
    throw Error(error)
  }
}

// GET BILLS TRANSACTIONS ABOUT SPECIFIC BILLS
async function getSpecificBills(payload, id, account_id) {
  
  const { error, value } = schema.getBillsSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }
  const { Account_number, Transaction_id} = value

  try {
      if (account_id == Account_number) {
        if (id == Transaction_id) {

          const query = `
            SELECT Transaction_id, Type, Source_account, Amount, Created_at 
            FROM Bills
            WHERE Source_account = ? AND Transaction_id = ?
          `;

          const value = [Account_number, Transaction_id]
          const result = (await dB).query(query, value)

          return result;
        } else {
          throw new Error(`Transaction ID Doesn't Match`)
        }

      } else {
        throw new Error(`Account ID Doesn't Match`)
      }

  } catch (error) {
    throw Error(error)
  }
}

module.exports = {
  bills,
  getBills,
  getSpecificBills
}