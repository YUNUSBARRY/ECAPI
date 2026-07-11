const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product");
const Review = require("../models/review");
const { NotFoundError, BadRequestError } = require("../errors");
const { checkPermission } = require("../utils");

// const createReview = async (req, res) => {
//   const {
//     body: { product: productId },
//     user: {userId}
//   } = req;

//   // const {body: {product: productId}} = req

//   const isValidProduct = await Product.findOne({ _id: productId });

//   if (!isValidProduct) {
//     throw new NotFoundError(`No product with id: ${isValidProduct}`)
//   }

//   const alreadySubmitted = await Review.findOne({product: productId, user: userId})

//   if (alreadySubmitted) {
//     throw new BadRequestError('You already submitted a comment for this product')
//   }

//   req.body.user = req.user.userId;

//   const review = await Review.create(req.body);
//   res.status(StatusCodes.CREATED).json({ review });
// };

const createReview = async (req, res) => {
  // get the productId from the body

  const {
    body: { product: productId },
    user: { userId },
  } = req;

  // Look for the product in the database using the prouct Id

  const isProductValid = await Product.findOne({ _id: productId });

  if (!isProductValid) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: userId,
  });

  if (alreadySubmitted) {
    throw new BadRequestError(
      "You already submitted a review for this product",
    );
  }

  req.body.user = userId;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req, res) => {
  const {
    body: { product: productId },
  } = req;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};

const getSingleReview = async (req, res) => {
  const {
    params: { reviewId },
  } = req;
  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const {
    params: { reviewId },
    body,
  } = req;

  if (!body.rating || body.title || body.comment) {
    throw new BadRequestError("please provide rating, title and comment");
  }

  const review = await Review.findOneAndUpdate({ _id: reviewId }, body, {
    runValidators: true,
    returnDocument: "after",
  });

  if (!review) throw new NotFoundError(`No review with id: ${reviewId} found`);

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const {
    params: { reviewId },
  } = req;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermission(req.user, review.user);

  await review.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Review deleted" });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
