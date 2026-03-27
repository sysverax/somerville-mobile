class CreateBookingResponseDTO {
  constructor(booking) {
    this.id = booking._id?.toString() || null;
    this.productServiceId = booking.productServiceId?.toString() || null;
    this.scheduleDateTime = booking.scheduleDateTime || null;
    this.name = booking.name || null;
    this.email = booking.email || null;
    this.phone = booking.phone || null;
    this.status = booking.status || null;
    this.createdAt = booking.createdAt || null;
  }
}

class BookingListResponseDTO {
  constructor(booking) {
    this.id = booking._id?.toString() || null;
    this.scheduleDateTime = booking.scheduleDateTime || null;
    this.name = booking.name || null;
    this.email = booking.email || null;
    this.phone = booking.phone || null;
    this.status = booking.status || null;
    this.createdAt = booking.createdAt || null;

    this.product = booking.product
      ? {
          id: booking.product._id?.toString(),
          name: booking.product.name,
          brandName: booking.brand?.name || booking.brandName || "N/A",
          categoryName: booking.category?.name || booking.categoryName || "N/A",
        }
      : {
          id: null,
          name: booking.productName || "Deleted Product",
          brandName: booking.brandName || "N/A",
          categoryName: booking.categoryName || "N/A",
        };
    this.service = booking.serviceDetails
      ? {
          id: booking.serviceDetails._id?.toString(),
          name: booking.serviceDetails.name,
        }
      : { id: null, name: booking.serviceName || "Deleted Service" };
  }
}

class GetAllBookingsResponseDTO {
  constructor(bookings, total, page, limit) {
    this.bookings = Array.isArray(bookings) ? bookings.map((b) => new BookingListResponseDTO(b)) : [];
    this.total = total || 0;
    this.page = page || 1;
    this.limit = limit || 10;
    this.totalPages = Math.ceil(this.total / this.limit) || 0;
  }
}

module.exports = {
  CreateBookingResponseDTO,
  GetAllBookingsResponseDTO,
};
