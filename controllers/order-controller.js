const Order = require("../models/order");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product");
const Review = require("../models/review");
const { NotFoundError, BadRequestError } = require("../errors");
const { checkPermission } = require("../utils");
const product = require("../models/product");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "kdjfa=-e9idfjkafadf5dfA";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const {
    body: { items: cartItems, tax, shippingFee },
  } = req;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("please provide tax and shipping fees");
  }

  let orderItems = [];
  let subtotal = 0;

  for (let item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });

    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item.product}`);
    }

    const { name, price, image, _Id } = dbProduct;
    console.log({ name, price, image });

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: item.product,
    };
    // add item to order
    // orderItems.push(singleOrderItem);
    orderItems = [...orderItems, singleOrderItem];
    // calculate subtotal
    subtotal += item.amount * price;
  }

  // calculate total
  const total = tax + shippingFee + subtotal;

  // Get client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clienetsecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const getSingleOrder = async (req, res) => {
  const {
    params: { orderId },
  } = req;

  const order = await Order.findOne({ _id: orderId });

  if (!order) {
    throw new NotFoundError(`No order with Id: ${orderId}`);
  }

  checkPermission(req.user, order.user);

  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const {
    user: { userId },
  } = req;

  const orders = await Order.find({ user: userId });

  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

const updateOrder = async (req, res) => {
  let {
    params: { orderId },
    body: { paymentIntentId },
  } = req;
  const order = await Order.findOne({ _id: orderId });

  if (!order) throw new NotFoundError(`No order with id: ${orderId}`);

  checkPermission(req.user, order.user);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  // Object.assign(order, req.body);

  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
