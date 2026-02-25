const mongoose = require("mongoose");
const Category = require("../models/category");
const { USER_ROLES } = require("../utils/constants/user.constants");

const createCategoryRepo = async (payload) => {
  return Category.create({
    name: payload.name,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive,
    brandId: new mongoose.Types.ObjectId(payload.brandId),
  });
};

const getCategoryByIdRepo = async (id) => {
  return Category.findById(id);
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
    new: true,
    runValidators: true,
  });
};

const updateCategoryStatusRepo = async (id, isActive) => {
  return Category.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true },
  );
};

const getAllCategoriesRepo = async (page, limit, userRole, brandId) => {
  const skip = (page - 1) * limit;
  let filter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    filter.isActive = true;
  }
  if (brandId) {
    filter.brandId = new mongoose.Types.ObjectId(brandId);
  }

  const [categories, totalCategories] = await Promise.all([
    Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);
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