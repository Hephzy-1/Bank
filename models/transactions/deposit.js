const dB = require('../../config/db');
const uuid = require('uuid');
const schema = require('../../validation/account');
const logger = require('../../middlewares/logger')

// CHECK IF ACCOUNT EXISTS AND IS ACTIVE
async function checkStatus(accountNumber) {
  const query = `
    SELECT COUNT(Status)
    FROM Accounts
    WHERE Account_No = ? AND Status = 1
  `;
  const values = [accountNumber];
  const result = (await dB).query(query, values);
  return result;
}

// deposit into AN ACCOUNT
async function deposit(payload, id) {

  const { error, value } = schema.depositSchema.validate(payload);

  if (error) {
    console.log(error.details, error.message)
    throw error
  }

  const { Amount, Destination_account } = value;

  try {
    const accActive = await checkStatus(Destination_account)

    if (!accActive) {
      logger.warn(`This account cannot transact`)
      throw new AccClosedError(message)
    }

    if (id == Destination_account) {

      const query = `
          INSERT INTO deposits (Transaction_id, Amount, Destination_account)
          VALUES (?, ?, ?) 
        `;

      // Generate a UUID (version 4)
      const generatedUUID = uuid.v4();

      // Remove hyphens and take the first 16 digits
      const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

      console.log(transaction_id)

      // Insert the transaction id into the database
      const value = [transaction_id, Amount, Destination_account]
      const answer = (await dB).query(query, value);

      if (answer) {

        const amountQuery = `
          UPDATE Accounts
          SET Balance = Balance + ? , Last_Updated = CURRENT_TIMESTAMP
          WHERE Account_No = ?
        `;
        const values = [Amount, Destination_account]
        const result = (await dB).query(amountQuery, values)
        
        return result;

      } else {
        
        const depositQuery = `
          UPDATE Deposits
          SET Status = Failed
          WHERE Transaction_id = ? 
        `;

        const value = [transaction_id]
        const output = (await dB).query(depositQuery, value)
        
        return false;
      }

    } else {
      throw new Error(`ID doesn't match with account provided`)
    }
  } catch (error) {
    throw Error(error)
  }
}

// GET ALL depositsS TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getdeposits(payload, id) {
  const { Account_number } = payload;

  const query = `
    SELECT Destination_account, Amount, Created_at
    FROM depositss
    WHERE Destination_account = ?
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
        throw new AccNotMatchError(message)
      }
    }

  } catch (error) {
    throw Error(error)
  }
}

// GET deposit TRANSACTIONS ABOUT SPECIFIC deposit
async function getSpecificdeposits(payload, account_id, id) {
  const { Account_number, Transaction_id } = payload

  const query = `
    SELECT Transaction_id, Destination_account, Amount, Created_at 
    FROM Deposits
    WHERE Destination_account = ? AND Transaction_id = ?
  `;

  try {
    if (account_id == Account_number) {
      if (id == Transaction_id) {

        const value = [Account_number]
        const result = (await dB).query(query, value)

        return result;
      } else {
        throw new IDNotMatchError(message)
      }

    } else {
      throw new AccNotMatchError(message)
    }

  } catch (error) {
    throw Error(error)
  }
}

module.exports = {
  deposit
}