const express = require("express");
const adminRouter = express.Router();
const logger = require('../middlewares/logger')
const { currency, getUser, closeAcc, getAllAccounts, activeAcc } = require('../controllers/admin');

adminRouter.post('/currency', currency);
adminRouter.get('/admin/:id', getUser);
adminRouter.get('/accounts', getAllAccounts)
// adminRouter.delete('/:id', deleteAcc);
adminRouter.put('/closeAccount/:id', closeAcc);
adminRouter.put('/activeAccount/:id', activeAcc);

adminRouter.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({message: "PAGE NOT FOUND"});
  res.statusCode(404);
  next(new Error("cant handle request"))
});

module.exports = adminRouter