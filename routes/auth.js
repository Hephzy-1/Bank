const express = require("express");
const authRouter = express.Router();
const logger = require('../middlewares/logger')
const { registration, loginUser, resetPassword, sendResetLink, logout } = require("../controllers/auth");
const { createSchema } = require("../validation/account");

authRouter.post("/:role", registration);
authRouter.post("/:role/login", loginUser);
authRouter.put("/:role/reset-password/:token", resetPassword);
authRouter.post("/:role/forgot-password", sendResetLink);
authRouter.delete("/logout", logout)

authRouter.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({message: "PAGE NOT FOUND"});
});

module.exports = authRouter;