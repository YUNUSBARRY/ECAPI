const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const createJWT = function (payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = function ({ res, user }) {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24; // Must match the JWT_LIFETIME set in enviroment variables

  res.cookie("token", token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };