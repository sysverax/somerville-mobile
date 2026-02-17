const mongoose = require("mongoose");
const { MONGO_URI } = require("./envConfig");

const connectDB = async (logger) => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("MongoDB connection failed", { error: err.message });
    process.exit(1);
  }
};

module.exports = connectDB;
