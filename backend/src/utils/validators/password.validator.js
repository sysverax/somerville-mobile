const isValidPassword = (password) => {
  // At least 8 chars, one lowercase, one uppercase, one digit, one special (@#$!%*?&)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

module.exports = {
  isValidPassword,
};
