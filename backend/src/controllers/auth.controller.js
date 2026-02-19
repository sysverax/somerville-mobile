const authService = require("../services/auth.service");
const cookieUtils = require("../utils/cookie/cookie");
const { USER_ROLES } = require("../utils/constants/user.constants");
const appError = require("../utils/errors/errors");
const {
  RegisterAdminRequestDTO,
  LoginAdminRequestDTO,
} = require("../dtos/auth.dtos/req.auth.dto");

const adminRegisterController = async (req, res, next) => {
  try {
    req.logger.info("Admin register request received");
    const registerAdminRequestDTO = new RegisterAdminRequestDTO(req.body);
    registerAdminRequestDTO.validate();

    const authResponse = await authService.adminRegisterService(
      registerAdminRequestDTO,
      req.logger,
    );

    cookieUtils.setCookie(res, USER_ROLES.ADMIN, authResponse.accessToken);

    req.logger.info("Admin register request completed successfully", {
      userId: authResponse.user.id,
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      data: authResponse,
      error: null,
    });
  } catch (error) {
    req.logger.error("Admin register request failed", {
      error: error.message,
    });
    if (error instanceof appError.AppError) {
      return next(error);
    }
    return next(
      new appError.InternalServerError(
        "Admin registration failed",
        "An unexpected error occurred during admin registration.",
        "Please try again later.",
      ),
    );
  }
};

const adminLoginController = async (req, res, next) => {
  try {
    req.logger.info("Admin login request received");
    const loginAdminRequestDTO = new LoginAdminRequestDTO(req.body);
    loginAdminRequestDTO.validate();

    const authResponse = await authService.adminLoginService(
      loginAdminRequestDTO,
      req.logger,
    );

    cookieUtils.setCookie(res, USER_ROLES.ADMIN, authResponse.accessToken);

    req.logger.info("Admin login request completed successfully", {
      userId: authResponse.user.id,
    });

    return res.status(200).json({
      message: "Admin login successful",
      data: authResponse,
      error: null,
    });
  } catch (error) {
    req.logger.error("Admin login request failed", {
      error: error.message,
    });
    if (error instanceof appError.AppError) {
      return next(error);
    }
    return next(
      new appError.InternalServerError(
        "Admin login failed",
        "An unexpected error occurred during admin login.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  adminRegisterController,
  adminLoginController,
};
