const { UnauthorizedError } = require("../errors");

const checkPermission = ( requestUser, resourceUserId ) => {
  console.log(resourceUserId.toString());

  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;

  throw new UnauthorizedError("Not authorized to access this route");
};

module.exports = { checkPermission };
