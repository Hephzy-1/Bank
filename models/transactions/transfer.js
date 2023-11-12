const dB = require('../../config/db');
const jwt = require('../../utils/jwt');
const uuid = require('uuid');
const schema = require('../../validation/transaction');
const logger = require('../../middlewares/logger')

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

// TRANSFER FROM BANK ACCOUNT
async function transfer(payload, id) {

  const { error, value } = schema.transferSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }

  const { Source_account, Amount, Destination_account } = value;

  try {
    if (id == Source_account) {

      const accActive = await checkStatus(Source_account)
      console.log(accActive[0][0])

      if (!accActive[0][0]) {
        logger.warn('This account has been closed. Cannot Transact')
        throw new Error(`This account has been closed. Cannot Transact`)
      }

      const alsoActive = await checkStatus(Destination_account)
      console.log(alsoActive[0][0])

      if (!alsoActive[0][0]) {
        logger.warn('This account has been closed. Cannot Transact')
        throw new Error(`This account has been closed. Cannot Transact`)
      }

      const currency = await checkSameCurrency(Source_account);
      console.log(currency[0][0])
      const sameCurrency = await checkSameCurrency(Destination_account);
      console.log(sameCurrency[0][0]);

      if (currency[0][0].Currency === sameCurrency[0][0].Currency) {

        const hasAmount = await checkBalance(Source_account)
        console.log(hasAmount[0][0].Balance)

        if (hasAmount[0][0].Balance >= Amount) {

          const query = `
            INSERT INTO transfers (Transaction_id, Amount, Source_account, Destination_account)
            VALUES (?, ?, ?, ?);
          `;

          // Generate a UUID (version 4)
          const generatedUUID = uuid.v4();

          // Remove hyphens and take the first 16 digits
          const transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

          console.log(transaction_id)

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
              const Transaction_id = generatedUUID.replace(/-/, '').slice(0, 16);

              console.log(Transaction_id)

              const payload = [Transaction_id, Amount, Destination_account]
              const result = (await dB).query(deposit, payload)

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
                logger.info(`TRANSFER WAS SUCCESSFUL`)
                return result
              }

            } else {
              const depositQuery = `
                  UPDATE Deposits
                  SET Status = Failed
                  WHERE Transaction_id = ? 
                `;

                const value = [transaction_id]
                const output = (await dB).query(depositQuery, value)
                
                logger.warn(`Deposit failed`)
                return false;
            }
          } else {
            logger.warn(`Could not update accounts`)
            return false;
          }
        } else {
          logger.warn(`Insufficient Amount`)
          throw new Error(`Insufficient Amount`)
        }
      } else {
        logger.warn(`Currencies do not match`)
        throw new Error(`Currencies do not match`)
      }
    }
  } catch (error) {
    throw Error(error)
  }

}

// GET ALL TRANSFER TRANSACTIONS ABOUT SPECIFIC ACCOUNT
async function getTransfers(payload, id) {

  const { error, value } = schema.getAllTransferSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }

  const { Account_number } = value;

  try {
    
    if (id == Account_number) {

      const query = `
        SELECT Transaction_id, Source_account, Destination_account, Amount, Created_at
        FROM Transfers
        WHERE Source_account = ?
      `;

      const value = [Account_number]
      const result = (await dB).query(query, value)

      return result;
    } else {
      throw new Error(`ID Doesn't Match`);
    }

  } catch (error) {
    throw Error(error)
  }
}

// GET TRANSFERS TRANSACTIONS ABOUT SPECIFIC TRANSFERS
async function getSpecificTransfers(payload, account_id, id) {

  const { error, value } = schema.getTransferSchema.validate(payload)

  if (error) {
    console.log(error.details, error.message);
    throw error
  }

  const { Account_number, Transaction_id } = value;

  try {
    if (account_id == Account_number) {
      if (id == Transaction_id) {
        const query = `
          SELECT Transaction_id, Source_account, Amount, Created_at 
          FROM Transfers
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
  transfer,
  getTransfers,
  getSpecificTransfers
}