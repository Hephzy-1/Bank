const { register, login, reset, resetLink } = require("../models/auth");
const { comparePassword } = require ("../utils/hash.js");
const { generateToken } = require ("../utils/jwt.js");

// CUSTOM ERRORS
class UserNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "This User or Email Doesn't Exist";
    this.code = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "This Role Doesn't Exist";
    this.code = 404;
  }
}

// REGISTER
async function registration(req,res){
  try{
    const role = req.params.role
    const result = await register(req.body, role)
    console.log(result);
  
    if (result) {
      res.status(201).json({message:"Created succesfully" })
    } else {
      res.status(400).json({message: `Duplicate Username or Email`, error : error.message })
    }
  }
  catch(err){
    if (err === 'INVALID ROLE') {
      res.status(404).json({message: `This role doesn't exist`});
    } else if (err === 'Only Users above 18 can create accounts') {
      res.status(404).json({message: `You can't create an account because you are under 18`})
    }else {
      res.status(500).json({ message: `INTERNAL SERVER ERROR`, error: err.message });
    }
  }
}

// LOGIN 
async function loginUser(req,res){
  try{
    const role = req.params.role
    const result = await login(req.body, role);

    const user = result[0][0]
    console.log(user);

    if (!user) {
      throw Error("This User doesn't exist");
    }

    const isMatch = await comparePassword(req.body.password, user.Password);
    const token = await generateToken(user.Email);

    if (!isMatch) {
      throw Error(`INVALID INFORMATION`);
    } else {
      return res.cookie('token', token, {httpOnly: true, expires: new Date(Date.now() + 10000000)}).status(202).json({message: `LOGIN SUCCESSFUL`, token: token})
    }
    
    // Catch and handle errors
  } catch(err){
    if (err === "This User doesn't exist") {
      res.status(404).json({message: `This User doesn't have a profile with us`});
    } else if (err === "INVALID INFORMATION") {
      res.status(401).json({message: `Invalid Password`})
    }else {
      res.status(500).json({ message: `INTERNAL SERVER ERROR`, error: err.message });
    }
    
  }
}

// RESET LINK
async function sendResetLink(req, res, next) {
  try {
    const role = req.params.role;
    const data = await resetLink(req.body, role);

    if (data === false) {
      res.status(404).json({ message: "INVALID USERNAME" }); 

    } else {
      res.status(203).json({ 
        message: "PASSWORD RESET LINK SENT" 
      });
    }
  } catch (error) {
      res.status(500).json({ message: `INTERNAL SERVER ERROR`, error: error.message });
    next(error)
  }
}

// RESET PASSWORD
async function resetPassword(req,res) {
  try {
    const role = req.params.role
    const result = await reset(req.body, role, req);
    console.log(result) 

    if (!result) {
      return res.status(400).json({message: `Error Occured` })
    } else {
      return res.status(200).json({message: `PASSWORD RESET SUCCESSFUL`})
    }
 }
  catch(err){
    if (err instanceof ValidationError) {
      res.status(404).json({message: `This role doesn't exist`});
    } else if (err instanceof UserNotFoundError) {
      res.status(404).json({message: `This User doesn't exist`})
    }else {
      res.status(500).json({ message: `INTERNAL SERVER ERROR`, error: err.message });
    }
  }    
}

// LOGOUT
async function logout(req, res) {
  try {
    res.clearCookie("token");
    res.json({ message: "LOGOUT SUCCESSFUL" });
  } catch (error) {
    res.status(500).json({message: `INTERNAL SERVER ERROR`, error: error.message})
  }
}

module.exports = {
  registration,
  loginUser,
  resetPassword,
  sendResetLink,
  logout
}