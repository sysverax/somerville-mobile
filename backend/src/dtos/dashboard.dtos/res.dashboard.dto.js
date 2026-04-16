class DashboardStatsResponseDTO {
  constructor(data) {
    this.summary = {
      totalBookings: data.summary.totalBookings || 0,
      totalProducts: data.summary.totalProducts || 0,
      totalServices: data.summary.totalServices || 0,
      totalCategories: data.summary.totalCategories || 0,
      totalBrands: data.summary.totalBrands || 0,
      totalSeries: data.summary.totalSeries || 0,
    };

    this.recentBookings = Array.isArray(data.recentBookings)
      ? data.recentBookings.map((booking) => ({
          _id: booking._id?.toString(),
          bookingCode: booking.bookingCode || null,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          scheduleDateTime: booking.scheduleDateTime,
          createdAt: booking.createdAt,
          status: booking.status,
          product: booking.product
            ? {
                _id: booking.product._id?.toString(),
                name: booking.product.name,
              }
            : { _id: null, name: "Deleted Product" },
          series: {
            name: booking.series?.name || "Deleted Series",
          },
          category: {
            name: booking.category?.name || "Deleted Category",
          },
          brand: {
            name: booking.brand?.name || "Deleted Brand",
          },
          serviceDetails: {
            name: booking.serviceDetails?.name || "Deleted Service",
          },
        }))
      : [];
  }
}

module.exports = {
  DashboardStatsResponseDTO,
};
