const logger = require('../../middlewares/logger')
const transModel = require('../../models/transactions/bills');

// BILL PAYMENT
async function billPayment (req, res) {
  try {
    const id = req.params.id 
    const result = await transModel.bills(req.body, id)

    if (result) {
      res.status(200).json({Message: `Transaction Successful`})
    } else {
      res.status(400).json({message: `Error Occured`})
    }
  } catch (err) {
    logger.error(`${err.message}`)
    if (err === `You can only make a bill payment of 50 or more`) {
      res.status(401).json({message: `You can only make a bill payment of 50 or more`})
    } else if (err === `Insufficient Amount`) {
      res.status(401).json({message: `Insufficient Amount. You don't have enough money`})
    } else if (err === 'This account has been closed. Cannot Transact') {
      res.status(400).json({message: 'This account has been closed and cannot transact'})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

// GET DETAILS ABOUT USERS BILL PAYMENTS
async function getBills (req, res) {
  try {
    const id = req.params.id
    const result = await transModel.getBills(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    logger.error(`${err.message}`)
    if (err === `ID Doesn't Match`) {
      res.status(400).json({message: `Account ID Doesn't Match With Given ID`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
    }
  }
}

// GET DETAILS ABOUT SPECIFIC USERS BILLS
async function getUserBills (req, res) {
  try {
    const id = req.params.id;
    const account_id = req.params.account_id
    const result = await transModel.getSpecificBills(req.body, id, account_id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    if (err === `Transaction ID Doesn't Match`) {
      res.status(400).json({message: message})
    } else if (err === `Account ID Doesn't Match`) {
      res.status(400).json({message: `Account ID Doesn't Match With Given ID`})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

module.exports = {
  billPayment,
  getBills,
  getUserBills
}