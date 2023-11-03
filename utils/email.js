const nodemailer = require("nodemailer"); 
const logger = require("../middlewares/logger");
require("dotenv").config();

// Create a transporter object
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
     user: process.env.Email,
     pass: process.env.EmailPassword,
    },
   });

// Function to send a reset token email
async function sendResetEmail(to, role, token) {
  // Email message options
  const mailOptions = {
    from: 'hephzylizzy@gmail.com', // Sender's email address
    to, // Recipient's email address
    subject: "RESET YOUR PASSWORD", // Email subject
    text: `Here is the link to reset your password
    localhost:${process.env.PORT}/:${role}/forgot-password/${token}
    NOTE: This link expires in ${process.env.EXPIRY}
    `, // Email body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.response);
    return info.response;
  } catch (error) { 
    logger.warn('Error:', error.message);
    throw Error(error);
  }
}

// Function send a successful register email
async function registerEmail(from, to) {
  // Email message options
  const mailOptions = {
    from, // Sender's email address
    to, // Recipient's email address
    subject: "REGISTERATION SUCCESSFUL", // Email subject
    text: ` You have successfully been registered.` // Email body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.response);
    return info.response;
  } catch (error) { 
    logger.warn('Error:', error.message);
    throw Error(error);
  }
}

// Function send a successful reset password email
async function passwordResetEmail(to, text) {
  // Email message options
  const mailOptions = {
    from: 'hephzylizzy@gmail.com', // Sender's email address
    to, // Recipient's email address
    subject: "UPDATED PASSWORD", // Email subject
    text: `You successfully changed your password` // Email body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.response);
    return info.response;
  } catch (error) { 
    logger.warn('Error:', error.message);
    throw Error(error);
  }
}

// Function send a warning closed email
async function warningEmail(to) {
  // Email message options
  const mailOptions = {
    from: 'hephzylizzy@gmail.com', // Sender's email address
    to, // Recipient's email address
    subject: "ACCOUNT CLOSURE", // Email subject
    text: `You violated our terms and conditions and so your account has been closed` // Email body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent:', info.response);
    return info.response;
  } catch (error) { 
    logger.warn('Error:', error.message);
    throw Error(error);
  }
}

module.exports = {
  registerEmail,
  sendResetEmail,
  passwordResetEmail,
  warningEmail
}
