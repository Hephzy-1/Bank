const dB = require('../../config/db');
const uuid = require('uuid');
const schema = require('../../validation/transaction');
const logger = require('../../middlewares/logger')

// CUSTOM ERRORS
// ID and Account number doesn't match
class AccNotMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "This id doesn't match the account number";
    this.code = 404;
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

// CHECK IF ACCOUNT HAS ENOUGH MONEY TO TRANSACT
async function checkBalance(accountNumber) {
  const query = `
    SELECT Balance
    FROM Accounts
    WHERE Account_No = ?
  `;
  const values = [accountNumber];
  const result = (await dB).query(query, values);
  console.log(result);
  return result; // Extract the balance from the result
}

// WITHDRAWAL FROM AN ACCOUNT
async function withdrawal(payload, id) {

  const { error, value } = schema.withdrawalSchema.validate(payload);

  if (error) {
    console.log(error.details, error.message)
    throw Error (error)
  }

  const { Amount, Source_account } = value;

  try {
    const accActive = await checkStatus(Source_account)
    console.log(accActive[0][0]);

    if (!accActive[0][0]) {
      logger.error(`This account cannot transact`)
      throw Error(`This account cannot transact`)
    } 

    if (id == Source_account) {

      const hasAmount = await checkBalance(Source_account)
      console.log(hasAmount[0][0].Balance);

      if (hasAmount[0][0].Balance <= Amount) {
        logger.error(`Not Enough Balance`)
        throw Error (`Not Enough Balance`);
      }

      const query = `
          INSERT INTO withdrawals (Transaction_id, Amount, Source_account)
          VALUES (?, ?, ?) 
        `;

      // Generate a UUID (version 4)
      const generatedUUID = uuid.v4();

      // Remove hyphens and take the first 16 digits
      const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

      console.log(transaction_id)

      // Insert the transaction id into the database
      const value = [transaction_id, Amount, Source_account]
      const answer = (await dB).query(query, value);

      if (answer) {

        const amountQuery = `
          UPDATE Accounts
          SET Balance = Balance - ? , Last_Updated = CURRENT_TIMESTAMP
          WHERE Account_No = ?
        `;
        const values = [Amount, Source_account]
        const result = (await dB).query(amountQuery, values)

        return result;
      } else {
        const withdrawQuery = `
          UPDATE Withdraws
          SET Status = Failed
          WHERE Transaction_id = ? 
        `;

        const value = [transaction_id]
        const output = (await dB).query(withdrawQuery, value)
        
        logger.warn(`Withdraw failed`)
        return false;
      }

    } else {
      throw Error(`ID Doesn't Match`)
    }
  } catch (error) {
    throw Error(error)
  }
}

// GET ALL WITHDRAWALS TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getWithdrawals(payload, id) {

  const { error, value } = schema.getAllWithdrawalSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }
  const { Account_number } = value;

  try {
    
    if (id == Account_number) {

      const query = `
        SELECT Transaction_id, Source_account, Amount, Created_at
        FROM Withdrawals
        WHERE Source_account = ?
      `;
      const value = [Account_number]
      const result = (await dB).query(query, value)

      return result;
    } else {
      throw Error(`ID Doesn't Match`)
    }

  } catch (error) {
    throw Error(error)
  }
}

// GET WITHDRAWAL TRANSACTIONS ABOUT SPECIFIC WITHDRAWAL
async function getSpecificWithdrawals(payload, account_id, id) {

  const { error, value } = schema.getWithdrawSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }
  const { Account_number, Transaction_id } = value

  try {
    if (account_id == Account_number) {
      if (id == Transaction_id) {

        const query = `
          SELECT Transaction_id, Source_account, Amount, Created_at 
          FROM Withdrawals
          WHERE Source_account = ? AND Transaction_id = ?
        `;

        const value = [Account_number, Transaction_id]
        const result = (await dB).query(query, value)

        return result;
      } else {
        throw Error(`ID Doesn't Match`)
      }

    } else {
      throw Error(`Account ID Doesn't Match`)
    }

  } catch (error) {
    throw Error(error)
  }
}

module.exports = {
  withdrawal,
  getWithdrawals,
  getSpecificWithdrawals
}