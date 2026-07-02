const { UnauthenticatedError } = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnauthenticatedError("Authentication invalid [first instance]");
  }

  try {
    const {userId, name, role} = isTokenValid({ token });
    req.user = {userId, name, role}
    next();
  } catch (error) {
    console.log(error);
    throw new UnauthenticatedError(
      "Authentication invalid [ second instance ]",
    );
  }
};

module.exports = authenticateUser;