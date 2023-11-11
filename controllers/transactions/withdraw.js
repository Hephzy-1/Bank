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
async function getWithdrawal (req, res) {
  try {
    const id = req.params.id
    const result = await transact.getWithdrawals(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// GET DETAILS ABOUT SPECIFIC USERS WITHDRAWALS
async function getUserWithdrawals (req, res) {
  try {
    const id = req.params.id;
    const account_id = req.params.account_id
    const result = await transact.getSpecificWithdrawals(req.body, id, account_id)

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
  withdrawFrom
}