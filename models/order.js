const mongoose = require("mongoose");

const Schema = mongooe.Schema;

const OrderSchema = new Schema(
  {
    tax: {
      type: Number,
    },
    sheepingFee: {
      type: Number,
    },
    subtotal: {
      type: Number,
    },
    total: {
      type: Number,
    },
    orderItems: {
      type: [String],
    },
    status: {
      type: String,
    },
    user: { type: Schema.Types.objectId, ref: "User" },
    clientSecret: {
      type: String,
    },
    paymentId: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);