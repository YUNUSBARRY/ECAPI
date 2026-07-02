const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/user-controller");
const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/showMe").get(showCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").post(updateUserPassword);
router.route("/:userId").get(getSingleUser);

module.exports = router;