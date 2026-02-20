const mongoose = require("mongoose");
const bookingConstants = require("../utils/constants/booking.constants");

const bookingSchema = new mongoose.Schema(
  {
    productServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductService",
      required: true,
    },
    scheduleDateTime: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(bookingConstants.BOOKING_STATUS),
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
