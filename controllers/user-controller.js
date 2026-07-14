const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
} = require("../errors");

const {
  attachCookiesToResponse,
  createTokenUser,
  checkPermission,
} = require("../utils");

// ===============================
// GET ALL USERS (ADMIN ONLY)
// ===============================
const getAllUsers = async (req, res) => {
  // Fetch all users with role "user" and exclude password field
  const users = await User.find({ role: "user" }).select("-password");

  // Respond with list of users
  res.status(StatusCodes.OK).json({ users });
};

// ===============================
// GET SINGLE USER
// ===============================
const getSingleUser = async (req, res) => {
  // Log current authenticated user (for debugging)
  console.log(req.user);

  // Extract userId from request parameters
  const {
    params: { userId },
  } = req;

  // Find user by ID and exclude password
  const user = await User.findOne({ _id: userId }).select("-password");

  if (!user) {
    // Throw error if user does not exist
    throw new NotFoundError(`No user with id: ${userId} found`);
  }

  // Ensure the logged-in user has permission to view this user
  checkPermission({ requestUser: req.user, resourceUserId: user._id });

  // Respond with user data
  res.status(StatusCodes.OK).json({ user });
};

// ===============================
// SHOW CURRENT LOGGED-IN USER
// ===============================
const showCurrentUser = async (req, res) => {
  // Simply return the authenticated user stored in req.user
  res.status(StatusCodes.OK).json({ user: req.user });
};

// ===============================
// UPDATE USER (NAME & EMAIL)
// ===============================
const updateUser = async (req, res) => {
  // Extract name, email, and authenticated userId
  const {
    body: { name, email },
    user: { userId },
  } = req;

  // Validate required fields
  if (!name || !email) {
    throw new NotFoundError("Please provide name and email");
  }

  // Update user document and return updated version
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { name, email },
    { runValidators: true, returnDocument: "after" }
  );

  // Create a token-friendly user object
  const tokenUser = createTokenUser(user);

  // Refresh authentication cookies with updated user info
  attachCookiesToResponse({ res, user: tokenUser });

  // Respond with updated user
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// ===============================
// UPDATE USER PASSWORD
// ===============================
const updateUserPassword = async (req, res) => {
  // Extract authenticated userId and password fields
  const {
    user: { userId },
    body: { oldPassword, newPassword },
  } = req;

  // Validate required fields
  if (!oldPassword || !newPassword) {
    throw new BadRequestError(
      "Please provide both the old and the new password",
    );
  }

  // Find user by ID
  const user = await User.findOne({ _id: userId });

  // Compare provided old password with stored password
  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    // Throw error if old password is incorrect
    throw new UnauthenticatedError("Invalid credentials");
  }

  // Assign new password to user document
  user.password = newPassword;

  // Save user to trigger hashing middleware
  await user.save();

  // Respond with success message
  res
    .status(StatusCodes.OK)
    .json({ msg: `User password updated Successfully: ${newPassword}` });
};

// ===============================
// EXPORT CONTROLLERS
// ===============================
module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
