const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product");
const { NotFoundError, BadRequestError } = require("../errors");
const fs = require("fs");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res) => {
  const {
    params: { productId },
  } = req;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId} found`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const {
    params: { productId },
    body,
  } = req;

  const product = await Product.findOneAndUpdate({ _id: productId }, body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!product)
    throw new NotFoundError(`No product with id: ${productId} found`);

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const {
    params: { productId },
    body,
  } = req;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId} found`);
  }

  await product.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Product deleted" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("No file uploaded")
  }

  const productImage = req.files.image

  if (!productImage.mimetype.startsWith('image')){
    throw new BadRequestError("Please upload image")
  }

  const maxSize = 1024 * 1024

  if (productImage.size > maxSize) {
    throw new BadRequestError(`Please upload an image that is smaller than ${maxSize}kb`)
  }

  const imagePath = path.join(__dirname, '../public/uploads/' + `${productImage.name}`)

  await productImage.mv(imagePath)
  res.status(StatusCodes.OK).json({image: `/uploads/${productImage.name}`})
};

module.exports = {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};