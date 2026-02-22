const cookieUtils = require("../utils/cookie/cookie");
const tokenUtils = require("../utils/token/token");
const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");

const validateRole = (role) => {
  return (req, res, next) => {
    try {
      const token = cookieUtils.getTokenFromCookies(req.cookies, role);
      if (!token) {
        throw new appError.UnauthorizedError(
          "Access token missing",
          "No access token found in cookies.",
          "Please login and try again.",
        );
      }

      const decodedPayload = tokenUtils.verifyJWTToken(token);

      if (decodedPayload.userRole !== role) {
        throw new appError.ForbiddenError(
          "Access denied",
          `User role '${decodedPayload.userRole}' does not have access to this resource.`,
          "Use an account with the required permission and try again.",
        );
      }

      req.user = decodedPayload;
      req.logger = req.logger.child({
        userId: decodedPayload.userId,
        userRole: decodedPayload.userRole,
      });

      return next();
    } catch (error) {
      if (error instanceof appError.AppError) {
        return next(error);
      }

      return next(
        new appError.UnauthorizedError(
          "Unauthorized access",
          "An error occurred while validating the access token.",
          "Please login and try again.",
        ),
      );
    }
  };
};

const validateAdmin = validateRole(USER_ROLES.ADMIN);

const validateRoleBasedHeader = (req, res, next) => {
  const roleHeader = req.headers["x-user-role"] || USER_ROLES.PUBLIC;
  if (!roleHeader) {
    return next(
      new appError.BadRequestError(
        "Missing role header",
        "The 'x-user-role' header is required to determine the user's role.",
        "Include the 'x-user-role' header with a valid role and try again.",
      ),
    );
  }
  if (!Object.values(USER_ROLES).includes(roleHeader)) {
    return next(
      new appError.BadRequestError(
        "Invalid role header value",
        `The 'x-user-role' header value '${roleHeader}' is not valid.`,
        `Use one of the following valid roles: ${Object.values(USER_ROLES).join(
          ", ",
        )} and try again.`,
      ),
    );
  }
  if (roleHeader === USER_ROLES.ADMIN) {
    req.userRole = USER_ROLES.ADMIN;
    return validateAdmin(req, res, next);
  } else {
    req.userRole = USER_ROLES.PUBLIC;
    return next();
  }
};

module.exports = {
  validateAdmin,
  validateRoleBasedHeader,
};
