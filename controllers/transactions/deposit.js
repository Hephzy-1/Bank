const logger = require('../../middlewares/logger')
const transact = require('../../models/transactions/deposit');
const { error } = require('winston');

// DEPOSIT INTO ACCOUNT
async function depositAcc (req, res) {
  try {
    const id = req.params.id
    const result = await transact.deposit(req.body, id);
    
    if (result) {
      logger.info(`Deposited Successfully`)
      res.status(200).json({Message: `Deposit successfully`})
    } else {
      logger.warn(`Couldn't deposit`)
      res.status(400).json({Message: `Error occurred somewhere`})
    }

  } catch (err) {
    logger.warn(`${err.message}`)
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
  }
}

// GET DETAILS ABOUT USERS DEPOSITS
async function getDeposits (req, res) {
  try {
    const id = req.params.id
    const result = await transact.getDeposits(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err instanceof AccClosedError) {
      res.status(code).json({message: message})
    } else if (err instanceof AccNotMatchError) {
      res.status(code).json({message: message})
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
    const result = await transact.getSpecificDeposits(req.body, id, account_id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err instanceof AccClosedError) {
      res.status(code).json({message: message})
    } else if (err instanceof AccNotMatchError) {
      res.status(code).json({message: message})
    } else if (err instanceof IDNotMatchError) {
      res.status(code).json({message: message})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

module.exports = {
  depositAcc
}