const express = require("express");

const {getAllReviews,createReview,getSingleReview,updateReview,deleteReview, getSingleProductReviews} = require("../controllers/review-controller");

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const router = express.Router();

router.route("/")
  .get(getAllReviews)
  .post(authenticateUser, createReview)

router.route("/:reviewId")
  .get(getSingleReview)
  .patch(authenticateUser, authorizePermissions("admin"), updateReview)
  .delete(authenticateUser, deleteReview);

module.exports = router;