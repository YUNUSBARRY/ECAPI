const { UnauthenticatedError, BadRequestError, UnauthorizedError } = require("../errors");
const { isTokenValid } = require("../utils");

// const authenticateUserssss = async (req, res, next) => {
//   const token = req.signedCookies.token;

//   console.log(req.signedCookies)

//   if (!token) {
//     throw new UnauthenticatedError("Authentication invalid [first instance]");
//   }

//   try {
//     const {userId, name, role} = isTokenValid( token );
//     req.user = {userId, name, role}
//     next();
//   } catch (error) {
//     console.log(error);
//     throw new UnauthenticatedError(
//       "Authentication invalid [ second instance ]",
//     );
//   }
// };

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token

  if (!token) {
    throw new BadRequestError('Authentication failed')
  }
  
  try {
    const payload = isTokenValid(token)
    req.user = {userId: payload.userId, name: payload.name, role: payload.role}
    next()
  } catch (error) {
    console.log(error)
    throw new BadRequestError('Authentication failed')
  }
}

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Access denied')
    }
    next()
  }
}

module.exports = {authenticateUser, authorizePermissions};