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
    matchFilter.name = { $regex: search, $options: "i" };
  }

  // ── 2. Resolve hierarchy IDs using $lookup inside pipeline ──
  //    instead of N+1 sequential DB calls before aggregation
  const levelMatchStages = [];

  if (productId) {
    matchFilter.level = level || "product";
    matchFilter.levelId = new mongoose.Types.ObjectId(productId);
  } else if (seriesId) {
    const sid = new mongoose.Types.ObjectId(seriesId);
    levelMatchStages.push({
      $match: {
        $or: [
          { level: "series", levelId: sid },
          { level: "product" }, // refined after product lookup below
        ],
      },
    });
  } else if (categoryId || brandId) {
    // these are handled via $lookup pipeline stages below
  }

  if (level && !productId) {
    matchFilter.level = level;
  }

  // ── 3. Build aggregation pipeline ──
  const pipeline = [
    { $match: matchFilter },

    // ── 4. Resolve hierarchy via $lookup instead of pre-fetching ──
    ...(seriesId
      ? [
          {
            $lookup: {
              from: "products",
              let: { lvl: "$level", lid: "$levelId" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: [
                            "$seriesId",
                            new mongoose.Types.ObjectId(seriesId),
                          ],
                        },
                      ],
                    },
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "_resolvedProducts",
            },
          },
          {
            $match: {
              $or: [
                {
                  level: "series",
                  levelId: new mongoose.Types.ObjectId(seriesId),
                },
                {
                  level: "product",
                  $expr: {
                    $in: ["$levelId", "$_resolvedProducts._id"],
                  },
                },
              ],
            },
          },
        ]
      : []),

    ...(categoryId
      ? [
          {
            $lookup: {
              from: "series",
              pipeline: [
                {
                  $match: {
                    categoryId: new mongoose.Types.ObjectId(categoryId),
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "_resolvedSeries",
            },
          },
          {
            $lookup: {
              from: "products",
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: [
                        "$seriesId",
                        {
                          $map: {
                            input: "$_resolvedSeries",
                            as: "s",
                            in: "$$s._id",
                          },
                        },
                      ],
                    },
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "_resolvedProducts",
            },
          },
          {
            $match: {
              $or: [
                {
                  level: "category",
                  levelId: new mongoose.Types.ObjectId(categoryId),
                },
                {
                  level: "series",
                  $expr: { $in: ["$levelId", "$_resolvedSeries._id"] },
                },
                {
                  level: "product",
                  $expr: { $in: ["$levelId", "$_resolvedProducts._id"] },
                },
              ],
            },
          },
        ]
      : []),

    ...(brandId
      ? [
          {
            $lookup: {
              from: "categories",
              pipeline: [
                { $match: { brandId: new mongoose.Types.ObjectId(brandId) } },
                { $project: { _id: 1 } },
              ],
              as: "_resolvedCategories",
            },
          },
          {
            $lookup: {
              from: "series",
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$categoryId", "$_resolvedCategories._id"] },
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "_resolvedSeries",
            },
          },
          {
            $lookup: {
              from: "products",
              pipeline: [
                {
                  $match: {
                    $expr: { $in: ["$seriesId", "$_resolvedSeries._id"] },
                  },
                },
                { $project: { _id: 1 } },
              ],
              as: "_resolvedProducts",
            },
          },
          {
            $match: {
              $or: [
                {
                  level: "brand",
                  levelId: new mongoose.Types.ObjectId(brandId),
                },
                {
                  level: "category",
                  $expr: { $in: ["$levelId", "$_resolvedCategories._id"] },
                },
                {
                  level: "series",
                  $expr: { $in: ["$levelId", "$_resolvedSeries._id"] },
                },
                {
                  level: "product",
                  $expr: { $in: ["$levelId", "$_resolvedProducts._id"] },
                },
              ],
            },
          },
        ]
      : []),

    // ── 5. Facet — count + paginate in one pass ──
    {
      $facet: {
        services: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },

          // ── 6. Variants lookup (only on paginated results) ──
          {
            $lookup: {
              from: "services",
              let: { parentId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$parentServiceId", "$$parentId"] },
                    isVariant: true,
                    ...(userRole !== USER_ROLES.ADMIN
                      ? { isActive: true }
                      : {}),
                  },
                },
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
                  },
                },
                { $project: { v_prod_entries: 0 } },
              ],
              as: "variants",
            },
          },

          // ── 7. Product services lookup ──
          {
            $lookup: {
              from: "product_services",
              localField: "_id",
              foreignField: "serviceId",
              as: "p_prod_entries",
            },
          },

          // ── 8. Compute linkedProductsCount ──
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
                              $ifNull: ["$$this.v_prod_entries.productId", []],
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

          // ── 9. Single conditional $lookup for assignedTo ──
          //    instead of 4 unconditional lookups
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

          // ── 10. Compute assignedTo ──
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

          // ── 11. Clean up temp fields ──
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
