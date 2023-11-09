const dB = require('../../config/db');
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

// Currency wasn't found
class CurrencyError extends Error {
  constructor(message) {
    super(message);
    this.name = "This Currency Doesn't Exist";
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

// CHECK IF CURRENCY EXISTS
async function checkCurrency(currency) {
  const query = `
    SELECT COUNT(*)
    FROM Currency
    WHERE Type = ?
  `;

  const value = [currency]
  const result = (await dB).query(query, value)

  return result
}

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

// CHECK IF ACCOUNT HAS ENOUGH MONEY TO TRANSACT
async function checkBalance(accountNumber) {
  const query = `
    SELECT Balance
    FROM Accounts
    WHERE Account_No = ?
  `;
  const values = [accountNumber];
  const result = (await dB).query(query, values);
  return result;
}

// CHECK IF CURRENCY IS THE SAME 
async function checkSameCurrency(accountNumber) {
  const query = `
    SELECT Currency
    FROM Accounts
    WHERE Account_No = ?
  `;
  const values = [accountNumber];
  const result = (await dB).query(query, values);
  return result;
}

// WITHDRAWAL FROM AN ACCOUNT
async function withdrawal(payload, id) {

  const { error, value } = schema.withdrawalSchema.validate(payload);

  if (error) {
    console.log(error.details, error.message)
    return false
  }

  const { Amount, Source_account } = value;

  try {
    const accActive = await checkStatus(Source_account)

    if (!accActive) {
      logger.warn(`This account cannot transact`)
      throw new AccClosedError(message)
    }

    if (id == Source_account) {

      const hasAmount = await checkBalance(Source_account)
      if (Amount >= hasAmount) {
        throw new InsufficientError(message);
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
        return false;
      }


    } else {
      throw new AccNotMatchError(message)
    }
  } catch (error) {
    throw Error(error.message)
  }
}

// GET ALL WITHDRAWALS TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getWithdrawals(payload, id) {
  const { Account_number } = payload;

  const query = `
    SELECT Source_account, Amount, Created_at
    FROM Withdrawals
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
        throw new AccNotMatchError(message)
      }
    }

  } catch (error) {
    throw Error(error.message)
  }
}

// GET WITHDRAWAL TRANSACTIONS ABOUT SPECIFIC WITHDRAWAL
async function getSpecificWithdrawals(payload, account_id, id) {
  const { Account_number, Transaction_id } = payload

  const query = `
    SELECT Transaction_id, Source_account, Amount, Created_at 
    FROM Deposits
    WHERE Source_account = ? AND Transaction_id = ?
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
    throw Error(error.message)
  }
}