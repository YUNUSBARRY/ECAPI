const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/user-controller");
const authenticateUser = require("../middleware/authentication");
const router = express.Router();

router.route("/").get(authenticateUser, getAllUsers);
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").post(authenticateUser, updateUserPassword);
router.route("/:userId").get(authenticateUser, getSingleUser);

module.exports = router;