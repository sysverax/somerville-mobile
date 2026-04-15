class CreateBookingResponseDTO {
  constructor(booking) {
    this.id = booking._id?.toString() || null;
    this.bookingCode = booking.bookingCode || null;
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
    this.bookingCode = booking.bookingCode || null;
    this.scheduleDateTime = booking.scheduleDateTime || null;
    this.name = booking.name || null;
    this.email = booking.email || null;
    this.phone = booking.phone || null;
    this.status = booking.status || null;
    this.createdAt = booking.createdAt || null;

    this.product = {
      id: booking.product?._id?.toString() || null,
      name: booking.product?.name || "Deleted Product",
      seriesName: booking.series?.name || "Deleted Series",
      categoryName: booking.category?.name || "Deleted Category",
      brandName: booking.brand?.name || "Deleted Brand",
    };
    this.service = booking.serviceDetails
      ? {
          id: booking.serviceDetails._id?.toString(),
          name: booking.serviceDetails.name,
        }
      : { id: null, name: "Deleted Service" };
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
