const mongoose = require("mongoose");
const Category = require("../models/category");

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

module.exports = {
  createCategoryRepo,
  getCategoryByIdRepo,
  getCategoryByNameRepo,
  updateCategoryRepo,
  updateCategoryStatusRepo,
};