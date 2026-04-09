const bookingRepo = require("../repositories/booking.repo");
const bookingConstants = require("../utils/constants/booking.constants");
const bookingResDto = require("../dtos/booking.dtos/res.booking.dto");
const appError = require("../utils/errors/errors");
const productServiceRepo = require("../repositories/productService.repo");
const productRepo = require("../repositories/product.repo");
const { sendBookingNotificationEmail } = require("./email.service");

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

  const product = await productRepo.getProductByIdRepo(
    productService.productId._id || productService.productId,
  );

  const bookingData = {
    productServiceId: createBookingRequestDto.productServiceId,
    brandId: product.seriesId.categoryId.brandId._id || product.seriesId.categoryId.brandId,
    categoryId: product.seriesId.categoryId._id || product.seriesId.categoryId,
    seriesId: product.seriesId._id || product.seriesId,
    productId: product._id,
    serviceId: productService.serviceId._id || productService.serviceId,
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

  const emailPayload = {
    bookingId: booking._id.toString(),
    createdAt: booking.createdAt,
    scheduleDateTime: booking.scheduleDateTime,
    status: booking.status,
    customerName: booking.name,
    customerEmail: booking.email,
    customerPhone: booking.phone,
    brandName: product?.seriesId?.categoryId?.brandId?.name,
    categoryName: product?.seriesId?.categoryId?.name,
    seriesName: product?.seriesId?.name,
    productName: product?.name,
    serviceName: productService?.serviceId?.name,
    estimatedTime: productService?.estimatedTime,
    price: productService?.price,
  };

  try {
    sendBookingNotificationEmail(emailPayload, logger);
  } catch (error) {
    logger.warn("Booking created but notification email failed", {
      bookingId: booking._id.toString(),
      error: error.message,
    });
  }

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
