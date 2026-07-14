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

// ===============================
// REGISTER USER
// ===============================
const register = async function (req, res) {
  // Extract required fields from request body
  const {
    body: { name, email, password },
  } = req;

  // Validate required fields
  if (!name || !email || !password) {
    throw new BadRequestError("Please provide name, email and password");
  }

  // Check if email is already registered
  if (await User.findOne({ email })) {
    throw new BadRequestError("Email already in use");
  }

  // Determine if this is the first account in the system
  const isFirstAccount = (await User.countDocuments({})) === 0;

  // First registered user becomes admin, others become normal users
  const role = isFirstAccount ? "admin" : "user";

  // Create new user document
  const user = await User.create({ name, email, password, role });

  // Create token-friendly user object
  const tokenUser = createTokenUser(user);

  // Log token user for debugging
  console.log(tokenUser);

  // Attach JWT cookie to response
  attachCookiesToResponse({ res, user: tokenUser });

  // Respond with created user
  res.status(StatusCodes.CREATED).json({ user });
};

// ===============================
// LOGIN USER
// ===============================
const login = async (req, res) => {
  // Extract email and password from request body
  const {
    body: { email, password },
  } = req;

  // Validate required fields
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    // Throw error if user does not exist
    throw new UnauthenticatedError("Invalid credentials {User}");
  }

  // Compare provided password with stored hashed password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    // Throw error if password is incorrect
    throw new UnauthenticatedError("Invalid credentials {password}");
  }

  // Create token-friendly user object
  const tokenUser = createTokenUser(user);

  // Attach JWT cookie to response
  attachCookiesToResponse({ res, user: tokenUser });

  // Respond with authenticated user
  res.status(StatusCodes.OK).json({ user });
};

// ===============================
// LOGOUT USER
// ===============================
const logout = async function (req, res) {
  // Overwrite the token cookie with a "logged out" value
  res.cookie("token", "logged out", {
    httpOnly: true,
    expires: new Date(Date.now()), // Expire immediately
  });

  // Respond with logout confirmation
  res.status(StatusCodes.OK).json({ msg: "Log out" });
};

// ===============================
// EXPORT AUTH CONTROLLERS
// ===============================
module.exports = {
  register,
  login,
  logout,
};