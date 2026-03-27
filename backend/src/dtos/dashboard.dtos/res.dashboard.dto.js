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
            : { name: booking.productName || "Deleted Product" },
          brand: {
            name: booking.brand?.name || booking.brandName || "",
          },
          category: {
            name: booking.category?.name || booking.categoryName || "",
          },
          serviceDetails: {
            name: booking.serviceDetails?.name || booking.serviceName || "",
          },
        }))
      : [];
  }
}

module.exports = {
  DashboardStatsResponseDTO,
};
