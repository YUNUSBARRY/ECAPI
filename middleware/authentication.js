const { UnauthenticatedError } = require("../errors")

const authenticateUser = async (req,res,next) => {
  const authHeaders = req.headers.Authorization

  if(!authHeaders || !authHeaders.startsWith('Beare ')) {
    throw new UnauthenticatedError('Authentication invalid')
  }
}