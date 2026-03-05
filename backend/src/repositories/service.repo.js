const mongoose = require("mongoose");
const Service = require("../models/service");
const Product = require("../models/product");
const Series = require("../models/series");
const Category = require("../models/category");
const ProductService = require("../models/productService");

const createServiceRepo = async (payload, session) => {
  const [service] = await Service.create(
    [
      {
        name: payload.name,
        description: payload.description,
        basePrice: payload.basePrice,
        estimatedTime: payload.estimatedTime,
        isActive: payload.isActive,
        level: payload.level,
        levelId: new mongoose.Types.ObjectId(payload.levelId),
        isParent: payload.isParent,
        isVariant: payload.isVariant,
        parentServiceId: payload.parentServiceId
          ? new mongoose.Types.ObjectId(payload.parentServiceId)
          : null,
      },
    ],
    { session },
  );

  return Service.findById(service._id).session(session).lean();
};

const createManyServicesRepo = async (servicesArray, session) => {
  return Service.insertMany(servicesArray, { session });
};

const getServiceByNameRepo = async (name, level, levelId) => {
  return Service.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
    level,
    levelId: new mongoose.Types.ObjectId(levelId),
    isVariant: false,
  });
}

const getProductIdsByLevelRepo = async (level, levelId) => {
  const objectId = new mongoose.Types.ObjectId(levelId);

  switch (level) {
    case "product":
      const product = await Product.findById(objectId)
        .select("_id")
        .lean();
      return product ? [product._id] : [];

    case "series":
      const productsBySeries = await Product.find({ seriesId: objectId })
        .select("_id")
        .lean();
      return productsBySeries.map((p) => p._id);

    case "category":
      const seriesInCategory = await Series.find({ categoryId: objectId })
        .select("_id")
        .lean();
      const seriesIds = seriesInCategory.map((s) => s._id);
      if (seriesIds.length === 0) return [];

      const productsByCategory = await Product.find({
        seriesId: { $in: seriesIds },
      })
        .select("_id")
        .lean();
      return productsByCategory.map((p) => p._id);

    case "brand":
      const categoriesInBrand = await Category.find({ brandId: objectId })
        .select("_id")
        .lean();
      const categoryIds = categoriesInBrand.map((c) => c._id);
      if (categoryIds.length === 0) return [];

      const seriesInBrand = await Series.find({
        categoryId: { $in: categoryIds },
      })
        .select("_id")
        .lean();
      const brandSeriesIds = seriesInBrand.map((s) => s._id);
      if (brandSeriesIds.length === 0) return [];

      const productsByBrand = await Product.find({
        seriesId: { $in: brandSeriesIds },
      })
        .select("_id")
        .lean();
      return productsByBrand.map((p) => p._id);

    default:
      return [];
  }
};

const validateLevelIdExistsRepo = async (level, levelId) => {
  const objectId = new mongoose.Types.ObjectId(levelId);
  const Brand = require("../models/brand");

  const modelMap = {
    brand: Brand,
    category: Category,
    series: Series,
    product: Product,
  };

  const Model = modelMap[level];
  if (!Model) return null;

  return Model.findById(objectId).select("_id").lean();
};

const createManyProductServicesRepo = async (
  productServicesArray,
  session,
) => {
  return ProductService.insertMany(productServicesArray, { session });
};

module.exports = {
  createServiceRepo,
  createManyServicesRepo,
  getServiceByNameRepo,
  getProductIdsByLevelRepo,
  validateLevelIdExistsRepo,
  createManyProductServicesRepo,
};
