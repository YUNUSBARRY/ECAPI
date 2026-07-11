require("dotenv").config({ quiet: true });
require("express-async-errors");

const express = require("express");
const app = express();

// Packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

// Database
const connectDB = require("./db/connect");

// Routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/user-routes");
const productRouter = require("./routes/products-routes");
const reviewRouter = require("./routes/review-routes");
const orderRouter = require("./routes/order-routes");

// Middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// Core Middleware
app.use(fileUpload());
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static(path.join(__dirname, "public")));

// Test Routes
app.get("/", (req, res) => {
  res.send("E-Commerce API");
});

app.get("/home", (req, res) => {
  console.log(req.signedCookies);
  res.send("E-Commerce API cookies");
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// Error Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Server Start
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connection established");
    app.listen(port, () => console.log(`Server listening on port: ${port}...`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();