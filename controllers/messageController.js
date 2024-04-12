const axios = require("axios");
const express = require("express");
const { connection, redisGetToken, } = require("../middlewares/redis.middleware");
const { createConfig } = require("../helpers/utils");
const { google } = require("googleapis");
require("dotenv").config();
const OpenAI = require("openai");
const { Queue } = require("bullmq");
const { OAuth2Client } = require("google-auth-library");

const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});


oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });




const getDrafts = async (req, res) => {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/drafts`;
  
    const token = await redisGetToken(req.params.email);
    console.log(token);

    if (!token) {
      return res.send("Token not found , Please login again to get token");
    }
    const config = createConfig(url, token);
    console.log(config);
    const response = await axios(config);
    console.log(response);
    res.json(response.data);
  } catch (error) {
    res.send(error.message);
    console.log("Can't get drafts ", error.message);
  }
};


const readMail = async (req, res) => {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/messages/${req.params.message}`;
   
    const token = await redisGetToken(req.params.email);

    if (!token) {
      return res.send("Token not found , Please login again to get token");
    }
    const config = createConfig(url, token);
    const response = await axios(config);
    let data = await response.data;
    res.json(data);
  } catch (error) {
    res.send(error.message);
    
    console.log("Can't read mail ", error.message);
  }
};

