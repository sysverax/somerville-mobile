const tokenDto = require("../dtos/token/token.dto");

const cookieUtils = require("../utils/cookie/cookie");
const tokenUtils = require("../utils/token/token");
const appError = require("../utils/errors/errors");

const validateRole = (role, extraChecks = []) => {
  return async (req, res, next) => {
    try {
      // Extract Access Token
      const token = cookieUtils.getTokenFromCookies(req.cookies, role);
      if (!token) {
        throw new appError.UnauthorizedError(
          "Access Token Missing",
          "No access token found in cookies.",
          "Please log in to obtain an access token.",
        );
      }

      // Decode Token
      const decodedPayload = tokenUtils.verifyJWTToken(token);

      // Validate using DTO
      const decodedTokenDTO = new tokenDto.DecodeTokenDTO(decodedPayload);
      decodedTokenDTO.validate();

      // Role check
      if (decodedTokenDTO.userRole !== role) {
        throw new appError.ForbiddenError(
          "Access Denied",
          `User role '${decodedTokenDTO.userRole}' does not have access to this resource.`,
          "Ensure you have the correct permissions.",
        );
      }

      // Automatically validate session for write methods
      const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
      if (WRITE_METHODS.includes(req.method)) {
        const subjectDto = await validateSessionService(decodedTokenDTO);
        req.subject = subjectDto;

        if (!subjectDto) {
          throw new appError.UnauthorizedError(
            "Invalid User Session",
            "The user associated with this token does not exist.",
            "Please log in again to obtain a valid access token.",
          );
        }
      }

      // Run extra role-specific checks
      for (const check of extraChecks) {
        await check({ decodedTokenDTO, req, subject: req.subject });
      }

      // Attach decoded user to req
      req.user = decodedTokenDTO;
      // Extend logger with user context
      req.logger = req.logger.child({
        userId: decodedTokenDTO.userId,
        userRole: decodedTokenDTO.userRole,
      });

      next();
    } catch (error) {
      if (error instanceof appError.AppError) {
        return next(error);
      }
      return next(
        new appError.UnauthorizedError(
          "Unauthorized Access",
          "An error occurred while validating the access token.",
          "Please log in again to obtain a valid access token.",
        ),
      );
    }
  };
};

const validateAdmin = validateRole(USER_ROLES.ADMIN);

module.exports = {
  validateAdmin,
};
