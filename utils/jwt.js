const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { token } = require("morgan");

// const createJWTs = function ({ payload }) {
//   const token = jwt.sign(payload, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });
//   return token;
// };

// const isTokenValids = function ({ token }) {
//   return jwt.verify(token, process.env.JWT_SECRET);
// };

// const attachCookiesToResponses = function ({ res, user }) {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24; // Must match the JWT_LIFETIME set in enviroment variables

//   res.cookie("token", token, {
//     httpOnly: true,
//     signed: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === "production",
//   });
// };

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + oneDay),
    signed: true,
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };