const Brand = require("../models/brand");
const { USER_ROLES } = require("../utils/constants/user.constants");

const createBrandRepo = async (payload) => {
  return Brand.create({
    name: payload.name,
    description: payload.description,
    iconImageUrl: payload.iconImageUrl,
    bannerImageUrl: payload.bannerImageUrl,
    isActive: payload.isActive,
  });
};

const getAllBrandsRepo = async (page, limit, userRole) => {
  const skip = (page - 1) * limit;
  let filter = {};
  if (userRole !== USER_ROLES.ADMIN) {
    filter.isActive = true;
  }

  const [brands, totalBrands] = await Promise.all([
    Brand.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Brand.countDocuments(filter),
  ]);
  return { brands, totalBrands };
};

const getBrandByIdRepo = async (id) => {
  return Brand.findById(id);
};

const getBrandByNameRepo = async (name) => {
  return Brand.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
  });
};

const updateBrandRepo = async (id, payload) => {
  return Brand.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const updateBrandStatusRepo = async (id, isActive) => {
  return Brand.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true },
  );
};

const deleteBrandRepo = async (id) => {
  return Brand.findByIdAndDelete(id);
};

module.exports = {
  createBrandRepo,
  getAllBrandsRepo,
  getBrandByIdRepo,
  getBrandByNameRepo,
  updateBrandRepo,
  updateBrandStatusRepo,
  deleteBrandRepo,
};
