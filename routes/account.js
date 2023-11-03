const express = require('express');
const accountRouter = express.Router();
const logger = require('../middlewares/logger')
const accFn = require('../controllers/account');

accountRouter.post('/', accFn.createAccount);
// accountRouter.get('/:id', accFn.getAcc);
// accountRouter.get('/', accFn.getAccounts);
// accountRouter.delete('/deleteAccount', accFn.closeAcc);
accountRouter.post('/account/currency', accFn.createCurrencyAcc);
accountRouter.post('/:id/deposits', accFn.depositAcc);
accountRouter.get('/:id/deposits', accFn.getDeposits);
accountRouter.get('/:account_id/deposits/:id', accFn.getUserDeposits);
accountRouter.get('/:account_id/withdrawals/:id', accFn.getUserWithdrawals);
accountRouter.get('/:id/withdrawals', accFn.getWithdrawal);
accountRouter.post('/:id/withdrawals', accFn.withdrawFrom);
accountRouter.post('/:id/transfers', accFn.transferTo);
accountRouter.get('/:id/transfers', accFn.getTransfer);
accountRouter.get('/:account_id/transfers/:id', accFn.getUserTransfer);
accountRouter.post('/:id/bills', accFn.billPayment);
accountRouter.get('/:id/bills', accFn.getBills);
accountRouter.get('/:id/bills/:bills', accFn.getUserBills);
accountRouter.get('/:account_id/transactions');

accountRouter.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({message: "PAGE NOT FOUND"});
});

module.exports = accountRouter