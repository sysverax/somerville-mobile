const { AppError } = require("../utils/errors/errors");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    req.logger.error(err.message, {
      stack: err.stack,
      code: err.statusCode,
      detail: err.detail,
      solution: err.solution,
    });
    return res.status(err.statusCode).json({
      message: err.message,
      data: null,
      error: {
        code: err.statusCode,
        detail: err.detail,
        solution: err.solution,
      },
    });
  }
  req.logger.error("Unexpected error occurred", {
    stack: err.stack,
    code: 500,
  });
  return res.status(500).json({
    message: "An unexpected error occurred. Please try again later.",
    data: null,
    error: {
      code: 500,
      detail: "Internal Server Error",
      solution: "Contact support",
    },
  });
};

module.exports = errorHandler;
