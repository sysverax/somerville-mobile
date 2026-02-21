const constants = require("../constants/constants");

const isValidPassword = (password) => {
  // At least 8 chars, one lowercase, one uppercase, one digit, one special (@#$!%*?&)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const isValidImageType = (mimeType) => {
  return constants.IMAGE_TYPES.includes(mimeType);
};

const isValidFileSize = (fileSize) => {
  return fileSize <= constants.MAX_FILE_SIZE;
};

module.exports = {
  isValidPassword,
  isValidImageType,
  isValidFileSize,
};
