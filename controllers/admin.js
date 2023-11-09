const { createCurrency, getSpecificAccount, closeAccount, getAccounts, activeAccount } = require('../models/admin');

// CREATE CURRENCY
async function currency(req, res) {
  try {
    const result = await createCurrency(req.body)
    if (result) {
      res.status(200).json({ message : `Currency has successfully been added`})
    } else {
      res.status(400).json({ message : `Cannot add currency`})
    }
  } catch(err){
      res.status(500).json({ message: 'Something went wrong', ERRROR : err.message });
  }
}

// Get Specific User Account 
async function getUser (req, res) {
  try {
    const id = req.params.id
    const result = await getSpecificAccount(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `User Doesn't Exist`})
    }

  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// GET ACCOUNTS
async function getAllAccounts (req, res) {
  try {
    const result = await getAccounts(req.body)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(402).json({Message: `Error occured during getting`})
    }
  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// ACTIVATE USER ACCOUNT
async function activeAcc (req, res) {
  try {
    const id = req.params.id
    const result = await activeAccount(req.body, id)
    console.log(result);

    if (result) {
      res.status(200).json({Message: `Account Has Been Activated Successfully`})
    } else {
      res.status(400).json({Message: `User Doesn't Exists` })
    }
  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// TEMPORARILY CLOSE USER ACCOUNT
async function closeAcc (req, res) {
  try {
    const id = req.params.id
    const result = await closeAccount(req.body, id)
    console.log(result);

    if (result) {
      res.status(200).json({Message: `Account Closed Successfully`})
    } else {
      res.status(400).json({Message: `User Doesn't Exists` })
    }
  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
} 

module.exports = {
  currency,
  getUser,
  activeAcc,
  closeAcc,
  getAllAccounts
}