const dB = require('../config/db');
const config = require('../config/env');
const jwt = require('../utils/jwt');
const uuid = require('uuid');
const schema = require('../validation/account');
const logger = require('../middlewares/logger')

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

// CREATE AN ACCOUNT
async function createAccount(input, req) {

  const { error, value } = schema.createSchema.validate(input)
  if (error) {
    throw error.message
  }

  const { email, accountNumber, account_type } = value

  try {

    if (email !== req.user) {
      console.log(req.user);
      throw Error(`Cannot access this`)
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
// async function getSpecificAccount(input, id, req) {
//   // const decoded = jwt.verifyToken(req.headers["authorization"])
//   const { Account_number } = input

//   try {
//     // if (!decoded) {
//     //   return false;
//     // } else {

//     const query = `
//       SELECT Users.Email, Users.Username, Accounts.Account_No, Accounts.Balance, Accounts.Account_Type, Accounts.Currency
//       FROM Users
//       INNER JOIN Accounts ON Users.Email = Accounts.User_Email
//       WHERE Account_No = ?
//     `;

//     if (id === Account_number) {
//       const value = [Account_number]
//       const result = (await dB).query(query, value)

//       return result;
//     } else {
//       return false;
//     }
//     // }

//   } catch (error) {
//     throw Error(error.message)
//   }
// }

// DEPOSIT TO AN ACCOUNT
async function deposit(input, id) {
  try {
    const { error, value } = schema.depositSchema.validate(input);

    if (error) {
      console.log(error.details, error.message)
      return false
    }

    const { Amount, Destination_account } = value;

    const accActive = await checkStatus(Destination_account);

    if (!accActive) {
      console.log("I don't exist");
      logger.warn(`This Account has been closed`)
      throw AccClosedError(message);
    } else {

      const query = `
      INSERT INTO deposits (Transaction_id, Amount, Destination_account)
      VALUES (?, ?, ?);
    `;

      // Generate a UUID (version 4)
      const generatedUUID = uuid.v4();

      // Remove hyphens and take the first 16 digits
      const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

      console.log(transaction_id)

      if (id == Destination_account) {

        // Insert the transaction id into the database
        const value = [transaction_id, Amount, Destination_account]

        const answer = (await dB).query(query, value)

        if (answer) {

          const amountQuery = `
          UPDATE Accounts
          SET Balance = Balance + ?, Last_Updated = current_timestamp() 
          Where Account_No = ?;
          `;

          const values = [Amount, Destination_account];
          const result = (await dB).query(amountQuery, values)

          return result;
        } else {
          return false
        }

      } else {
        throw new AccNotMatchError(message)
        // return false;
      }
    }
  }
  catch (error) {
    throw Error(error)
  }
}

// GET ALL DEPOSIT TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getDeposits(input, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number } = input

  const query = `
    SELECT Destination_account, Amount, Created_at 
    FROM Deposits
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
    throw Error(error.message)
  }
}

// GET DEPOSIT TRANSACTIONS ABOUT SPECIFIC DEPOSIT
async function getSpecificDeposits(input, account_id, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number, Transaction_id } = input

  const query = `
    SELECT Transaction_id, Destination_account, Amount, Created_at 
    FROM Deposits
    WHERE Destination_account = ? AND Transaction_id = ?
  `;

  try {
    if (!decoded) {
      return false;
    } else {
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
    }

  } catch (error) {
    throw Error(error.message)
  }
}

// WITHDRAWAL FROM AN ACCOUNT
async function withdrawal(input, id, req) {

  const { error, value } = schema.withdrawalSchema.validate(input);

  if (error) {
    console.log(error.details, error.message)
    return false
  }

  const { Amount, Source_account } = value;

  try {

    // const decoded = jwt.verifyToken(req.headers["authorization"]);

    // if (!decoded) {
    //   return false;
    // } else {
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
    // }
  } catch (error) {
    throw Error(error.message)
  }
}

// GET ALL WITHDRAWALS TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getWithdrawals(input, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number } = input;

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
async function getSpecificWithdrawals(input, account_id, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number, Transaction_id } = input

  const query = `
    SELECT Transaction_id, Source_account, Amount, Created_at 
    FROM Deposits
    WHERE Source_account = ? AND Transaction_id = ?
  `;

  try {
    if (!decoded) {
      return false;
    } else {
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
    }

  } catch (error) {
    throw Error(error.message)
  }
}

// TRANSFER FROM BANK ACCOUNT
async function transfer(input, id) {
  const { Source_account, Amount, Destination_account } = input;

  try {
    if (id == Destination_account) {

      const accActive = await checkStatus(Source_account)
      if (!accActive) {
        logger.warn('This account has been closed. Cannot Transact')
        throw new AccClosedError(message)
      }

      const alsoActive = await checkStatus(Destination_account)
      if (!alsoActive) {
        logger.warn('This account has been closed. Cannot Transact')
        throw new AccClosedError(message)
      }

      const currency = await checkSameCurrency(Source_account);
      const sameCurrency = await checkSameCurrency(Destination_account);

      if (currency === sameCurrency) {

        const query = `
          INSERT INTO transfers (Transaction_id, Amount, Source_account, Destination_account)
          VALUES (?, ?, ?, ?);
        `;

        // Generate a UUID (version 4)
        const generatedUUID = uuid.v4();

        // Remove hyphens and take the first 16 digits
        const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

        console.log(transaction_id)

        const hasAmount = await checkBalance(Source_account)

        if (hasAmount >= Amount) {

          const value = [transaction_id, Amount, Source_account, Destination_account]
          const answer = (await dB).query(query, value);

          if (answer) {
            const accountQuery = `
              UPDATE Accounts
              SET Balance = Balance - ?, Last_Updated = current_timestamp() 
              WHERE Account_No = ?
            `;

            const values = [Amount, Source_account]
            const results = (await dB).query(accountQuery, values)

            if (results) {
              const deposit = `
                INSERT INTO deposits (Transaction_id, Amount, Destination_account)
                VALUES (?, ?, ?);
              `;

              // Generate a UUID (version 4)
              const generatedUUID = uuid.v4();

              // Remove hyphens and take the first 16 digits
              const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

              console.log(transaction_id)

              const input = [transaction_id, Amount, Destination_account]
              const result = (await dB).query(deposit, input)

              if (result) {
                const transfer = `
                  UPDATE Accounts
                  SET Balance = Balance + ?, Last_Updated = current_timestamp()
                  WHERE Account_No = ?
                `;

                const value = [Amount, Destination_account]
                const result = (await dB).query(transfer, value)

                return result
              } else {

              }

              logger.info(`TRANSFER WAS SUCCESSFUL`)
              return result
            } else {
              logger.warn(`Transfer failed`)
              return false;
            }
          } else {
            logger.warn(`Could not insert into transfers table`)
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

// GET ALL TRANSFER TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getTransfers(input, id) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number } = input;

  const query = `
    SELECT Source_account, Destination_account, Amount, Created_at
    FROM Transfers
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
        throw new AccNotMatchError(message);
      }
    }

  } catch (error) {
    throw Error(error)
  }
}

// GET TRANSFERS TRANSACTIONS ABOUT SPECIFIC TRANSFERS
async function getSpecificTransfers(input, account_id, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
  const { Account_number, Transaction_id } = input

  const query = `
    SELECT Transaction_id, Source_account, Amount, Created_at 
    FROM Transfers
    WHERE Source_account = ? AND Transaction_id = ?
  `;

  try {
    if (!decoded) {
      return false;
    } else {
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
    }

  } catch (error) {
    throw Error(error.message)
  }
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

// GET ALL TRANSACTIONS
async function allTransactions(input, id, req) {
  const decoded = jwt.verifyToken(req.headers["authorization"])
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
  // getSpecificAccount,
  deposit,
  currencyAccount,
  withdrawal,
  transfer,
  getDeposits,
  getWithdrawals,
  getTransfers,
  bills,
  getBills,
  getSpecificBills,
  getSpecificDeposits,
  getSpecificTransfers,
  getSpecificWithdrawals
}
