const filterService = require("../services/filter.service");
const appError = require("../utils/errors/errors");

const getFilterOptionsController = async (req, res, next) => {
  try {
    req.logger.info("Get filter options request received", {
      userRole: req.userRole,
    });

    const data = await filterService.getFilterOptionsService(
      req.userRole,
      req.logger,
    );

    return res.status(200).json({
      message: "Filter options fetched successfully",
      data,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get filter options request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch filter options failed",
        "An unexpected error occurred while fetching filter metadata.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  getFilterOptionsController,
};
