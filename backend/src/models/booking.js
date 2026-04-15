const mongoose = require("mongoose");
const bookingConstants = require("../utils/constants/booking.constants");

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    collection: "counters",
  },
);

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const bookingSchema = new mongoose.Schema(
  {
    productServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductService",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
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
    bookingCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "bookings",
  },
);

bookingSchema.pre("validate", async function assignBookingCode() {
  if (!this.isNew || this.bookingCode) {
    return;
  }

  const counter = await Counter.findByIdAndUpdate(
    "booking",
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  this.bookingCode = `B-${String(counter.seq).padStart(5, "0")}`;
});

module.exports = mongoose.model("Booking", bookingSchema);
