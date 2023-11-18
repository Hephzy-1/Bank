const dB = require('../config/db');
const schema = require('../validation/account');
const logger = require('../middlewares/logger')

// CUSTOM ERRORS
// Currency wasn't found
class CurrencyError extends Error {
  constructor(message) {
    super(message);
    this.name = "This Currency Doesn't Exist";
    this.code = 404;
  }
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

async function check(email) {
  const query = `
  SELECT COUNT(*)
  FROM Users
  WHERE Email = ?
`;
const values = [email];
const result = (await dB).query(query, values);
return result;
}

// CREATE AN ACCOUNT
async function createAccount(payload) {
  
  const { error, value } = schema.createSchema.validate(payload)
  if (error) {
    throw error
  }

  const { email, accountNumber, account_type } = value

  try {
    const checkEmail = await check(email)
    
    if (!checkEmail) {
      logger.warn(`You cannot create an account as you haven't registered with us`)
     throw Error (`You cannot create an account as you haven't registered with us`)
    }

    const query = `
      INSERT INTO Accounts (User_Email, Account_No, Account_Type) 
      VALUES (?, ?, ?)
    `; //Users should already have account numbers

    // Insert the values 
    const values = [email, accountNumber, account_type]
    const result = (await dB).query(query, values)

    // Insert the account number into the database
    logger.info('Account is being created');

    return result;

  } catch (error) {
    throw Error(error.message)
  }

}

// CREATE AN ACCOUNT IN OTHER CURRENCIES
async function currencyAccount(payload, req) {

  const { error, value } = schema.otherCreateSchema.validate(payload)
  if (error) {
    console.log(error.details, error.message);
    throw error
  }

  const { email, accountNumber, account_type, currency } = value

  try {

    const currencyExist = await checkCurrency(currency);
    if (!currencyExist) {
      console.log("I don't exist");
      logger.warn(`This currency doesn't Exists`)
      throw Error(`This currency doesn't Exists`);
    }

    const query = `
          INSERT INTO Accounts (User_Email, Account_No, Account_Type, Currency) 
          VALUES (?, ?, ?, ?)
        `; //Users should already have account numbers

    // Insert the values 
    const values = [email, accountNumber, account_type, currency]

    // Insert the account number into the database
    const result = (await dB).query(query, values);
    logger.info(`Account has been created in ${currency} currency`);

    return result;
  
  } catch (error) {
    throw Error(error)
  }
}

// GET ALL TRANSACTIONS
async function allTransactions(payload, account_id) {
  
  const { Account_number } = payload;

  try {
    
    if (account_id == Account_number) {

      const transferQuery = `
        SELECT Users.Email, Users.Username, Accounts.Account_No, Accounts.Account_Type AS AccountType, Accounts.Currency, 
          transfers.Transaction_id AS Transfer_id, transfers.Amount AS Transfer_Amount, transfers.Source_account AS Transfer_SourceAccount, transfers.Destination_account AS Transfer_DestinationAccount, transfers.Created_at AS Transfer_Time
        FROM Users
        INNER JOIN Accounts ON Users.Email = Accounts.User_Email 
        INNER JOIN Transfers ON transfers.Source_account = Accounts.Account_No
        WHERE Accounts.Account_No = ?
      `;

      const depositQuery = `
        SELECT Accounts.Account_No, Deposits.Transaction_id AS Deposit_id, Deposits.Amount AS Deposit_Amount, Deposits.Destination_account AS Deposit_Account, Deposits.Created_at AS Deposit_Time
        FROM Users
        INNER JOIN Accounts ON Users.Email = Accounts.User_Email 
        INNER JOIN Deposits ON Deposits.Destination_account = Accounts.Account_No
        WHERE Accounts.Account_No = ?
      `;

      const withdrawalQuery = `
        SELECT Accounts.Account_No, Withdrawals.Transaction_id AS Withdrawal_id, Withdrawals.Amount AS Withdrawal_Amount, Withdrawals.Source_account AS Withdrawal_Account, Withdrawals.Created_at AS Withdrawal_Time
        FROM Users 
        INNER JOIN Accounts ON Users.Email = Accounts.User_Email 
        INNER JOIN Withdrawals ON Withdrawals.Source_account = Accounts.Account_No
        WHERE Accounts.Account_No = ?
      `;

      const billQuery = `
        SELECT Accounts.Account_No, Bills.Transaction_id AS Bill_id, Bills.Amount AS Bill_Amount, Bills.Source_account AS Bill_Account, Bills.Created_at AS Bill_Time
        FROM Users 
        INNER JOIN Accounts ON Users.Email = Accounts.User_Email 
        INNER JOIN Bills ON Bills.Source_account = Accounts.Account_No
        WHERE Accounts.Account_No = ?
      `;
      const value = [Account_number]
      const transferResult = (await dB).query(transferQuery, value)
      const depositResult = (await dB).query(depositQuery, value)
      const withdrawResult = (await dB).query(withdrawalQuery, value)
      const billResult = (await dB).query(billQuery, value)

      const allTransactions = {
        transferResult,
        depositResult,
        withdrawResult,
        billResult
      }
      return allTransactions;
    } else {
      throw Error(`ID Doesn't Match`);
    }

  } catch (error) {
    throw Error(error)
  }

}

module.exports = {
  createAccount,
  currencyAccount,
  allTransactions
}
