const User = require("../models/user");
const { USER_ROLES } = require("../utils/constants/user.constants");

const findUserByEmailRepo = async (email) => {
  return User.findOne({ email: email.toLowerCase().trim() });
};

const createAdminUserRepo = async ({ name, email, passwordHash }) => {
  return User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: USER_ROLES.ADMIN,
  });
};

module.exports = {
  findUserByEmailRepo,
  createAdminUserRepo,
};