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
      select: "name brandId isActive",
      populate: {
        path: "brandId",
        select: "name isActive",
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
      select: "name brandId isActive",
      populate: {
        path: "brandId",
        select: "name isActive",
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
      select: "name brandId isActive",
      populate: {
        path: "brandId",
        select: "name isActive",
      },
    })
    .lean();
};

const getAllSeriesRepo = async (
  page,
  limit,
  userRole,
  categoryId,
  brandId,
  sortOrder = "desc",
) => {
  const skip = (page - 1) * limit;

  // ── 1. Build early match filter ──
  const matchFilter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    matchFilter.isActive = true;
  }
  if (categoryId) {
    matchFilter.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  // ── 2. Build brand filter (applied after both lookups) ──
  const postLookupFilters = {};
  if (brandId) {
    postLookupFilters["categoryId.brandId._id"] = new mongoose.Types.ObjectId(
      brandId,
    );
  }
  if (userRole !== USER_ROLES.ADMIN) {
    postLookupFilters["categoryId.isActive"] = true;
    postLookupFilters["categoryId.brandId.isActive"] = true;
  }

  const pipeline = [
    // ── 3. Filter series early (hits index) ──
    { $match: matchFilter },

    // ── 4. Join category — fetch only needed fields ──
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryId",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              isActive: 1,
              brandId: 1, // 👈 only what we need
            },
          },
        ],
      },
    },
    { $unwind: "$categoryId" },

    // ── 5. Join brand from category — fetch only needed fields ──
    {
      $lookup: {
        from: "brands",
        localField: "categoryId.brandId",
        foreignField: "_id",
        as: "categoryId.brandId",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              isActive: 1, // 👈 only what we need
            },
          },
        ],
      },
    },
    { $unwind: "$categoryId.brandId" },

    // ── 6. Apply all post-lookup filters in one $match ──
    ...(Object.keys(postLookupFilters).length > 0
      ? [{ $match: postLookupFilters }]
      : []),
    {
      $facet: {
        series: [
          { $sort: { createdAt: sortOrder === "asc" ? 1 : -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await Series.aggregate(pipeline);
  const series = result[0]?.series ?? [];
  const totalSeries = result[0]?.total[0]?.count ?? 0;

  return { series, totalSeries };
};

const deleteSeriesRepo = async (id, session = null) => {
  return Series.findByIdAndDelete(id, { session });
};

const getSeriesByCategoryIdRepo = async (categoryId) => {
  return Series.find({
    categoryId: new mongoose.Types.ObjectId(categoryId),
  }).lean();
};

const deleteSeriesByCategoryIdRepo = async (categoryId, session = null) => {
  return Series.deleteMany(
    { categoryId: new mongoose.Types.ObjectId(categoryId) },
    { session },
  );
};

const getSeriesByCategoryIdsRepo = async (categoryIds) => {
  return Series.find({
    categoryId: {
      $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
  }).lean();
};

const deleteSeriesByCategoryIdsRepo = async (categoryIds, session = null) => {
  return Series.deleteMany(
    {
      categoryId: {
        $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    },
    { session },
  );
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
  getSeriesByCategoryIdsRepo,
  deleteSeriesByCategoryIdsRepo,
};
