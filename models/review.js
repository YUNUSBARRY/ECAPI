const mongoose = require("mongoose");
const product = require("./product");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "please provide review"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "please provide review comment"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true },
);

// Ensures 1 comment per user for a single product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);
  console.log(result);

  try {
    await this.model('Product').findOneAndUpdate({_id: productId}, {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0
    })
  } catch (error) {
    console.log(error)

  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.constructor.calculateAverageRating(this.product);
  },
);

module.exports = mongoose.model("Review", ReviewSchema);