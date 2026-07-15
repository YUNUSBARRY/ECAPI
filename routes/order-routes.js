const express = require("express");

const {
  authorizePermissions,
  authenticateUser,
} = require("../middleware/authentication");

const {
  getAllOrders,
  getCurrentUserOrders,
  createOrder,
  getSingleOrder,
  updateOrder,
} = require("../controllers/order-controller");
const router = express.Router();

router.route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrders);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router.route("/:orderId")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
