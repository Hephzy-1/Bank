const logger = require('../../middlewares/logger')
const transact = require('../../models/transactions/withdraw');

// WITHDRAW FROM ACCOUNT
async function withdrawFrom (req, res) {
  try {
    const id = req.params.id 
    const result = await transact.withdrawal(req.body, id)

    if (result) {
      logger.info(`Withdraw Sucessful`)
      res.status(200).json({Message: `Withdraw Successful`})
    } else {
      logger.error(`Withdraw Failed`)
      res.status(400).json({message: `Error Occured`})
    }
  } catch (err) {
    logger.error(`${err.message}`)
    if (err === `Not Enough Balance`) {
      res.status(400).json({message: `You don't have enough money`})
    } else {
      res.status(500).json({message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
    
}

// GET DETAILS ABOUT USERS Withdrawals
async function getAllWithdrawal (req, res) {
  try {
    const id = req.params.id
    const result = await transact.getWithdrawals(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `ID Doesn't Match`) {
      res.status(400).json({message: `Account ID doesn't match with the account number`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
    }
  }
}

// GET DETAILS ABOUT SPECIFIC USERS WITHDRAWALS
async function getUserWithdrawals (req, res) {
  try {
    const id = req.params.id;
    const account_id = req.params.account_id
    const result = await transact.getSpecificWithdrawals(req.body, account_id, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `Account ID doesn't match`) {
      res.status(code).json({message: `Account ID doesn't match with the given Account Number`})
    } else if (err === `ID Doesn't Match`) {
      res.status(code).json({message: `Transaction ID Doesn't Match with the given ID`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

module.exports = {
  withdrawFrom,
  getAllWithdrawal,
  getUserWithdrawals
}