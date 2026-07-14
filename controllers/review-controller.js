const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product");
const Review = require("../models/review");
const { NotFoundError, BadRequestError } = require("../errors");
const { checkPermission } = require("../utils");

// ===============================
// CREATE REVIEW
// ===============================
const createReview = async (req, res) => {
  // Extract productId from request body and userId from authenticated user
  const {
    body: { product: productId },
    user: { userId },
  } = req;

  // Verify that the product exists in the database
  const isProductValid = await Product.findOne({ _id: productId });

  if (!isProductValid) {
    // Throw error if product does not exist
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  // Check if the user has already submitted a review for this product
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (alreadySubmitted) {
    // Prevent duplicate reviews from the same user
    throw new BadRequestError(
      "You already submitted a review for this product",
    );
  }

  // Attach the userId to the review body before creating the review
  req.body.user = userId;

  // Create the review document
  const review = await Review.create(req.body);

  // Send response with created review
  res.status(StatusCodes.CREATED).json({ review });
};

// ===============================
// GET ALL REVIEWS FOR A PRODUCT
// ===============================
const getAllReviews = async (req, res) => {
  // Extract productId from request body
  const {
    body: { product: productId },
  } = req;

  // Find all reviews for the given product and populate product details
  const reviews = await Review.find({ product: productId }).populate({
    path: "product",
    select: "name company price",
  });

  // Log each review's user name for debugging purposes
  reviews.map((item, idx) => console.log({ index: idx, name: item.user.name }));

  // Return count and list of reviews
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

// ===============================
// GET SINGLE REVIEW
// ===============================
const getSingleReview = async (req, res) => {
  // Extract reviewId from request parameters
  const {
    params: { reviewId },
  } = req;

  // Find review by ID and populate product details
  const review = await Review.findOne({ _id: reviewId }).populate({
    path: "product",
    select: "name company price",
  });

  if (!review) {
    // Throw error if review does not exist
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  // Return the found review
  res.status(StatusCodes.OK).json({ review });
};

// ===============================
// UPDATE REVIEW
// ===============================
const updateReview = async (req, res) => {
  // Extract reviewId and request body
  const {
    params: { reviewId },
    body,
  } = req;

  // Validate required fields
  if (!body.rating || !body.title || !body.comment) {
    throw new BadRequestError("please provide rating, title and comment");
  }

  // Find review by ID
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    // Throw error if review does not exist
    throw new NotFoundError(`No review with id: ${reviewId} found`);
  }

  // Ensure the logged-in user has permission to update this review
  checkPermission(req.user, review.user);

  // Merge new fields into the existing review object
  Object.assign(review, body);

  // Save updated review
  await review.save();

  // Return updated review
  res.status(StatusCodes.OK).json({ review });
};

// ===============================
// DELETE REVIEW
// ===============================
const deleteReview = async (req, res) => {
  // Extract reviewId from request parameters
  const {
    params: { reviewId },
  } = req;

  // Find review by ID
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    // Throw error if review does not exist
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  // Ensure the logged-in user has permission to delete this review
  checkPermission(req.user, review.user);

  // Delete the review document
  await review.deleteOne();

  // Send confirmation response
  res.status(StatusCodes.OK).json({ msg: "Review deleted" });
};

const getSingleProductReviews = async (req, res) => {
  const {
    params: { productId },
  } = req;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

// Export controller functions
module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews
};
