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

// ID and Account number doesn't match
class AccNotMatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "This id doesn't match the account number";
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
async function createAccount(input) {
  
  const { error, value } = schema.createSchema.validate(input)
  if (error) {
    throw error
  }

  const { email, accountNumber, account_type } = value

  try {
    const decoded = await check(email)
    
    if (!decoded) {
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
async function currencyAccount(input, req) {

  const { error, value } = schema.otherCreateSchema.validate(input)
  if (error) {
    throw error.message
  }

  const { email, accountNumber, account_type, currency } = value

  try {
    // const decoded = jwt.verifyToken(req.headers["authorization"]); //ONLY PEOPLE WHO HAVE LOGGED IN WOULD GET THE TOKEN
    // if (!decoded) {
    //   return false;
    // } else { 

    // if (email === decoded) {

    const currencyExist = await checkCurrency(currency);
    if (!currencyExist) {
      console.log("I don't exist");
      logger.warn(`This currency doesn't Exists`)
      throw CurrencyError(message);
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
    // } else {
    //   return false;
    // }
    // }
  } catch (error) {
    throw Error(error.message)
  }
}

// GET ALL DETAILS ABOUT SPECIFIC ACCOUNT
async function getSpecificAccount(input, id, req) {
  const { Account_number } = input

  try {

    const query = `
      SELECT Users.Email, Users.Username, Accounts.Account_No, Accounts.Balance, Accounts.Account_Type, Accounts.Currency
      FROM Users
      INNER JOIN Accounts ON Users.Email = Accounts.User_Email
      WHERE Account_No = ?
    `;

    if (id === Account_number) {
      const value = [Account_number]
      const result = (await dB).query(query, value)

      return result;
    } else {
      return false;
    }
    // }

  } catch (error) {
    throw Error(error.message)
  }
}

// GET ALL TRANSACTIONS
async function allTransactions(input, id, req) {
  
  const { Account_number } = input;

  const query = `
  SELECT  Users.Email, Users.Username, Accounts.Account_No, Accounts.Account_Type, Accounts.Currency, 
  transfers.Transaction_id, transfers.Amount, transfers.Source_account, transfers.Destination_account, transfers.Created_at, 
      deposits.Transaction_id, deposits.Amount, deposits.Destination_account, deposits.Created_at,
      withdrawals.Transaction_id, withdrawals.Source_account, withdrawals.Amount, withdrawals.Created_at,
      bills.Transaction_id, bills.Source_account, bills.Type, bills.Amount, bills.Created_at
    FROM Users
    JOIN Accounts ON Users.Email = Accounts.User_Email 
    JOIN Transfers ON transfers.Source_account = Accounts.Account_No
    JOIN deposits ON deposits.Destination_account = accounts.Account_No
    JOIN withdrawals ON withdrawals.Source_account = accounts.Account_No
    JOIN bills ON bills.Source_account = accounts.Account_No;
    WHERE Accounts.Account_NO = ?
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

module.exports = {
  createAccount,
  currencyAccount
}
