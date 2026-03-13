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



const getVariantsByParentServiceIdRepo = async (parentServiceId, session = null) => {
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
  const query = { isVariant: false };

  if (userRole !== USER_ROLES.ADMIN) {
    query.isActive = true;
  } else if (isActive !== undefined) {
    query.isActive = isActive;
  }

  const levelConditions = [];

  const addCondition = (lvl, idOrIds) => {
    if (Array.isArray(idOrIds)) {
      if (idOrIds.length > 0) {
        levelConditions.push({
          level: lvl,
          levelId: {
            $in: idOrIds.map((val) => new mongoose.Types.ObjectId(val)),
          },
        });
      }
    } else {
      levelConditions.push({
        level: lvl,
        levelId: new mongoose.Types.ObjectId(idOrIds),
      });
    }
  };

  const mostSpecificId = productId || seriesId || categoryId || brandId;

  if (mostSpecificId) {
    const msId = new mongoose.Types.ObjectId(mostSpecificId);

    if (productId) {
      addCondition("product", msId);
    } else if (seriesId) {
      addCondition("series", msId);
      const products = await Product.find({ seriesId: msId })
        .select("_id")
        .lean();
      addCondition(
        "product",
        products.map((p) => p._id),
      );
    } else if (categoryId) {
      addCondition("category", msId);
      const seriesItems = await Series.find({ categoryId: msId })
        .select("_id")
        .lean();
      const sIds = seriesItems.map((s) => s._id);
      addCondition("series", sIds);
      const products = await Product.find({ seriesId: { $in: sIds } })
        .select("_id")
        .lean();
      addCondition(
        "product",
        products.map((p) => p._id),
      );
    } else if (brandId) {
      addCondition("brand", msId);
      const categories = await Category.find({ brandId: msId })
        .select("_id")
        .lean();
      const cIds = categories.map((c) => c._id);
      addCondition("category", cIds);
      const seriesItems = await Series.find({ categoryId: { $in: cIds } })
        .select("_id")
        .lean();
      const sIds = seriesItems.map((s) => s._id);
      addCondition("series", sIds);
      const products = await Product.find({ seriesId: { $in: sIds } })
        .select("_id")
        .lean();
      addCondition(
        "product",
        products.map((p) => p._id),
      );
    }
  }

  if (level) {
    query.level = level;
    if (levelConditions.length > 0) {
      const targetConditions = levelConditions.filter((c) => c.level === level);
      if (targetConditions.length > 0) {
        const allIds = targetConditions.reduce((acc, c) => {
          const ids = c.levelId.$in ? c.levelId.$in : [c.levelId];
          return acc.concat(ids);
        }, []);
        query.levelId = { $in: allIds };
      } else {
        query.levelId = { $in: [] };
      }
    }
  } else if (levelConditions.length > 0) {
    query.$or = levelConditions;
  }

  if (search) {
    const searchOr = [
      { name: { $regex: search, $options: "i" } },
    ];

    if (query.$or) {
      const existingOr = query.$or;
      delete query.$or;
      query.$and = [{ $or: existingOr }, { $or: searchOr }];
    } else {
      query.$or = searchOr;
    }
  }

  const skip = (page - 1) * limit;

  console.log("getAllServicesRepo query:", JSON.stringify(query, null, 2));

  const [services, total] = await Promise.all([
    Service.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "services",
          let: { parentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$parentServiceId", "$$parentId"] },
                ...(userRole !== USER_ROLES.ADMIN ? { isActive: true } : {}),
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
          ],
          as: "variants",
        },
      },
      {
        $lookup: {
          from: "product_services",
          localField: "_id",
          foreignField: "serviceId",
          as: "p_prod_entries",
        },
      },
      {
        $addFields: {
          allProdEntries: {
            $concatArrays: [
              "$p_prod_entries.productId",
              {
                $reduce: {
                  input: "$variants",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this.v_prod_entries.productId"] },
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          linkedProductsCount: {
            $size: { $setUnion: ["$allProdEntries", []] },
          },
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "levelId",
          foreignField: "_id",
          as: "brandInfo",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "levelId",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $lookup: {
          from: "series",
          localField: "levelId",
          foreignField: "_id",
          as: "seriesInfo",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "levelId",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      {
        $addFields: {
          assignedTo: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$level", "brand"] },
                  then: { $arrayElemAt: ["$brandInfo.name", 0] },
                },
                {
                  case: { $eq: ["$level", "category"] },
                  then: { $arrayElemAt: ["$categoryInfo.name", 0] },
                },
                {
                  case: { $eq: ["$level", "series"] },
                  then: { $arrayElemAt: ["$seriesInfo.name", 0] },
                },
                {
                  case: { $eq: ["$level", "product"] },
                  then: { $arrayElemAt: ["$productInfo.name", 0] },
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
          allProdEntries: 0,
          brandInfo: 0,
          categoryInfo: 0,
          seriesInfo: 0,
          productInfo: 0,
          "variants.v_prod_entries": 0,
        },
      },
    ]),
    Service.countDocuments(query),
  ]);

  return { services, total };
};



const getServicesByConditionsRepo = async (conditions) => {
  return Service.find(conditions).lean();
};

const deleteServicesByIdsRepo = async (serviceIds, session = null) => {
  if (!serviceIds || serviceIds.length === 0) return;
  return Service.deleteMany(
    { _id: { $in: serviceIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { session }
  );
};

const deleteVariantsByParentIdsRepo = async (parentIds, session = null) => {
  if (!parentIds || parentIds.length === 0) return;
  return Service.deleteMany(
    { parentServiceId: { $in: parentIds.map((id) => new mongoose.Types.ObjectId(id)) }, isVariant: true },
    { session }
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
