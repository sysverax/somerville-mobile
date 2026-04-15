const appError = require("../utils/errors/errors");
const {
  CreateBookingRequestDTO,
  GetAllBookingsRequestDTO,
} = require("../dtos/booking.dtos/req.booking.dto");
const bookingService = require("../services/booking.service");

const createBookingController = async (req, res, next) => {
  try {
    req.logger.info("Create booking request received");

    const createBookingRequestDto = new CreateBookingRequestDTO(req.body);
    createBookingRequestDto.validate();
    req.logger.info("Create booking request data is validated");

    const booking = await bookingService.createBookingService(
      createBookingRequestDto,
      req.logger,
    );

    return res.status(201).json({
      message: "Booking created successfully",
      data: booking,
      error: null,
    });
  } catch (error) {
    console.log("Error in createBookingController:", error);
    req.logger.error("Create booking request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Booking creation failed",
        "An unexpected error occurred while creating the booking.",
        "Please try again later.",
      ),
    );
  }
};

const getAllBookingsController = async (req, res, next) => {
  try {
    req.logger.info("Get all bookings request received", {
      query: req.query,
    });

    const getAllBookingsRequestDto = new GetAllBookingsRequestDTO(req.query);
    getAllBookingsRequestDto.validate();

    const bookings = await bookingService.getAllBookingsService(
      getAllBookingsRequestDto,
      req.logger,
    );

    return res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get all bookings request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch bookings failed",
        "An unexpected error occurred while fetching bookings.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createBookingController,
  getAllBookingsController,
};
