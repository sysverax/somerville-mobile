const mongoose = require("mongoose");
const Product = require("../models/product");

const { USER_ROLES } = require("../utils/constants/user.constants");

const createProductRepo = async (payload) => {
  const product = await Product.create({
    name: payload.name,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    seriesId: new mongoose.Types.ObjectId(payload.seriesId),
  });

  return Product.findById(product._id)
    .populate({
      path: "seriesId",
      select: "name categoryId isActive",
      populate: {
        path: "categoryId",
        select: "name brandId isActive",
        populate: {
          path: "brandId",
          select: "name isActive",
        },
      },
    })
    .lean();
};

const getProductByNameRepo = async (name, seriesId) => {
  return Product.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
    seriesId: new mongoose.Types.ObjectId(seriesId),
  });
};

const getProductByIdRepo = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Product.findById(id)
    .populate({
      path: "seriesId",
      populate: {
        path: "categoryId",
        populate: {
          path: "brandId",
        },
      },
    })
    .lean();
};

const updateProductRepo = async (id, payload) => {
  return Product.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  })
    .populate({
      path: "seriesId",
      select: "name categoryId isActive",
      populate: {
        path: "categoryId",
        select: "name brandId isActive",
        populate: {
          path: "brandId",
          select: "name isActive",
        },
      },
    })
    .lean();
};

const updateProductStatusRepo = async (id, isActive) => {
  return Product.findByIdAndUpdate(
    id,
    { isActive },
    { returnDocument: "after", runValidators: true },
  )
    .populate({
      path: "seriesId",
      select: "name categoryId isActive",
      populate: {
        path: "categoryId",
        select: "name brandId isActive",
        populate: {
          path: "brandId",
          select: "name isActive",
        },
      },
    })
    .lean();
};

const getAllProductsRepo = async (
  page,
  limit,
  userRole,
  seriesId,
  categoryId,
  brandId,
) => {
  const skip = (page - 1) * limit;

  // ── 1. Build early match filter ──
  const matchFilter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    matchFilter.isActive = true;
  }
  if (seriesId) {
    matchFilter.seriesId = new mongoose.Types.ObjectId(seriesId);
  }

  // ── 2. Build post-lookup filters in one object ──
  const postLookupFilters = {};
  if (categoryId) {
    postLookupFilters["seriesId.categoryId._id"] = new mongoose.Types.ObjectId(
      categoryId,
    );
  }
  if (brandId) {
    postLookupFilters["seriesId.categoryId.brandId._id"] =
      new mongoose.Types.ObjectId(brandId);
  }
  if (userRole !== USER_ROLES.ADMIN) {
    postLookupFilters["seriesId.isActive"] = true;
    postLookupFilters["seriesId.categoryId.isActive"] = true;
    postLookupFilters["seriesId.categoryId.brandId.isActive"] = true;
  }

  const pipeline = [
    // ── 3. Filter products early (hits index) ──
    { $match: matchFilter },

    // ── 4. Join series — fetch only needed fields ──
    {
      $lookup: {
        from: "series",
        localField: "seriesId",
        foreignField: "_id",
        as: "seriesId",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              isActive: 1,
              categoryId: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$seriesId",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ── 5. Join category — fetch only needed fields ──
    {
      $lookup: {
        from: "categories",
        localField: "seriesId.categoryId",
        foreignField: "_id",
        as: "seriesId.categoryId",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              isActive: 1,
              brandId: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$seriesId.categoryId",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ── 6. Join brand — fetch only needed fields ──
    {
      $lookup: {
        from: "brands",
        localField: "seriesId.categoryId.brandId",
        foreignField: "_id",
        as: "seriesId.categoryId.brandId",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              isActive: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$seriesId.categoryId.brandId",
        preserveNullAndEmptyArrays: true,
      },
    },

    // ── 7. Apply all post-lookup filters in one $match ──
    ...(Object.keys(postLookupFilters).length > 0
      ? [{ $match: postLookupFilters }]
      : []),

    // ── 8. Facet — sort + paginate vs count in separate branches ──
    {
      $facet: {
        products: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await Product.aggregate(pipeline);
  const products = result[0]?.products ?? [];
  const totalProducts = result[0]?.total[0]?.count ?? 0;

  return { products, totalProducts };
};

const deleteProductRepo = async (id, session = null) => {
  return Product.findByIdAndDelete(id, { session });
};

const getProductsBySeriesIdsRepo = async (seriesIds) => {
  return Product.find({
    seriesId: { $in: seriesIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).lean();
};

const deleteProductsBySeriesIdsRepo = async (seriesIds, session = null) => {
  return Product.deleteMany(
    {
      seriesId: { $in: seriesIds.map((id) => new mongoose.Types.ObjectId(id)) },
    },
    { session },
  );
};

module.exports = {
  createProductRepo,
  getProductByNameRepo,
  getProductByIdRepo,
  updateProductRepo,
  updateProductStatusRepo,
  getAllProductsRepo,
  deleteProductRepo,
  getProductsBySeriesIdsRepo,
  deleteProductsBySeriesIdsRepo,
};
