const mongoose = require("mongoose");
const appError = require("../../utils/errors/errors");

class CreateBookingRequestDTO {
  constructor(body) {
    this.productServiceId = body?.productServiceId;
    this.scheduleDateTime = body?.scheduleDateTime;
    this.name =
      typeof body?.name === "string" ? body.name.trim() : (body?.name ?? "");
    this.email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : (body?.email ?? "");
    this.phone =
      typeof body?.phone === "string" ? body.phone.trim() : (body?.phone ?? "");
  }

  validate() {
    if (!this.productServiceId) {
      throw new appError.BadRequestError(
        "Product service ID is required",
        "The 'productServiceId' field is required to create a booking.",
        "Provide a valid product service ID and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.productServiceId)) {
      throw new appError.BadRequestError(
        "Invalid product service ID format",
        "Provided product service ID is not a valid MongoDB ObjectId.",
        "Provide a valid product service ID and try again.",
      );
    }
    if (!this.scheduleDateTime) {
      throw new appError.BadRequestError(
        "Schedule date and time is required",
        "The 'scheduleDateTime' field is required for your appointment.",
        "Provide a valid ISO date string and try again.",
      );
    }
    if (isNaN(new Date(this.scheduleDateTime).getTime())) {
      throw new appError.BadRequestError(
        "Invalid schedule date/time",
        "The provided 'scheduleDateTime' is not a valid date format.",
        "Ensure you provide a valid date and time string.",
      );
    }
    if (new Date(this.scheduleDateTime) <= new Date()) {
      throw new appError.BadRequestError(
        "Schedule date/time must be in the future",
        "The 'scheduleDateTime' must be a future date and time.",
        "Please schedule your appointment for a future date and time.",
      );
    }
    if (!this.name || this.name.trim() === "") {
      throw new appError.BadRequestError(
        "Name is required",
        "The 'name' field is required to create a booking.",
        "Provide your full name and try again.",
      );
    }
    if (!this.email || typeof this.email !== "string" || this.email.trim() === "") {
      throw new appError.BadRequestError(
        "Email is required",
        "A valid email address is required for booking confirmation.",
        "Provide your email address and try again.",
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new appError.BadRequestError(
        "Invalid email format",
        "The provided email address does not follow a valid format.",
        "Check for typos and ensure it follows 'user@example.com'.",
      );
    }
    if (!this.phone || this.phone.trim() === "") {
      throw new appError.BadRequestError(
        "Phone number is required",
        "The 'phone' field is required for the booking.",
        "Provide a valid phone number and try again.",
      );
    }
    const phoneRegex = /^\+?[0-9]\d{6,14}$/;
    if (!phoneRegex.test(this.phone.replace(/[\s\-().]/g, ""))) {
      throw new appError.BadRequestError(
        "Invalid phone number format",
        "The provided phone number does not follow a valid format.",
        "Provide a valid phone number (e.g. +1 555-0101 or 9876543210).",
      );
    }
  }
}

class GetAllBookingsRequestDTO {
  constructor(query) {
    this.brandId = query?.brandId;
    this.categoryId = query?.categoryId;
    this.seriesId = query?.seriesId;
    this.productId = query?.productId;
    this.date = query?.date;
    this.month = query?.month ? parseInt(query.month, 10) : undefined;
    this.year = query?.year ? parseInt(query.year, 10) : undefined;
    this.page = query?.page ? parseInt(query.page, 10) : 1;
    this.limit = query?.limit ? parseInt(query.limit, 10) : (query?.month ? 0 : 10);
  }

  validate() {
    if (isNaN(this.page) || this.page < 1) {
      throw new appError.BadRequestError(
        "Invalid page number",
        "The 'page' query parameter must be a positive integer.",
        "Provide a valid page number and try again.",
      );
    }

    if (this.limit !== 0 && (isNaN(this.limit) || this.limit < 1 || this.limit > 500)) {
      throw new appError.BadRequestError(
        "Invalid limit value",
        "The 'limit' query parameter must be a positive integer between 1 and 100.",
        "Provide a valid limit value and try again.",
      );
    }

    if (this.brandId && !mongoose.Types.ObjectId.isValid(this.brandId)) {
      throw new appError.BadRequestError(
        "Invalid brand ID format",
        "Provided brand ID is not a valid MongoDB ObjectId.",
        "Provide a valid brand ID and try again.",
      );
    }

    if (this.categoryId && !mongoose.Types.ObjectId.isValid(this.categoryId)) {
      throw new appError.BadRequestError(
        "Invalid category ID format",
        "Provided category ID is not a valid MongoDB ObjectId.",
        "Provide a valid category ID and try again.",
      );
    }

    if (this.seriesId && !mongoose.Types.ObjectId.isValid(this.seriesId)) {
      throw new appError.BadRequestError(
        "Invalid series ID format",
        "Provided series ID is not a valid MongoDB ObjectId.",
        "Provide a valid series ID and try again.",
      );
    }

    if (this.productId && !mongoose.Types.ObjectId.isValid(this.productId)) {
      throw new appError.BadRequestError(
        "Invalid product ID format",
        "Provided product ID is not a valid MongoDB ObjectId.",
        "Provide a valid product ID and try again.",
      );
    }

    if (this.date && isNaN(new Date(this.date).getTime())) {
      throw new appError.BadRequestError(
        "Invalid date format",
        "The provided 'date' filter is not a valid date.",
        "Ensure you provide a valid date string (YYYY-MM-DD).",
      );
    }

    if (this.month && (isNaN(this.month) || this.month < 1 || this.month > 12)) {
      throw new appError.BadRequestError(
        "Invalid month",
        "The 'month' query parameter must be an integer between 1 and 12.",
        "Provide a valid month and try again.",
      );
    }

    if (this.year && (isNaN(this.year) || this.year < 1900)) {
      throw new appError.BadRequestError(
        "Invalid year",
        "The 'year' query parameter must be a valid four-digit year.",
        "Provide a valid year and try again.",
      );
    }
  }
}

module.exports = {
  CreateBookingRequestDTO,
  GetAllBookingsRequestDTO,
};
