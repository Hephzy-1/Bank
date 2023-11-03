const dB = require ('../config/db'); // Import your existing database dB module
const { hashPassword } = require ("../utils/hash.js");
const { registerEmail, sendResetEmail, passwordResetEmail } = require ("../utils/email.js");
const { generateToken } = require("../utils/jwt");
const { registerSchema, loginSchema, resetSchema, resetLinkSchema } = require ("../validation/auth.js");
const config = require ("../config/env.js");
const jwt = require('../utils/jwt');
const logger = require('../middlewares/logger');

// Checks user
async function check(email, username, role) {
  const query = `
    SELECT COUNT(*)
    FROM ${role}
    WHERE Email = ? AND Username = ?
  `;
  const values = [email, username];
  const result = (await dB).query(query, values);
  return result;
}

// Register
async function register(payload, role) {

  const { error, value } = registerSchema.validate(payload);

  if (error) {
    console.log(error.details, error.message)
    throw Error(error.message);
  }

  const { email, first_name, last_name, username, DOB, password } = value;

  // Calculate the age
  let today = new Date();
  let birth = new Date(DOB);
  let age = today.getFullYear() - birth.getFullYear();
  let m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // Check if the user is over 18
  if (age < 18) {
    throw Error('Only Users above 18 can create accounts');
  }

  try {

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO ${role} (Email, First_name, Last_name, Username, DOB, Password)
      VALUES(?, ?, ?, ?, ?, ?)
    `;
      
    if (role === 'admins') {
      const values = [ email, first_name, last_name, username, DOB, hashedPassword ];
      const result = (await dB).query(query, values);
      const response =  await registerEmail(email, config.SENDER_EMAIL)

      console.log(response);
      return result;
    } else if (role === 'users') {
      const values = [ email, first_name, last_name, username, DOB, hashedPassword ];
      const result = (await dB).query(query, values);

      const response =  await registerEmail(email, config.SENDER_EMAIL)
      console.log(response);
      return result;
    } else {
      throw new Error(`INVALID ROLE`);
    }
    
  } catch (err) {
   throw Error (err.message);
  }
}

// Login
async function login(payload, role) {

  const { error, value } = loginSchema.validate(payload)
  if (error) {
    throw Error(error.message)
  }

  const { email, username, password } = value; 

  try {
    // Check if user exists
    const userExists = await check(email, username, role);
    if (!userExists) {
      // Log error message
      logger.error(`User with email ${email} and role ${role} does not exist`);
      throw new Error(`This Email Doesn't Exist`);
    }

    // Get user from database
    const query = `
      SELECT *
      FROM ${role}
      WHERE Email = ? AND Username = ?
    `;

    const values = [email, username];
    const result = (await dB).query(query, values);

    
    // Log info message
    logger.info(`User with email ${email} and role ${role} retrieved from database`);

    return result;

  } catch (err) {
    throw Error(err.message);
  }
}

// Reset token link
const resetLink =  async (payload, role) => {

  const { error, value } = resetLinkSchema.validate(payload)
  if (error) {
    throw Error(error.message);
  }

  
  const { email, username } = value;

  const token = await generateToken(email)
  console.log(token);

  // Check if user exists
    const userExists = await check(email, username, role);
    if (!userExists) {
      // Log error message
      logger.error(`User with email ${email} and role ${role} does not exist`);
      throw new Error(`This Email Doesn't Exist`);
    }

  try {
    const response =  await sendResetEmail(email, role, token, config.SENDER_EMAIL)
    return response;
  
  } catch (error) {
    throw Error(error.message)
  }
}

// Reset password
async function reset(payload, role, req) {
  try {
    const decoded = await jwt.verifyToken(req.params.token);
    console.log(decoded);

    const { error, value } = resetSchema.validate(payload)
    if (error) {
      throw Error(error.message);
    }

    const { email, username, password, confirmpassword } = value;

    if (!decoded) {
      throw Error('Invalid token')
    } 

    if (email === decoded.email) {
      if (password !== confirmpassword) {
        throw Error('Passwords have to match')
      }

      const query = `
          UPDATE ${role}
          SET Password = ?
          WHERE Email = ? AND Username = ?
        `;
        
      const hashedPassword = await hashPassword(password);
      console.log(hashedPassword);

      if (role === "admins") {
        
        const values = [ hashedPassword, email, username ];
        const response =  await passwordResetEmail(email, config.SENDER_EMAIL);
        const result = await (await dB).query(query, values, response);
      
        return result;
      } else if (role === "users") {

        const values = [ hashedPassword, email, username ];
        const response =  await passwordResetEmail(email, config.SENDER_EMAIL);
        const result = await (await dB).query(query, values, response)

        return result;
      } else {
        throw Error('Invalid role')
      }
    }
  
  } catch (error) {
    throw error;
  }
}

// app.post("/forgot-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const token = jwt.generateToken(email);
//     await emailService(email, "PASSWORD RESET", token);
//     res.send(`RESET LINK EXPIRES IN ${process.env.EXPIRY}`);
//   } catch (error) {
//     logger.error(`Error in /forgot-password: ${error.message}`);
//     res.status(500).send(error.message);
//   }
// }); 

// app.post("/reset-password/:token", (req, res) => {
//   try {
//     const decoded = jwt.verifyToken(req.params.token);
//     if (!decoded) {
//       logger.warn("Invalid token received.");
//       res.status(400).send("INVALID TOKEN");
//     } else {
//       const { password } = req.body;
//       const user = User.find((user) => user.email === decoded); 
//       if (user) {
//         user.password = password;
//         logger.info(`Password reset for user: ${user.email}`);
//         res.status(200).json({ user, User });
//       } else {
//         logger.warn(`User not found for email: ${decoded}`);
//         res.status(404).send("User not found");
//       }
//     }
//   } catch (error) {
//     logger.error(`Error in /reset-password: ${error.message}`);
//     res.status(500).send(error.message);
//   }
// });

module.exports = {
  register,
  login,
  reset,
  resetLink
}