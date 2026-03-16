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
  sortOrder = "desc",
) => {
  const skip = (page - 1) * limit;

  const matchFilter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    matchFilter.isActive = true;
  }
  if (seriesId) {
    matchFilter.seriesId = new mongoose.Types.ObjectId(seriesId);
  }


  const pipeline = [
    { $match: matchFilter },
    {
      $lookup: {
        from: "series",
        localField: "seriesId",
        foreignField: "_id",
        as: "seriesId",
      },
    },
    {
      $unwind: {
        path: "$seriesId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "seriesId.categoryId",
        foreignField: "_id",
        as: "seriesId.categoryId",
      },
    },
    {
      $unwind: {
        path: "$seriesId.categoryId",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "seriesId.categoryId.brandId",
        foreignField: "_id",
        as: "seriesId.categoryId.brandId",
      },
    },
    {
      $unwind: {
        path: "$seriesId.categoryId.brandId",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...(categoryId
      ? [
          {
            $match: {
              "seriesId.categoryId._id": new mongoose.Types.ObjectId(
                categoryId,
              ),
            },
          },
        ]
      : []),
    ...(brandId
      ? [
          {
            $match: {
              "seriesId.categoryId.brandId._id": new mongoose.Types.ObjectId(
                brandId,
              ),
            },
          },
        ]
      : []),
    ...(userRole !== USER_ROLES.ADMIN
      ? [
          {
            $match: {
              "seriesId.isActive": true,
              "seriesId.categoryId.isActive": true,
              "seriesId.categoryId.brandId.isActive": true,
            },
          },
        ]
      : []),
    { $sort: { createdAt: sortOrder === "asc" ? 1 : -1 } },
    {
      $facet: {
        products: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await Product.aggregate(pipeline);
  const products = result[0].products;
  const totalProducts = result[0].total[0]?.count || 0;

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
    { seriesId: { $in: seriesIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { session }
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
