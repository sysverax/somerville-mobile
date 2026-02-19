const jwt = require("jsonwebtoken");

const appError = require("../errors/errors");
const { JWT_CONFIG } = require("../../config/envConfig");

const JWT_TOKEN_SECRET = JWT_CONFIG.ACCESS_TOKEN_SECRET;
const JWT_TOKEN_EXPIRE_DURATION = JWT_CONFIG.ACCESS_TOKEN_EXPIRE_DURATION;

const generateJWTToken = ({ userId, userRole, expiresAt }) => {
  return jwt.sign(
    {
      userId,
      userRole,
      expiresAt,
    },
    JWT_TOKEN_SECRET,
    {
      expiresIn: JWT_TOKEN_EXPIRE_DURATION,
    },
  );
};

/**
 * Verify JWT Token
 *
 * @param {string} token
 * @returns {object} userId, userRole, expiresAt
 *
 * @throws {appError.UnauthorizedError}
 */
const verifyJWTToken = (token) => {
  try {
    return jwt.verify(token, JWT_TOKEN_SECRET);
  } catch (err) {
    throw new appError.UnauthorizedError(
      "Invalid or Expired Access Token",
      "The provided access token is invalid or has expired.",
      "Please log in again to obtain a new access token.",
    );
  }
};

module.exports = {
  generateJWTToken,
  verifyJWTToken,
};
