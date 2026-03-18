const Brand = require("../models/brand");
const Category = require("../models/category");
const Series = require("../models/series");
const Product = require("../models/product");

const getFilterOptionsService = async (userRole, logger) => {
  const isAdmin = userRole === "admin";
  logger.info(
    `Service: Getting all filter options for ${isAdmin ? "admin" : "public"}`,
  );

  const query = isAdmin ? {} : { isActive: true };

  const [brands, categories, series, products] = await Promise.all([
    Brand.find(query).sort({ name: 1 }).lean(),
    Category.find(query).sort({ name: 1 }).lean(),
    Series.find(query).sort({ name: 1 }).lean(),
    Product.find(query).sort({ name: 1 }).lean(),
  ]);

  return {
    brands: brands.map((b) => ({
      id: b._id.toString(),
      name: b.name,
      isActive: b.isActive,
      logo: b.iconImageUrl,
    })),
    categories: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      brandId: c.brandId ? c.brandId.toString() : "",
      image: c.imageUrl,
      isActive: c.isActive,
    })),
    series: series.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      categoryId: s.categoryId ? s.categoryId.toString() : "",
      isActive: s.isActive,
      banner: s.imageUrl,
    })),
    products: products.map((p) => {
      const s = series.find(
        (ser) => ser._id.toString() === p.seriesId.toString(),
      );
      const c = s
        ? categories.find(
            (cat) => cat._id.toString() === s.categoryId.toString(),
          )
        : null;
      return {
        id: p._id.toString(),
        name: p.name,
        brandId: c ? c.brandId.toString() : "",
        categoryId: s ? s.categoryId.toString() : "",
        seriesId: p.seriesId ? p.seriesId.toString() : "",
        isActive: p.isActive,
        iconImage: p.imageUrl,
      };
    }),
  };
};

module.exports = {
  getFilterOptionsService,
};
