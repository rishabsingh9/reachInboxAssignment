const express = require("express");
require("dotenv").config();
const { createConfig } = require("../helpers/utils");
const axios = require("axios");
const { connection, redisGetToken, } = require("../middlewares/redis.middleware");
const { ConfidentialClientApplication } = require("@azure/msal-node");

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });

const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
// const redirectUri = "http://localhost:4400/outlook/callback";
const redirectUri ="https://reachinbox-assignment-4rf9.onrender.com/outlook/callback";
const scopes = ["user.read", "Mail.Read", "Mail.Send"];

const ccaConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/common`,
    clientSecret,
  },
};

const cca = new ConfidentialClientApplication(ccaConfig);

const signin = (req, res) => {
  const authCodeUrlParameters = {
    scopes,
    redirectUri,
  };

  cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
    res.redirect(response);
  });
};