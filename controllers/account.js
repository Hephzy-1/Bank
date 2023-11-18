const logger = require('../middlewares/logger')
const accountModel = require('../models/account');

// CREATE ACCOUNT
async function createAccount (req, res) {
  try {
    
    const result = await accountModel.createAccount(req.body, req);

    if (result) {
      logger.info(`Account has been created`)
      res.status(201).json({message : `Account has been created`})
    } else {
      logger.warn(`Couldn't create account`)
      res.status(400).json({message : `Error with decoded`})
    }
  } catch (err) {
    if (err === "Cannot access") {
      res.status(403).json({message: `Only the email owner has access`})
    } else {
      res.status(500).json({message : err.message})
    }
    
  }
}

// GET A PARTICULAR ACCOUNT
// async function getAcc(req, res) {
//   try {
//     const id = req.params.id;
//     const result = await accountModel.getSpecificAccount(req.body, id, req);
//     if (result) {
//       res.status(200).json({message: `Here`, data: result[0]})
//     } else {
//       res.status(404).json({message : `Unable to get account`})
//     }
//   } catch (error) {
//     res.status(500)({message: `INTERNAL SERVER ERROR`, error: error.message})
//   }
// }

// GET ALL ACCOUNTS
// async function getAccounts (req, res) {
//   try {
//     const result = await accountModel.getAccount(req.body, req);
//     if (result) {
//       res.status(200).json({message: `Here`, data: result[0]})
//     } else {
//       res.status(404).json({message : `Unable to get account`})
//     }
//   } catch (error) {
//     res.status(500).json({message: `INTERNAL SERVER ERROR`, error: error.message})
//   }
// }

// CLOSE AN ACCOUNT
async function closeAcc (req, res) {
  try {
    const role = req.params.role
    const result = await accountModel.closeAccount(req.body, role, req)

    if (!result) {
      res.status(200).json({Message: `Account Deleted Successfully`})
    } else {
      res.status(400).json({Message : `User doesn't exist or error occurred`})
    }
  } catch (err) {
    res.status(500).json({message : `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// CREATE ACCOUNT IN FOREIGN CURRENCIES
async function createCurrencyAcc (req, res) {
  try {
    const result = await accountModel.currencyAccount(req.body, req)

    if (result) {
      res.status(201).json({message : `Account has been created`})
    } else {
      res.status(404).json({message : `Unable to create Account number`})
    }
  } catch (err) {
    res.status(500).json({message : `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// GET TRANSACTION HISTORY
async function transactions (req, res) {
  try {
    const account_id = req.params.account_id
    const result = await accountModel.allTransactions(req.body, account_id)
    console.log(result)

    if (result) {
      res.status(200).json({message: `Here is your history`, data: result[0]})
    } else {
      res.status(400).json({message: `Can't get transaction history`})
    }
  } catch (error) {
    if (error === `ID Doesn't Match`) {
      res.status(400).json({message: `Account ID Doesn't Matcch With Given ID`})
    } else {
      res.status(500).json({message: `INTERNAL SERVER ERROR`, Err: error.message})
    }
  }
}

module.exports = {
  createAccount,
  // getAcc,
  // getAccounts,
  closeAcc,
  createCurrencyAcc,
  transactions
}