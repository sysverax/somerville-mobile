const bookingRepo = require("../repositories/booking.repo");
const dashboardRepo = require("../repositories/dashboard.repo");

const getDashboardStatsService = async (logger) => {
    // Get summary counts from dashboard repo
    const summary = await dashboardRepo.getDocumentCountsRepo();
    
    // Get 5 upcoming bookings
    const upcomingBookings = await bookingRepo.getUpcomingBookingsRepo(5);

    logger.info("Dashboard stats gathered from repositories");

    return {
        summary,
        recentBookings: upcomingBookings,
    };
};

module.exports = {
    getDashboardStatsService,
};
