const appError = require("../utils/errors/errors");
const authRepo = require("../repositories/auth.repo");
const { USER_ROLES } = require("../utils/constants/user.constants");
const { generateJWTToken } = require("../utils/token/token");
const { hashPassword, verifyPassword } = require("../utils/password/password");
const { AuthResponseDTO } = require("../dtos/auth.dtos/res.auth.dto");

const adminRegisterService = async (registerAdminRequestDTO, logger) => {
  logger?.info("Admin register payload received", {
    email: registerAdminRequestDTO.email,
  });

  const existingUser = await authRepo.findUserByEmailRepo(
    registerAdminRequestDTO.email,
  );

  if (existingUser) {
    logger?.warn("Admin register conflict: user already exists", {
      email: registerAdminRequestDTO.email,
    });

    throw new appError.ConflictError(
      "Admin already exists",
      "An account with this email is already registered.",
      "Use a different email or login with the existing account.",
    );
  }

  const hashedPassword = hashPassword(registerAdminRequestDTO.password);

  const user = await authRepo.createAdminUserRepo({
    name: registerAdminRequestDTO.name,
    email: registerAdminRequestDTO.email,
    passwordHash: hashedPassword,
  });

  const accessToken = generateJWTToken({
    userId: user._id.toString(),
    userRole: USER_ROLES.ADMIN,
  });

  logger?.info("Admin registered in database", {
    userId: user._id.toString(),
    email: user.email,
  });

  return new AuthResponseDTO({
    user,
    accessToken,
  });
};

const adminLoginService = async (loginAdminRequestDTO, logger) => {
  logger?.info("Admin login payload received", {
    email: loginAdminRequestDTO.email,
  });

  const user = await authRepo.findUserByEmailRepo(loginAdminRequestDTO.email);

  if (!user || user.role !== USER_ROLES.ADMIN) {
    logger?.warn("Admin login failed: user not found or invalid role", {
      email: loginAdminRequestDTO.email,
    });

    throw new appError.UnauthorizedError(
      "Invalid credentials",
      "No admin account was found for the provided email.",
      "Check your credentials and try again.",
    );
  }

  if (!user.isActive) {
    logger?.warn("Admin login blocked: account inactive", {
      userId: user._id.toString(),
    });

    throw new appError.ForbiddenError(
      "Account is inactive",
      "This admin account has been disabled.",
      "Contact support to reactivate your account.",
    );
  }

  const isPasswordValid = verifyPassword(
    loginAdminRequestDTO.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    logger?.warn("Admin login failed: invalid password", {
      userId: user._id.toString(),
    });

    throw new appError.UnauthorizedError(
      "Invalid credentials",
      "Password does not match the registered account.",
      "Check your credentials and try again.",
    );
  }

  const accessToken = generateJWTToken({
    userId: user._id.toString(),
    userRole: USER_ROLES.ADMIN,
  });

  logger?.info("Admin login successful", {
    userId: user._id.toString(),
  });

  return new AuthResponseDTO({
    user,
    accessToken,
  });
};

module.exports = {
  adminRegisterService,
  adminLoginService,
};
