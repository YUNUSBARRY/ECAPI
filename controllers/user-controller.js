const { StatusCodes } = require('http-status-codes')
const User = require('../models/user')
const { NotFoundError } = require('../errors')

const getAllUsers = async (req, res) => {
  const users = await User.find({role: 'user'}).select('-password')
  res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req, res) => {
  const {params: {userId}} = req
  const user = await User.findOne({_id: userId}).select('-password')

  if (!user) {
    throw new NotFoundError(`No user with id: ${userId} found`)
  }
  
  res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async (req, res) => {
  res.send("Show current user")
}

const updateUser = async (req, res) => {
  res.send("Update User")
}

const updateUserPassword = async (req, res) => {
  res.send("Update User password")
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
}