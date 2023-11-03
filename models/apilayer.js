const axios = require('axios');
const config = require('../config/env')
require('dotenv').config()

async function verifyEmail(email) {
  let url = 'https://apilayer.net/api/check';
  let params = {
    access_key: config.APILAYER_KEY,
    email ,
    smtp: 1,
    format: 1
  };
  url += '?' + new URLSearchParams(params).toString();

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.smtp_check) {
      console.log('The email is valid.');
    } else {
      console.log('The email is invalid.');
    }
  } catch (error) {
    console.error(error);
  }
}

verifyEmail('hzdelight01@gmail.com');



// http://apilayer.net/api/check

//     ? access_key = config.ACCESSTOKEN_SECRET
//     & email = config.SENDER_EMAIL
    // & smtp = 1
    // & format = 1