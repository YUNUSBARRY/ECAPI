const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product");
const { NotFoundError, BadRequestError } = require("../errors");
const fs = require("fs");
const path = require("path");

// ===============================
// CREATE PRODUCT
// ===============================
const createProduct = async (req, res) => {
  // Attach the authenticated user's ID to the product body
  req.body.user = req.user.userId;

  // Create the product document in the database
  const product = await Product.create(req.body);

  // Respond with the newly created product
  res.status(StatusCodes.CREATED).json({ product });
};

// ===============================
// GET ALL PRODUCTS
// ===============================
const getAllProducts = async (req, res) => {
  // Retrieve all products from the database
  const products = await Product.find({});

  // Return count and list of products
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

// ===============================
// GET SINGLE PRODUCT
// ===============================
const getSingleProduct = async (req, res) => {
  // Extract productId from request parameters
  const {
    params: { productId },
  } = req;

  // Find product by ID [use virtual to populate the reviews field because they are not connected]
  const product = await Product.findOne({ _id: productId }).populate('reviews');

  if (!product) {
    // Throw error if product does not exist
    throw new NotFoundError(`No product with id: ${productId} found`);
  }

  // Return the found product
  res.status(StatusCodes.OK).json({ reviews: product.reviews.length, product });
};

// ===============================
// UPDATE PRODUCT
// ===============================
const updateProduct = async (req, res) => {
  // Extract productId and request body
  const {
    params: { productId },
    body,
  } = req;

  // Update product and return the updated document
  const product = await Product.findOneAndUpdate({ _id: productId }, body, {
    returnDocument: "after", // Return updated version
    runValidators: true,     // Ensure validation rules are applied
  });

  if (!product)
    // Throw error if product does not exist
    throw new NotFoundError(`No product with id: ${productId} found`);

  // Respond with updated product
  res.status(StatusCodes.OK).json({ product });
};

// ===============================
// DELETE PRODUCT
// ===============================
const deleteProduct = async (req, res) => {
  // Extract productId from request parameters
  const {params: { productId },body} = req;

  // Find product by ID
  const product = await Product.findOne({ _id: productId });

  if (!product) {
    // Throw error if product does not exist
    throw new NotFoundError(`No product with id: ${productId} found`);
  }

  // Delete the product document
  await product.deleteOne();

  // Send confirmation response
  res.status(StatusCodes.OK).json({ msg: "Product deleted" });
};

// ===============================
// UPLOAD PRODUCT IMAGE
// ===============================
const uploadImage = async (req, res) => {
  // Ensure a file was uploaded
  if (!req.files) {
    throw new BadRequestError("No file uploaded");
  }

  // Extract the uploaded image file
  const productImage = req.files.image;

  // Validate that the uploaded file is an image
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError("Please upload image");
  }

  // Define maximum allowed file size (1MB)
  const maxSize = 1024 * 1024;

  // Validate file size
  if (productImage.size > maxSize) {
    throw new BadRequestError(`Please upload an image that is smaller than ${maxSize}kb`);
  }

  // Build the path where the image will be stored
  const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`);

  // Move the uploaded file to the uploads directory
  await productImage.mv(imagePath);

  // Respond with the image URL
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

// ===============================
// EXPORT CONTROLLERS
// ===============================
module.exports = {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};