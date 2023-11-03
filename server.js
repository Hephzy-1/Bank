const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const { authUser } = require("./middlewares/auth");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const accountRoute = require("./routes/account");
const { errorHandler } = require("./middlewares/errorHandler");
const logger = require("./middlewares/logger"); // Import the logger middleware

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const port = process.env.PORT;

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the Bank API", req.url);
})

app.use("/auth", authRoute)
app.use(authUser)
app.use("/admin", adminRoute)
app.use("/accounts", accountRoute)
app.use(errorHandler);

app.use((req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({message: "PAGE NOT FOUND"});
});

app.listen(port, () => {
  logger.info(`Server running on PORT ${port}`);
});