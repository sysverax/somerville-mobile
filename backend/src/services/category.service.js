const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const categoryRepo = require("../repositories/category.repo");
const categoryResponseDto = require("../dtos/category.dtos/res.category.dto");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const { randomUUID } = require("crypto");
const seriesRepo = require("../repositories/series.repo");
const productRepo = require("../repositories/product.repo");
const serviceRepo = require("../repositories/service.repo");
const productServiceRepo = require("../repositories/productService.repo");

const brandRepo = require("../repositories/brand.repo");

const createCategoryService = async (createCategoryRequestDto, logger) => {
  const brand = await brandRepo.getBrandByIdRepo(
    createCategoryRequestDto.brandId,
  );
  if (!brand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided brand id.",
      "Check the brand id and try again.",
    );
  }

  const existingCategory = await categoryRepo.getCategoryByNameRepo(
    createCategoryRequestDto.name,
    createCategoryRequestDto.brandId,
  );
  if (existingCategory) {
    throw new appError.ConflictError(
      "Category with this name already exists",
      "A category with this name already exists in this brand.",
      "Use a different category name.",
    );
  }

  const [iconImageUrl] = await Promise.all([
    uploadFileToS3({
      file: createCategoryRequestDto.iconImageFile,
      folder: `categories/${createCategoryRequestDto.name}-${randomUUID()}`,
    }).then((result) => result.url),
  ]);

  const category = await categoryRepo.createCategoryRepo({
    name: createCategoryRequestDto.name,
    description: createCategoryRequestDto.description?.trim() || "",
    imageUrl: iconImageUrl,
    isActive: createCategoryRequestDto.isActive,
    brandId: createCategoryRequestDto.brandId,
  });

  logger.info("Category created successfully", {
    categoryId: category._id.toString(),
  });

  return new categoryResponseDto.CreateCategoryResponseDTO(category);
};

const updateCategoryService = async (updatePayload, logger) => {
  const existingCategory = await categoryRepo.getCategoryByIdRepo(
    updatePayload.id,
  );
  if (!existingCategory) {
    throw new appError.NotFoundError(
      "Category not found",
      "No category exists for the provided id.",
      "Check the category id and try again.",
    );
  }

  const targetBrandId = existingCategory.brandId._id.toString();

  if (updatePayload.name) {
    const categoryWithSameName = await categoryRepo.getCategoryByNameRepo(
      updatePayload.name,
      targetBrandId,
    );
    if (
      categoryWithSameName &&
      categoryWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Category with this name already exists",
        "Another category with the same name already exists in this brand.",
        "Use a different category name.",
      );
    }
  }

  if (updatePayload.iconImageFile) {
    const uploadedIcon = await uploadFileToS3({
      file: updatePayload.iconImageFile,
      folder: `categories/${existingCategory.name}-${randomUUID()}`,
    });
    updatePayload.imageUrl = uploadedIcon.url;
  }

  const updatedCategory = await categoryRepo.updateCategoryRepo(
    updatePayload.id,
    updatePayload,
  );

  logger.info("Category updated successfully", {
    categoryId: updatedCategory._id.toString(),
  });

  if (updatePayload.iconImageFile && existingCategory.imageUrl) {
    try {
      await deleteImageFromS3(existingCategory.imageUrl);
    } catch (error) {
      logger.error("Error deleting old category image", { error });
    }
  }

  return new categoryResponseDto.UpdateCategoryResponseDTO(updatedCategory);
};

const updateCategoryStatusService = async (updateStatusDto, logger) => {
  const existingCategory = await categoryRepo.getCategoryByIdRepo(
    updateStatusDto.id,
  );
  if (!existingCategory) {
    throw new appError.NotFoundError(
      "Category not found",
      "No category exists for the provided id.",
      "Check the category id and try again.",
    );
  }

  const updatedCategory = await categoryRepo.updateCategoryStatusRepo(
    updateStatusDto.id,
    updateStatusDto.isActive,
  );

  logger.info("Category status updated successfully", {
    categoryId: updatedCategory._id.toString(),
  });

  return new categoryResponseDto.UpdateCategoryStatusResponseDTO(
    updatedCategory,
  );
};

const getAllCategoriesService = async (getAllCategoriesRequestDto, logger) => {
  logger.info("Fetching categories with pagination", {
    page: getAllCategoriesRequestDto.page,
    limit: getAllCategoriesRequestDto.limit,
    sortOrder: getAllCategoriesRequestDto.sortOrder,
    userRole: getAllCategoriesRequestDto.userRole,
    brandId: getAllCategoriesRequestDto.brandId,
  });
  const { categories, totalCategories } =
    await categoryRepo.getAllCategoriesRepo(
      getAllCategoriesRequestDto.page,
      getAllCategoriesRequestDto.limit,
      getAllCategoriesRequestDto.userRole,
      getAllCategoriesRequestDto.brandId,
      getAllCategoriesRequestDto.sortOrder,
    );
  return new categoryResponseDto.GetAllCategoriesResponseDTO(
    categories,
    totalCategories,
    getAllCategoriesRequestDto.page,
    getAllCategoriesRequestDto.limit,
  );
};

const getCategoryByIdService = async (getCategoryByIdRequestDto, logger) => {
  logger.info("Fetching category by id", {
    categoryId: getCategoryByIdRequestDto.id,
  });
  const category = await categoryRepo.getCategoryByIdRepo(
    getCategoryByIdRequestDto.id,
  );
  if (!category) {
    throw new appError.NotFoundError(
      "Category not found",
      "No category exists for the provided id.",
      "Check the category id and try again.",
    );
  }
  if (getCategoryByIdRequestDto.userRole !== USER_ROLES.ADMIN) {
    if (!category.isActive) {
      throw new appError.NotFoundError(
        "Category not found",
        "No category exists for the provided id.",
        "Check the category id and try again.",
      );
    }

    if (!category.brandId?.isActive) {
      throw new appError.NotFoundError(
        "Category not found",
        "No category exists for the provided id.",
        "Check the category id and try again.",
      );
    }
  }

  return new categoryResponseDto.GetCategoryByIdResponseDTO(category);
};

const deleteCategoryService = async (id, logger) => {
  const category = await categoryRepo.getCategoryByIdRepo(id);
  if (!category) {
    throw new appError.NotFoundError(
      "Category not found",
      "No category exists for the provided id.",
      "Check the category id and try again.",
    );
  }

  const series = await seriesRepo.getSeriesByCategoryIdRepo(id);
  const seriesIds = series.map(s => s._id.toString());

  let products = [];
  let productIds = [];
  if (seriesIds.length > 0) {
    products = await productRepo.getProductsBySeriesIdsRepo(seriesIds);
    productIds = products.map(p => p._id.toString());
  }

  const serviceConditions = [
    { level: "category", levelId: id }
  ];
  if (seriesIds.length > 0) serviceConditions.push({ level: "series", levelId: { $in: seriesIds } });
  if (productIds.length > 0) serviceConditions.push({ level: "product", levelId: { $in: productIds } });

  const services = await serviceRepo.getServicesByConditionsRepo({ $or: serviceConditions, isVariant: false });
  const serviceIds = services.map(s => s._id.toString());

  const imagesToDelete = [category.imageUrl];
  series.forEach(s => s.imageUrl && imagesToDelete.push(s.imageUrl));
  products.forEach(p => p.imageUrl && imagesToDelete.push(p.imageUrl));

  const imageDeletions = imagesToDelete
    .filter(url => url)
    .map(url => deleteImageFromS3(url).catch(err => logger?.error("Error deleting image from S3 against Category deletion", { url, error: err })));
  
  await Promise.allSettled(imageDeletions);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (serviceIds.length > 0) {
      await productServiceRepo.deleteProductServicesByServiceIdsRepo(serviceIds, session);
      await serviceRepo.deleteVariantsByParentIdsRepo(serviceIds, session);
      await serviceRepo.deleteServicesByIdsRepo(serviceIds, session);
    }
    
    if (productIds.length > 0) {
      await productServiceRepo.deleteProductServicesByProductIdsRepo(productIds, session);
      await productRepo.deleteProductsBySeriesIdsRepo(seriesIds, session);
    }

    if (seriesIds.length > 0) {
      await seriesRepo.deleteSeriesByCategoryIdsRepo([id], session); 
    }

    await categoryRepo.deleteCategoryRepo(id, session);

    await session.commitTransaction();
    logger?.info("Category and all associated entities deleted successfully (transaction committed)", {
      categoryId: id,
      seriesCount: seriesIds.length,
      productsCount: productIds.length,
      servicesCount: serviceIds.length
    });
  } catch (error) {
    await session.abortTransaction();
    logger?.error("Category deletion transaction failed. Rolled back.", { categoryId: id, error });
    throw new appError.InternalServerError(
      "Deletion Failed",
      "An error occurred while deleting the category and its hierarchy. No data was deleted.",
      "Please try again."
    );
  } finally {
    session.endSession();
  }
};

module.exports = {
  createCategoryService,
  updateCategoryService,
  updateCategoryStatusService,
  getAllCategoriesService,
  getCategoryByIdService,
  deleteCategoryService,
};
