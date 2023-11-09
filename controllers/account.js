const logger = require('../middlewares/logger')
const accountModel = require('../models/account');

// CUSTOM ERRORS
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
    this.code = 400;
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

// WITHDRAW FROM ACCOUNT
async function withdrawFrom (req, res) {
  try {
    const id = req.params.id 
    const result = await accountModel.withdrawal(req.body, id)

    if (result) {
      res.status(200).json({Message: `Withdraw Successful`})
    } else {
      res.status(400).json({message: `Error Occured`})
    }
  } catch (err) {
    if (err instanceof AccClosedError) {
      res.status(code).json({message: message})
    } else if (err instanceof AccNotMatchError) {
      res.status(code).json({message: message})
    }else if (err instanceof InsufficientError) {
      res.status(code).json({message: message})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

// GET DETAILS ABOUT USERS Withdrawals
async function getWithdrawal (req, res) {
  try {
    const id = req.params.id
    const result = await accountModel.getWithdrawals(req.body, id)

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
    const result = await accountModel.getSpecificWithdrawals(req.body, id, account_id)

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

// TRANSFER INTO ACCOUNTS
async function transferTo (req, res) {
  try {
    const id = req.params.id 
    const result = await accountModel.transfer(req.body, id)

    if (result) {
      res.status(200).json({Message: `Transfer Successful`})
    } else {
      res.status(400).json({message: `Error Occured`})
    }
  } catch (err) {
    if (err instanceof AccClosedError) {
      res.status(code).json({message: message})
    } else if (err instanceof AccNotMatchError) {
      res.status(code).json({message: message})
    }else if (err instanceof InsufficientError) {
      res.status(code).json({message: message})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

// GET DETAILS ABOUT USERS Withdrawals
async function getTransfer (req, res) {
  try {
    const id = req.params.id
    const result = await accountModel.getTransfers(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// GET DETAILS ABOUT SPECIFIC USERS TRANSFERS
async function getUserTransfer (req, res) {
  try {
    const id = req.params.id;
    const account_id = req.params.account_id
    const result = await accountModel.getSpecificTransfers(req.body, id, account_id)

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

// BILL PAYMENT
async function billPayment (req, res) {
  try {
    const id = req.params.id 
    const result = await accountModel.bills(req.body, id)

    if (result) {
      res.status(200).json({Message: `Transaction Successful`})
    } else {
      res.status(400).json({message: `Error Occured`})
    }
  } catch (err) {
    if (err instanceof AccClosedError) {
      res.status(code).json({message: message})
    } else if (err instanceof AccNotMatchError) {
      res.status(code).json({message: message})
    }else if (err instanceof InsufficientError) {
      res.status(code).json({message: message})
    } else {
      res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message })
    }
  }
}

// GET DETAILS ABOUT USERS BILL PAYMENTS
async function getBills (req, res) {
  try {
    const id = req.params.id
    const result = await accountModel.getBills(req.body, id)

    if (result) {
      res.status(200).json({Message: `Here is the result`, data: result[0]})
    } else {
      res.status(400).json({Message: `Account Doesn't Exist`})
    }
  } catch (err) {
    res.status(500).json({Message: `INTERNAL SERVER ERROR`, Error: err.message});
  }
}

// GET DETAILS ABOUT SPECIFIC USERS BILLS
async function getUserBills (req, res) {
  try {
    const id = req.params.id;
    const bills = req.params.bills
    const result = await accountModel.getSpecificBills(req.body, id, bills)

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
  createAccount,
  // getAcc,
  // getAccounts,
  closeAcc,
  createCurrencyAcc,
  withdrawFrom,
  transferTo,
  getUserWithdrawals,
  getUserTransfer,
  billPayment,
  getUserBills,
  getBills,
  getWithdrawal,
  getTransfer
}