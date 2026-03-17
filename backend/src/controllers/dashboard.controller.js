const dashboardService = require("../services/dashboard.service");
const { DashboardStatsResponseDTO } = require("../dtos/dashboard.dtos/res.dashboard.dto");
const appError = require("../utils/errors/errors");

const getDashboardStats = async (req, res, next) => {
  try {
    req.logger.info("Dashboard stats request received");
    
    const statsData = await dashboardService.getDashboardStatsService(req.logger);
    
    const responseDto = new DashboardStatsResponseDTO(statsData);

    return res.status(200).json({
      success: true,
      data: responseDto,
    });
  } catch (error) {
    req.logger.error("Error fetching dashboard stats:", error);
    
    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch dashboard stats failed",
        "An unexpected error occurred while fetching dashboard statistics.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  getDashboardStats,
};
