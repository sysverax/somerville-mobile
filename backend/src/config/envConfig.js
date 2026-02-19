const dotenv = require("dotenv");

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "dev";
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((url) =>
      url.trim().replace(/\/$/, ""),
    )
  : [];

// AWS Configurations
const AWS_CONFIG = {
  REGION: process.env.AWS_REGION || "us-east-1",
  ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
};

const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET:
    process.env.JWT_ACCESS_TOKEN_SECRET || "jwt_access_token_secret_key",
  ACCESS_TOKEN_EXPIRE_DURATION:
    process.env.JWT_ACCESS_TOKEN_EXPIRE_DURATION || "7d",
};

const COOKIE_CONFIG = {
  EXPIRY_DURATION_IN_MS:
    process.env.COOKIE_EXPIRY_DURATION_IN_MS || 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

const PASSWORD_CONFIG = {
  PREDEFINED_SALT: "predefined_salt_for_password_hashing",
};

module.exports = {
  NODE_ENV,
  MONGO_URI,
  PORT,
  ALLOWED_ORIGINS,
  AWS_CONFIG,
  JWT_CONFIG,
  COOKIE_CONFIG,
  PASSWORD_CONFIG,
};
