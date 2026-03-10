const mongoose = require("mongoose");
const { MONGO_URI } = require("./envConfig");

const connectDB = async (logger) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(MONGO_URI);
    logger.info("MongoDB connected successfully");
    return mongoose.connection;
  } catch (err) {
    logger.error("MongoDB connection failed", { error: err.message });
    throw err;
  }
};

module.exports = connectDB;
