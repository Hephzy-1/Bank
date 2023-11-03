const winston = require("winston");

// Create a logger instance with some configuration
const logger = winston.createLogger({
  level: 'info', // The minimum level of messages to log
  format: winston.format.json(), // The format of the messages
  transports: [ // The transports to use for logging
    new winston.transports.File({ filename: 'app.log' }), // Log to a file
  ],
})
module.exports = logger;
