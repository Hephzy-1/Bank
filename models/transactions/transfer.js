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