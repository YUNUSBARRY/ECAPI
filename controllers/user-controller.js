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

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  console.log(req.user);
  const {
    params: { userId },
  } = req;
  const user = await User.findOne({ _id: userId }).select("-password");

  if (!user) {
    throw new NotFoundError(`No user with id: ${userId} found`);
  }

  checkPermission({ requestUser: req.user, resourceUserId: user._id });

  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const {
    body: { name, email },
    user: { userId },
  } = req;

  if (!name || !email) {
    throw new NotFoundError("Please provide name and email");
  }

  const user = await User.findOneAndUpdate({ _id: userId },{ name, email },{ runValidators: true, returnDocument: "after" });

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const {
    user: { userId },
    body: { oldPassword, newPassword },
  } = req;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError(
      "Please provide both the old and the new password",
    );
  }

  const user = await User.findOne({ _id: userId });

  // console.log({ user: user });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  user.password = newPassword;

  await user.save();

  res
    .status(StatusCodes.OK)
    .json({ msg: `User password updated Successfully: ${newPassword}` });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};