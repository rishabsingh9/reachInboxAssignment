const axios = require("axios");
const express = require("express");
require("dotenv").config();
const { createConfig } = require("../helpers/utils");
const { OAuth2Client } = require("google-auth-library");
const { connection } = require("../middlewares/redis.middleware");
const googleRouter = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_SECRECT_KEY });

// google oauth
const oAuth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

const scopes = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.modify",
];

googleRouter.get("/auth/google", (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(authUrl);
});

let accessToken;
googleRouter.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    const { access_token, refresh_token, scope } = tokens;

    accessToken = access_token;

    if (scope.includes(scopes.join(" "))) {
      res.send("Restricted scopes test passed.");
    } else {
      res.send("Restricted scopes test failed: Scopes are not restricted.");
    }
  } catch (error) {
    console.error("Error exchanging authorization code:", error.message);
    res.status(500).send("Error exchanging authorization code.");
  }
});

// git user profile details
const getUser = async (req, res) => {
  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/${req.params.email}/profile`;

    const token = accessToken;
    connection.setex(req.params.email, 3600, token);

    if (!token) {
      return res.send("Token not found , Please login again to get token");
    }

    const config = createConfig(url, token);

    const response = await axios(config);

    res.json(response.data);
  } catch (error) {
    console.log("Can't get user email data ", error.message);
    res.send(error.message);
  }
};