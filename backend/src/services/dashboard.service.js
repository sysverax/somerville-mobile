const bookingRepo = require("../repositories/booking.repo");
const dashboardRepo = require("../repositories/dashboard.repo");

const getDashboardStatsService = async (logger) => {
    // Get summary counts from dashboard repo
    const summary = await dashboardRepo.getDocumentCountsRepo();
    
    // Get 5 recent bookings using existing booking repository
    const { bookings: recentBookings } = await bookingRepo.getAllBookingsRepo({}, 1, 5);

    logger.info("Dashboard stats gathered from repositories");

    return {
        summary,
        recentBookings,
    };
};

module.exports = {
    getDashboardStatsService,
};
