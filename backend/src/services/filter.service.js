const Brand = require("../models/brand");
const Category = require("../models/category");
const Series = require("../models/series");

const getFilterOptionsService = async (userRole, logger) => {
  logger.info("Service: Getting all filter options for admin");

  const [brands, categories, series] = await Promise.all([
    Brand.find({}).sort({ name: 1 }).lean(),
    Category.find({}).sort({ name: 1 }).lean(),
    Series.find({}).sort({ name: 1 }).lean(),
  ]);

  return {
    brands: brands.map((b) => ({
      id: b._id.toString(),
      name: b.name,
      isActive: b.isActive,
    })),
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      brandId: c.brandId.toString(),
      isActive: c.isActive,
    })),
    series: series.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      categoryId: s.categoryId.toString(),
      isActive: s.isActive,
    })),
  };
};

module.exports = {
  getFilterOptionsService,
};
