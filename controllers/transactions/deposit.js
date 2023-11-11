const logger = require('../../middlewares/logger')
const transact = require('../../models/transactions/deposit');

// DEPOSIT INTO ACCOUNT
async function depositAcc (req, res) {
  try {
    const id = req.params.id
    const result = await transact.deposit(req.body, id);
    
    if (result) {
      logger.info(`Deposited Successfully`)
      res.status(200).json({Message: `Deposit successfully`})
    } else {
      logger.error(`Couldn't deposit`)
      res.status(400).json({Message: `Error occurred somewhere`})
    }

  } catch (err) {
    logger.error(`${err.message}`)
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
  }
}

// GET DETAILS ABOUT USERS DEPOSITS
async function getAllDeposits (req, res) {
  try {
    const id = req.params.id
    const result = await transact.getdeposits(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `ID Doesn't Match`) {
      res.status(400).json({message: `The ID and Account Number Doesn't Match`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

// GET DETAILS ABOUT SPECIFIC USERS DEPOSITS
async function getUserDeposits (req, res) {
  try {
    const id = req.params.id;
    const account_id = req.params.account_id
    const result = await transact.getSpecificdeposits(req.body, account_id, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `Account Number Doesn't Match`) {
      res.status(400).json({message: `The Account ID doesn't match with the account number given`})
    } else if (err === `Transaction ID Doesn't Match`) {
      res.status(400).json({message: `The Transaction ID Doesn't match with the transaction id given`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

module.exports = {
  depositAcc,
  getAllDeposits,
  getUserDeposits
}