const logger = require('../../middlewares/logger')
const transModel = require('../../models/transactions/transfer');

// TRANSFER INTO ACCOUNTS
async function transferTo (req, res) {
  try {
    const id = req.params.id 
    const result = await transModel.transfer(req.body, id)

    if (result) {
      logger.info(`Transfer was a success`)
      res.status(200).json({Message: `Transfer Successful`})
    } else {
      logger.error(`Transfer didn't go through`)
      res.status(400).json({message: `Error Occured`})
    }
  } catch (err) {
    logger.error(`${err.message}`)
    if (err == `This account has been closed. Cannot Transact`) {
      res.status(400).json({message: `This account has been closed and cannot transact`})
    } else if (err == `Currencies do not match`) {
      res.status(401).json({message: `Currencies do not match so this transaction cannot go through`})
    }else if (err == `Insufficient Amount`) {
      res.status(401).json({message: `Insufficient Amount. You need more money`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

// GET DETAILS ABOUT ALL TRANSFERS
async function getTransfer (req, res) {
  try {
    const id = req.params.id
    const result = await transModel.getTransfers(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `ID Doesn't Match`) {
      res.status(400).json({message: `The Account ID doesn't match with the ID given`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
    }
  }
}

// GET DETAILS ABOUT SPECIFIC USERS TRANSFERS
async function getUserTransfer (req, res) {
  try {
    const id = req.params.id;
    const account_id = req.params.account_id
    const result = await transModel.getSpecificTransfers(req.body, account_id, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `Transaction ID Doesn't Match`) {
      res.status(401).json({message: `Transaction ID Doesn't Match With The Given ID`})
    } else if (err === `Account ID Doesn't Match`) {
      res.status(401).json({message: `Account ID Doesn't Match With The Given ID`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

module.exports = {
  transferTo,
  getTransfer,
  getUserTransfer
}