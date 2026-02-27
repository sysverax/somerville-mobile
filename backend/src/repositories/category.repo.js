const mongoose = require("mongoose");
const Category = require("../models/category");
const { USER_ROLES } = require("../utils/constants/user.constants");

const createCategoryRepo = async (payload) => {
  const category = await Category.create({
    name: payload.name,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    brandId: new mongoose.Types.ObjectId(payload.brandId),
  });

  return Category.findById(category._id)
    .populate("brandId", "name")
    .lean();
};

const getCategoryByIdRepo = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Category.findById(id).populate("brandId").lean();
};

const getCategoryByNameRepo = async (name, brandId) => {
  return Category.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
    brandId: new mongoose.Types.ObjectId(brandId),
  });
};

const updateCategoryRepo = async (id, payload) => {
  return Category.findByIdAndUpdate(id, payload, {
    returnDocument: "after",
    runValidators: true,
  })
    .populate("brandId", "name")
    .lean();
};

const updateCategoryStatusRepo = async (id, isActive) => {
  return Category.findByIdAndUpdate(
    id,
    { isActive },
    { returnDocument: "after", runValidators: true },
  )
    .populate("brandId", "name")
    .lean();
};

const getAllCategoriesRepo = async (page, limit, userRole, brandId) => {
  const skip = (page - 1) * limit;

  const matchFilter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    matchFilter.isActive = true;
  }
  if (brandId) {
    matchFilter.brandId = new mongoose.Types.ObjectId(brandId);
  }

  const pipeline = [
    { $match: matchFilter },
    {
      $lookup: {
        from: "brands",
        localField: "brandId",
        foreignField: "_id",
        as: "brandId",
      },
    },
    { $unwind: "$brandId" },
    ...(userRole !== USER_ROLES.ADMIN
      ? [
          {
            $match: {
              "brandId.isActive": true,
            },
          },
        ]
      : []),
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        categories: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await Category.aggregate(pipeline);
  const categories = result[0].categories;
  const totalCategories = result[0].total[0]?.count || 0;

  return { categories, totalCategories };
};

const deleteCategoryRepo = async (id) => {
  return Category.findByIdAndDelete(id);
};

module.exports = {
  createCategoryRepo,
  getCategoryByIdRepo,
  getCategoryByNameRepo,
  updateCategoryRepo,
  updateCategoryStatusRepo,
  getAllCategoriesRepo,
  deleteCategoryRepo,
};