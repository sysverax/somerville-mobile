const mongoose = require("mongoose");
const ProductService = require("../models/productService");

const createManyProductServicesRepo = async (productServicesArray, session) => {
  return ProductService.insertMany(productServicesArray, { session });
};

const getProductServiceByIdRepo = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return ProductService.findById(id)
    .populate("serviceId")
    .populate("productId")
    .lean();
};

const updateProductServiceRepo = async (id, payload) => {
  const options = {
    returnDocument: "after",
    runValidators: true,
  };
  return ProductService.findByIdAndUpdate(id, payload, options).lean();
};

const updateProductServiceStatusRepo = async (id, isActive) => {
  return ProductService.findByIdAndUpdate(
    id,
    { isActive },
    { returnDocument: "after", runValidators: true },
  ).lean();
};

const updateProductServicesByServiceIdAndIsDefaultRepo = async (
  serviceId,
  updatePayload,
  session = null
) => {
  return ProductService.updateMany(
    {
      serviceId: new mongoose.Types.ObjectId(serviceId),
      isDefault: true,
    },
    updatePayload,
    { runValidators: true, session },
  ).lean();
};

const bulkUpdateProductServicesRepo = async (bulkOps, session) => {
  return ProductService.bulkWrite(bulkOps, { session });
};

const getProductServicesByProductIdRepo = async (productId) => {
  return ProductService.find({
    productId: new mongoose.Types.ObjectId(productId),
  })
    .populate({
      path: "serviceId",
      populate: { path: "parentServiceId" },
    })
    .lean();
};

const getProductsByServiceIdRepo = async (serviceId, page, limit) => {
  const skip = (page - 1) * limit;
  const ids = Array.isArray(serviceId) ? serviceId : [serviceId];
  const query = {
    serviceId: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
  };

  const [productServices, total] = await Promise.all([
    ProductService.find(query)
      .populate("productId")
      .skip(skip)
      .limit(limit)
      .lean(),
    ProductService.countDocuments(query),
  ]);

  return { productServices, total };
};

const getProductServicesByServiceIdsRepo = async (serviceIds, session = null) => {
  return ProductService.find({
    serviceId: { $in: serviceIds.map((id) => new mongoose.Types.ObjectId(id)) },
  })
    .session(session)
    .lean();
};

const deleteProductServicesByServiceIdsRepo = async (serviceIds, session = null) => {
  if (!serviceIds || serviceIds.length === 0) return;
  return ProductService.deleteMany(
    { serviceId: { $in: serviceIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { session },
  );
};

const deleteProductServicesByServiceAndProductIdsRepo = async (
  serviceIds,
  productIds,
  session,
) => {
  return ProductService.deleteMany({
    serviceId: { $in: serviceIds.map((id) => new mongoose.Types.ObjectId(id)) },
    productId: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).session(session);
};

const deleteProductServicesByProductIdsRepo = async (productIds, session = null) => {
  if (!productIds || productIds.length === 0) return;
  return ProductService.deleteMany(
    { productId: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { session },
  );
};

module.exports = {
  createManyProductServicesRepo,
  getProductServiceByIdRepo,
  updateProductServiceRepo,
  updateProductServiceStatusRepo,
  updateProductServicesByServiceIdAndIsDefaultRepo,
  bulkUpdateProductServicesRepo,
  getProductServicesByProductIdRepo,
  getProductsByServiceIdRepo,
  getProductServicesByServiceIdsRepo,
  deleteProductServicesByServiceIdsRepo,
  deleteProductServicesByServiceAndProductIdsRepo,
  deleteProductServicesByProductIdsRepo,
};
