const express = require('express');
const accountRouter = express.Router();
const logger = require('../middlewares/logger')
const accFn = require('../controllers/account');
const depositFn = require('../controllers/transactions/deposit')
const withdrawFn = require('../controllers/transactions/withdraw')
const transferFn = require('../controllers/transactions/transfer')
const billFn = require('../controllers/transactions/bills')

accountRouter.post('/', accFn.createAccount);
// accountRouter.get('/:id', accFn.getAc);
// accountRouter.get('/', accFn.getAccounts);
// accountRouter.delete('/deleteAccount', accFn.closeAcc);
accountRouter.post('/account/currency', accFn.createCurrencyAcc);
accountRouter.post('/:id/deposits', depositFn.depositAcc);
accountRouter.get('/:id/deposits', depositFn.getAllDeposits);
accountRouter.get('/:account_id/deposits/:id', depositFn.getUserDeposits);
accountRouter.get('/:account_id/withdrawals/:id', withdrawFn.getUserWithdrawals);
accountRouter.get('/:id/withdrawals', withdrawFn.getAllWithdrawal);
accountRouter.post('/:id/withdrawals', withdrawFn.withdrawFrom);
accountRouter.post('/:id/transfers', transferFn.transferTo);
accountRouter.get('/:id/transfers', transferFn.getTransfer);
accountRouter.get('/:account_id/transfers/:id', transferFn.getUserTransfer);
accountRouter.post('/:id/bills', billFn.billPayment);
accountRouter.get('/:id/bills', billFn.getBills);
accountRouter.get('/:account_id/bills/:id', billFn.getUserBills);
accountRouter.get('/:account_id/transactions', accFn.transactions);
accountRouter.get('/:account_id/transactions/download', accFn.downloadtransactions);

accountRouter.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({message: "PAGE NOT FOUND"});
});

module.exports = accountRouter