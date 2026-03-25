const bookingRepo = require("../repositories/booking.repo");
const bookingConstants = require("../utils/constants/booking.constants");
const bookingResDto = require("../dtos/booking.dtos/res.booking.dto");
const appError = require("../utils/errors/errors");
const productServiceRepo = require("../repositories/productService.repo");

const createBookingService = async (createBookingRequestDto, logger) => {
  const productService = await productServiceRepo.getProductServiceByIdRepo(
    createBookingRequestDto.productServiceId,
  );
  if (!productService) {
    throw new appError.NotFoundError(
      "Product service not found",
      "The product service linked to this booking does not exist.",
      "Provide a valid product service ID and try again.",
    );
  }
  if (!productService.isActive) {
    throw new appError.BadRequestError(
      "Product service is inactive",
      "Cannot create a booking for an inactive product service.",
      "Choose an active product service and try again.",
    );
  }

  const bookingData = {
    productServiceId: createBookingRequestDto.productServiceId,
    scheduleDateTime: createBookingRequestDto.scheduleDateTime,
    name: createBookingRequestDto.name,
    email: createBookingRequestDto.email,
    phone: createBookingRequestDto.phone,
    status: bookingConstants.BOOKING_STATUS.PENDING,
  };

  const booking = await bookingRepo.createBookingRepo(bookingData);

  logger.info("Booking created successfully", {
    bookingId: booking._id.toString(),
  });

  return new bookingResDto.CreateBookingResponseDTO(booking);
};

const getAllBookingsService = async (getAllBookingsRequestDto, logger) => {
  const { bookings, total } = await bookingRepo.getAllBookingsRepo(
    {
      brandId: getAllBookingsRequestDto.brandId,
      categoryId: getAllBookingsRequestDto.categoryId,
      seriesId: getAllBookingsRequestDto.seriesId,
      productId: getAllBookingsRequestDto.productId,
      date: getAllBookingsRequestDto.date,
      month: getAllBookingsRequestDto.month,
      year: getAllBookingsRequestDto.year,
    },
    getAllBookingsRequestDto.page,
    getAllBookingsRequestDto.limit,
  );

  logger.info("Bookings fetched successfully", { total });

  return new bookingResDto.GetAllBookingsResponseDTO(
    bookings,
    total,
    getAllBookingsRequestDto.page,
    getAllBookingsRequestDto.limit,
  );
};

module.exports = {
  createBookingService,
  getAllBookingsService,
};
