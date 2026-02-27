const mongoose = require("mongoose");
const Series = require("../models/series");

const { USER_ROLES } = require("../utils/constants/user.constants");

const createSeriesRepo = async (payload) => {
  const series = await Series.create({
    name: payload.name,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    categoryId: new mongoose.Types.ObjectId(payload.categoryId),
  });

  return Series.findById(series._id)
    .populate({
      path: "categoryId",
      select: "name brandId",
      populate: {
        path: "brandId",
        select: "name",
      },
    })
    .lean();
};

const getSeriesByNameRepo = async (name, categoryId) => {
  return Series.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
    categoryId: new mongoose.Types.ObjectId(categoryId),
  });
};

const getSeriesByIdRepo = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Series.findById(id)
    .populate({
      path: "categoryId",
      populate: {
        path: "brandId",
      },
    })
    .lean();
};

const updateSeriesRepo = async (id, payload) => {
  return Series.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  })
    .populate({
      path: "categoryId",
      select: "name brandId",
      populate: {
        path: "brandId",
        select: "name",
      },
    })
    .lean();
};

const updateSeriesStatusRepo = async (id, isActive) => {
  return Series.findByIdAndUpdate(
    id,
    { isActive },
    { returnDocument: "after", runValidators: true },
  )
    .populate({
      path: "categoryId",
      select: "name brandId",
      populate: {
        path: "brandId",
        select: "name",
      },
    })
    .lean();
};

const getAllSeriesRepo = async (page, limit, userRole, categoryId, brandId) => {
  const skip = (page - 1) * limit;

  const matchFilter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    matchFilter.isActive = true;
  }
  if (categoryId) {
    matchFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  const pipeline = [
    { $match: matchFilter },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryId",
      },
    },
    { $unwind: "$categoryId" },
    {
      $lookup: {
        from: "brands",
        localField: "categoryId.brandId",
        foreignField: "_id",
        as: "categoryId.brandId",
      },
    },
    { $unwind: "$categoryId.brandId" },
    ...(brandId
      ? [
          {
            $match: {
              "categoryId.brandId._id": new mongoose.Types.ObjectId(brandId),
            },
          },
        ]
      : []),
    ...(userRole !== USER_ROLES.ADMIN
      ? [
          {
            $match: {
              "categoryId.isActive": true,
              "categoryId.brandId.isActive": true,
            },
          },
        ]
      : []),
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        series: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await Series.aggregate(pipeline);
  const series = result[0].series;
  const totalSeries = result[0].total[0]?.count || 0;

  return { series, totalSeries };
};

const deleteSeriesRepo = async (id) => {
  return Series.findByIdAndDelete(id);
};

const getSeriesByCategoryIdRepo = async (categoryId) => {
  return Series.find({
    categoryId: new mongoose.Types.ObjectId(categoryId),
  }).lean();
};

const deleteSeriesByCategoryIdRepo = async (categoryId) => {
  return Series.deleteMany({
    categoryId: new mongoose.Types.ObjectId(categoryId),
  });
};

module.exports = {
  createSeriesRepo,
  getSeriesByIdRepo,
  getSeriesByNameRepo,
  updateSeriesRepo,
  updateSeriesStatusRepo,
  getAllSeriesRepo,
  deleteSeriesRepo,
  getSeriesByCategoryIdRepo,
  deleteSeriesByCategoryIdRepo,
};
