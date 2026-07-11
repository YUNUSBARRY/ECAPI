const createTokenUser = ( user ) => {
  // console.log(user)
  return {userId: user._id, name: user.name, role: user.role};
};

module.exports = { createTokenUser };