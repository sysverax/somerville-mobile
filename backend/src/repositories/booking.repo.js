const mongoose = require("mongoose");
const Booking = require("../models/booking");

const createBookingRepo = async (bookingData) => {
  return Booking.create(bookingData);
};

const getAllBookingsRepo = async (filters, page, limit) => {
  const skip = (page - 1) * limit;

  const matchStage = {};

  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setHours(23, 59, 59, 999);
    matchStage.scheduleDateTime = { $gte: startOfDay, $lte: endOfDay };
  } else if (filters.month && filters.year) {
    const startOfMonth = new Date(filters.year, filters.month - 1, 1);
    const endOfMonth = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);
    matchStage.scheduleDateTime = { $gte: startOfMonth, $lte: endOfMonth };
  } else if (filters.year) {
    const startOfYear = new Date(filters.year, 0, 1);
    const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59, 999);
    matchStage.scheduleDateTime = { $gte: startOfYear, $lte: endOfYear };
  }

  const pipeline = [
    {
      $lookup: {
        from: "product_services",
        localField: "productServiceId",
        foreignField: "_id",
        as: "productService",
      },
    },
    { $unwind: { path: "$productService", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "products",
        localField: "productService.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "series",
        localField: "product.seriesId",
        foreignField: "_id",
        as: "series",
      },
    },
    { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "series.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "brands",
        localField: "category.brandId",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    {
        $lookup: {
          from: "services",
          localField: "productService.serviceId",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: { path: "$serviceDetails", preserveNullAndEmptyArrays: true } },
  ];

  const filterMatch = { ...matchStage };
  if (filters.brandId) filterMatch["brand._id"] = new mongoose.Types.ObjectId(filters.brandId);
  if (filters.categoryId) filterMatch["category._id"] = new mongoose.Types.ObjectId(filters.categoryId);
  if (filters.seriesId) filterMatch["series._id"] = new mongoose.Types.ObjectId(filters.seriesId);
  if (filters.productId) filterMatch["product._id"] = new mongoose.Types.ObjectId(filters.productId);

  pipeline.push({ $match: filterMatch });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
    data: [
      { $sort: { createdAt: -1 } },
      ...(limit > 0 ? [{ $skip: skip }, { $limit: limit }] : []),
    ],
    },
  });

  const result = await Booking.aggregate(pipeline);
  const bookings = result[0].data;
  const total = result[0].metadata[0]?.total || 0;

  return { bookings, total };
};

const getUpcomingBookingsRepo = async (limit) => {
  const currentDate = new Date();

  const pipeline = [
    { $match: { scheduleDateTime: { $gte: currentDate } } },
    {
      $lookup: {
        from: "product_services",
        localField: "productServiceId",
        foreignField: "_id",
        as: "productService",
      },
    },
    { $unwind: { path: "$productService", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "products",
        localField: "productService.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "series",
        localField: "product.seriesId",
        foreignField: "_id",
        as: "series",
      },
    },
    { $unwind: { path: "$series", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "categories",
        localField: "series.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "brands",
        localField: "category.brandId",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "services",
        localField: "productService.serviceId",
        foreignField: "_id",
        as: "serviceDetails",
      },
    },
    { $unwind: { path: "$serviceDetails", preserveNullAndEmptyArrays: true } },
    { $sort: { scheduleDateTime: 1 } },
    { $limit: limit },
  ];

  return Booking.aggregate(pipeline);
};

module.exports = {
  createBookingRepo,
  getAllBookingsRepo,
  getUpcomingBookingsRepo,
};
