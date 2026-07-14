const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const singleCartItemSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
});

const OrderSchema = new Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },

    cartItems: [singleCartItemSchema],

    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
