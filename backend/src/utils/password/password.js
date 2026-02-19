const crypto = require("crypto");

const { PASSWORD_CONFIG } = require("../../config/envConfig");

const hashPassword = (password) => {
  return crypto
    .createHmac("sha256", PASSWORD_CONFIG.PREDEFINED_SALT)
    .update(password)
    .digest("hex");
};

const verifyPassword = (plainPassword, hashedPassword) => {
  const incomingHash = hashPassword(plainPassword);
  return incomingHash === hashedPassword;
};

module.exports = {
  hashPassword,
  verifyPassword,
};