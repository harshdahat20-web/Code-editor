const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Mongodb connected successfully");
  } catch (err) {
    console.error("Mongodb connection failed:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
