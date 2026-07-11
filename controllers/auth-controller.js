require("dotenv").config({ quiet: true });

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors");
const {
  attachCookiesToResponse,
  createJWT,
  createTokenUser,
} = require("../utils");

const register = async function (req, res) {
  const {
    body: { name, email, password },
  } = req;

  if (!name || !email || !password) {
    throw new BadRequestError("Please provide name, email and password");
  }

  if (await User.findOne({ email })) {
    throw new BadRequestError("Email already in use");
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const tokenUser = createTokenUser(user);

  console.log(tokenUser);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user });
};

const login = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Invalid credentials {User}");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials {password}");
  }

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user });
};

const logout = async function (req, res) {
  res.cookie("token", "logged out", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Log out" });
};

module.exports = {
  register,
  login,
  logout,
};
