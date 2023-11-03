const  mysql = require('mysql2/promise');
const config = require("./env.js");

// create the connection to the database
const connection = mysql.createConnection({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
});

connection
  .then((conn) => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

module.exports = connection;
