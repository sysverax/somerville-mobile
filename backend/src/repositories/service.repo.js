const mongoose = require("mongoose");
const Service = require("../models/service");
const Product = require("../models/product");
const Series = require("../models/series");
const Category = require("../models/category");
const Brand = require("../models/brand");
const { USER_ROLES } = require("../utils/constants/user.constants");

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
};

const getProductIdsByLevelRepo = async (level, levelId, session = null) => {
  const objectId = new mongoose.Types.ObjectId(levelId);

  switch (level) {
    case "product": {
      return [objectId];
    }

    case "series": {
      const products = await Product.find({ seriesId: objectId })
        .select("_id")
        .session(session)
        .lean();
      return products.map((p) => p._id);
    }

    case "category": {
      const seriesInCategory = await Series.find({ categoryId: objectId })
        .select("_id")
        .session(session)
        .lean();
      const seriesIds = seriesInCategory.map((s) => s._id);
      if (!seriesIds.length) return [];

      const products = await Product.find({ seriesId: { $in: seriesIds } })
        .select("_id")
        .session(session)
        .lean();
      return products.map((p) => p._id);
    }

    case "brand": {
      const categoriesInBrand = await Category.find({ brandId: objectId })
        .select("_id")
        .session(session)
        .lean();
      const categoryIds = categoriesInBrand.map((c) => c._id);
      if (!categoryIds.length) return [];

      const seriesInBrand = await Series.find({
        categoryId: { $in: categoryIds },
      })
        .select("_id")
        .session(session)
        .lean();
      const seriesIds = seriesInBrand.map((s) => s._id);
      if (!seriesIds.length) return [];

      const products = await Product.find({ seriesId: { $in: seriesIds } })
        .select("_id")
        .session(session)
        .lean();
      return products.map((p) => p._id);
    }

    default:
      return [];
  }
};

const validateLevelIdExistsRepo = async (level, levelId) => {
  const objectId = new mongoose.Types.ObjectId(levelId);

  const modelMap = {
    brand: Brand,
    category: Category,
    series: Series,
    product: Product,
  };

  const Model = modelMap[level];
  if (!Model) return null;

  return Model.findById(objectId).select("_id name").lean();
};

const getVariantsByParentServiceIdRepo = async (
  parentServiceId,
  session = null,
) => {
  return Service.find({
    parentServiceId: new mongoose.Types.ObjectId(parentServiceId),
    isVariant: true,
  })
    .session(session)
    .sort({ createdAt: 1, _id: 1 })
    .lean();
};

const updateVariantRepo = async (variantId, payload, session) => {
  const updateData = { ...payload };
  delete updateData.id;

  const options = {
    returnDocument: "after",
    runValidators: true,
  };

  if (session) {
    options.session = session;
  }

  return Service.findByIdAndUpdate(variantId, updateData, options).lean();
};

const createVariantRepo = async (payload, session) => {
  const [variant] = await Service.create(
    [
      {
        name: payload.name,
        description: payload.description,
        basePrice: payload.basePrice,
        estimatedTime: payload.estimatedTime,
        isActive: payload.isActive,
        level: payload.level,
        levelId: new mongoose.Types.ObjectId(payload.levelId),
        isParent: false,
        isVariant: true,
        parentServiceId: new mongoose.Types.ObjectId(payload.parentServiceId),
      },
    ],
    { session },
  );

  return Service.findById(variant._id).session(session).lean();
};

const deleteVariantsByIdsRepo = async (variantIds, session) => {
  return Service.deleteMany({
    _id: { $in: variantIds.map((id) => new mongoose.Types.ObjectId(id)) },
    isVariant: true,
  }).session(session);
};

const updateServiceRepo = async (id, payload, session) => {
  const updateData = { ...payload };
  delete updateData.id;
  delete updateData.variants;
  delete updateData.removeVariants;
  delete updateData.newVariants;

  if (updateData.levelId) {
    updateData.levelId = new mongoose.Types.ObjectId(updateData.levelId);
  }

  const options = {
    returnDocument: "after",
    runValidators: true,
  };

  if (session) {
    options.session = session;
  }

  return Service.findByIdAndUpdate(id, updateData, options).lean();
};

const updateServiceStatusRepo = async (id, isActive) => {
  return Service.findByIdAndUpdate(
    id,
    { isActive },
    { returnDocument: "after", runValidators: true },
  ).lean();
};

const getServiceByIdRepo = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Service.findById(id).lean();
};

const updateVariantsLevelRepo = async (
  parentServiceId,
  level,
  levelId,
  session,
) => {
  return Service.updateMany(
    {
      parentServiceId: new mongoose.Types.ObjectId(parentServiceId),
      isVariant: true,
    },
    {
      level,
      levelId: new mongoose.Types.ObjectId(levelId),
    },
  ).session(session);
};

const getAllServicesRepo = async ({
  page,
  limit,
  userRole,
  level,
  brandId,
  categoryId,
  seriesId,
  productId,
  search,
  isActive,
}) => {
  const skip = (page - 1) * limit;

  // ── 1. Build base match filter ──
  const matchFilter = { isVariant: false };

  if (userRole !== USER_ROLES.ADMIN) {
    matchFilter.isActive = true;
  } else if (isActive !== undefined) {
    matchFilter.isActive = isActive; 
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    
    // Find IDs of services matching search (both parents and variants)
    const matchingServices = await Service.find({ 
      name: { $regex: regex }
    }).select('_id isVariant parentServiceId');

    const parentIds = matchingServices.map(s => 
      s.isVariant ? s.parentServiceId : s._id
    );

    matchFilter._id = { $in: parentIds };
  }

  // ── 2. Resolve hierarchical IDs ──
  let resolvedCategoryIds = [];
  let resolvedSeriesIds = [];
  let resolvedProductIds = [];

  try {
    if (productId) {
      const pid = new mongoose.Types.ObjectId(productId);
      resolvedProductIds = [pid];
      // Resolve upward to include parent levels services
      const product = await Product.findById(pid).select("seriesId").lean();
      if (product) {
        resolvedSeriesIds = [product.seriesId];
        const series = await Series.findById(product.seriesId).select("categoryId").lean();
        if (series) {
          resolvedCategoryIds = [series.categoryId];
        }
      }
    } else if (seriesId) {
      const sid = new mongoose.Types.ObjectId(seriesId);
      resolvedSeriesIds = [sid];
      // Resolve upward to include parent category services
      const series = await Series.findById(sid).select("categoryId").lean();
      if (series) {
        resolvedCategoryIds = [series.categoryId];
      }
      // Resolve downward to include all product services for this series
      const prods = await Product.find({ seriesId: sid }).select("_id").lean();
      resolvedProductIds = prods.map((p) => p._id);
    } else if (categoryId) {
      const cid = new mongoose.Types.ObjectId(categoryId);
      resolvedCategoryIds = [cid];
      const sers = await Series.find({ categoryId: cid }).select("_id").lean();
      resolvedSeriesIds = sers.map((s) => s._id);
      const prods = await Product.find({
        seriesId: { $in: resolvedSeriesIds },
      }).select("_id").lean();
      resolvedProductIds = prods.map((p) => p._id);
    } else if (brandId) {
      const bid = new mongoose.Types.ObjectId(brandId);
      const cats = await Category.find({ brandId: bid }).select("_id").lean();
      resolvedCategoryIds = cats.map((c) => c._id);
      const sers = await Series.find({
        categoryId: { $in: resolvedCategoryIds },
      }).select("_id").lean();
      resolvedSeriesIds = sers.map((s) => s._id);
      const prods = await Product.find({
        seriesId: { $in: resolvedSeriesIds },
      }).select("_id").lean();
      resolvedProductIds = prods.map((p) => p._id);
    }

    if (brandId || categoryId || seriesId || productId) {
      const orConditions = [];
      if (brandId) {
        orConditions.push({
          level: "brand",
          levelId: new mongoose.Types.ObjectId(brandId),
        });
      }
      if (resolvedCategoryIds.length > 0) {
        orConditions.push({
          level: "category",
          levelId: { $in: resolvedCategoryIds },
        });
      }
      if (resolvedSeriesIds.length > 0) {
        orConditions.push({
          level: "series",
          levelId: { $in: resolvedSeriesIds },
        });
      }
      if (resolvedProductIds.length > 0) {
        orConditions.push({
          level: "product",
          levelId: { $in: resolvedProductIds },
        });
      }

      if (orConditions.length > 0) {
        matchFilter.$or = orConditions;
      } else {
        // If filters specified but no items found in hierarchy, return nothing
        matchFilter._id = { $in: [] };
      }
    }
  } catch (err) {
    console.error("Error resolving hierarchy IDs:", err);
    // Continue with existing matchFilter
  }

  if (level) {
    matchFilter.level = level;
  }

  // ── 3. Build aggregation pipeline ──
  const pipeline = [
    { $match: matchFilter },

    // ── 4. Facet — count + paginate in one pass ──
    {
      $facet: {
        services: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },

          // ── Variants lookup ──
          {
            $lookup: {
              from: "services",
              let: { parentId: "$_id", parentName: "$name" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$parentServiceId", "$$parentId"] },
                        { $eq: ["$isVariant", true] },
                        ...(isActive !== undefined ? [{ $eq: ["$isActive", isActive] }] : []),
                        ...(userRole !== USER_ROLES.ADMIN ? [{ $eq: ["$isActive", true] }] : []),
                        ...(search ? [
                          {
                            $or: [
                              { $regexMatch: { input: "$name", regex: search, options: "i" } },
                              { $regexMatch: { input: "$$parentName", regex: search, options: "i" } }
                            ]
                          }
                        ] : []),
                      ]
                    },
                  },
                },
                { $sort: { createdAt: 1, _id: 1 } },
                {
                  $lookup: {
                    from: "product_services",
                    localField: "_id",
                    foreignField: "serviceId",
                    as: "v_prod_entries",
                  },
                },
                {
                  $addFields: {
                    linkedProductsCount: { $size: "$v_prod_entries" },
                    // Keep IDs for parent aggregation
                    _variantProductIds: "$v_prod_entries.productId"
                  },
                },
              ],
              as: "variants",
            },
          },

          // ── Product services lookup ──
          {
            $lookup: {
              from: "product_services",
              localField: "_id",
              foreignField: "serviceId",
              as: "p_prod_entries",
            },
          },

          // ── Compute linkedProductsCount ──
          {
            $addFields: {
              linkedProductsCount: {
                $size: {
                  $setUnion: [
                    "$p_prod_entries.productId",
                    {
                      $reduce: {
                        input: "$variants",
                        initialValue: [],
                        in: {
                          $concatArrays: [
                            "$$value",
                            {
                              $ifNull: ["$$this._variantProductIds", []],
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },

          // ── Conditional assignedTo lookups ──
          {
            $lookup: {
              from: "brands",
              let: { lvl: "$level", lid: "$levelId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$$lvl", "brand"] },
                        { $eq: ["$_id", "$$lid"] },
                      ],
                    },
                  },
                },
                { $project: { name: 1 } },
              ],
              as: "_brandInfo",
            },
          },
          {
            $lookup: {
              from: "categories",
              let: { lvl: "$level", lid: "$levelId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$$lvl", "category"] },
                        { $eq: ["$_id", "$$lid"] },
                      ],
                    },
                  },
                },
                { $project: { name: 1 } },
              ],
              as: "_categoryInfo",
            },
          },
          {
            $lookup: {
              from: "series",
              let: { lvl: "$level", lid: "$levelId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$$lvl", "series"] },
                        { $eq: ["$_id", "$$lid"] },
                      ],
                    },
                  },
                },
                { $project: { name: 1 } },
              ],
              as: "_seriesInfo",
            },
          },
          {
            $lookup: {
              from: "products",
              let: { lvl: "$level", lid: "$levelId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$$lvl", "product"] },
                        { $eq: ["$_id", "$$lid"] },
                      ],
                    },
                  },
                },
                { $project: { name: 1 } },
              ],
              as: "_productInfo",
            },
          },

          // ── Compute assignedTo ──
          {
            $addFields: {
              assignedTo: {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$level", "brand"] },
                      then: { $arrayElemAt: ["$_brandInfo.name", 0] },
                    },
                    {
                      case: { $eq: ["$level", "category"] },
                      then: { $arrayElemAt: ["$_categoryInfo.name", 0] },
                    },
                    {
                      case: { $eq: ["$level", "series"] },
                      then: { $arrayElemAt: ["$_seriesInfo.name", 0] },
                    },
                    {
                      case: { $eq: ["$level", "product"] },
                      then: { $arrayElemAt: ["$_productInfo.name", 0] },
                    },
                  ],
                  default: "",
                },
              },
            },
          },

          {
            $project: {
              p_prod_entries: 0,
              _brandInfo: 0,
              _categoryInfo: 0,
              _seriesInfo: 0,
              _productInfo: 0,
              _resolvedProducts: 0,
              _resolvedSeries: 0,
              _resolvedCategories: 0,
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    },
  ];

  const result = await Service.aggregate(pipeline);
  const services = result[0]?.services ?? [];
  const total = result[0]?.total[0]?.count ?? 0;

  return { services, total };
};

const getServicesByConditionsRepo = async (conditions) => {
  return Service.find(conditions).lean();
};

const deleteServicesByIdsRepo = async (serviceIds, session = null) => {
  if (!serviceIds || serviceIds.length === 0) return;
  return Service.deleteMany(
    { _id: { $in: serviceIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { session },
  );
};

const deleteVariantsByParentIdsRepo = async (parentIds, session = null) => {
  if (!parentIds || parentIds.length === 0) return;
  return Service.deleteMany(
    {
      parentServiceId: {
        $in: parentIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      isVariant: true,
    },
    { session },
  );
};

module.exports = {
  createServiceRepo,
  createManyServicesRepo,
  getServiceByNameRepo,
  getProductIdsByLevelRepo,
  validateLevelIdExistsRepo,
  updateServiceRepo,
  updateServiceStatusRepo,
  getServiceByIdRepo,
  getVariantsByParentServiceIdRepo,
  updateVariantRepo,
  createVariantRepo,
  deleteVariantsByIdsRepo,
  updateVariantsLevelRepo,
  getAllServicesRepo,
  getServicesByConditionsRepo,
  deleteServicesByIdsRepo,
  deleteVariantsByParentIdsRepo,
};
