const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const brandRepo = require("../repositories/brand.repo");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const brandResponseDto = require("../dtos/brand.dtos/res.brand.dto");
const categoryRepo = require("../repositories/category.repo");
const seriesRepo = require("../repositories/series.repo");
const productRepo = require("../repositories/product.repo");
const serviceRepo = require("../repositories/service.repo");
const productServiceRepo = require("../repositories/productService.repo");

const createBrandService = async (createBrandRequestDto, logger) => {
  const existingBrand = await brandRepo.getBrandByNameRepo(
    createBrandRequestDto.name,
  );
  if (existingBrand) {
    throw new appError.ConflictError(
      "Brand with this name already exists",
      "A brand with this name already exists.",
      "Use a different brand name.",
    );
  }

  const [iconImageUrl, bannerImageUrl] = await Promise.all([
    uploadFileToS3({
      file: createBrandRequestDto.iconImageFile,
      folder: `brands/${createBrandRequestDto.name}/icon`,
    }).then((result) => result.url),
    uploadFileToS3({
      file: createBrandRequestDto.bannerImageFile,
      folder: `brands/${createBrandRequestDto.name}/banner`,
    }).then((result) => result.url),
  ]);

  const brand = await brandRepo.createBrandRepo({
    name: createBrandRequestDto.name,
    description: createBrandRequestDto.description?.trim() || "",
    iconImageUrl,
    bannerImageUrl,
    isActive: createBrandRequestDto.isActive,
  });

  logger.info("Brand created successfully", {
    brandId: brand._id.toString(),
  });

  return new brandResponseDto.CreateBrandResponseDTO(brand);
};

const getAllBrandsService = async (getAllBradsRequestDto, logger) => {
  logger.info("Fetching brands with pagination", {
    page: getAllBradsRequestDto.page,
    limit: getAllBradsRequestDto.limit,
    userRole: getAllBradsRequestDto.userRole,
  });
  const { brands, totalBrands } = await brandRepo.getAllBrandsRepo(
    getAllBradsRequestDto.page,
    getAllBradsRequestDto.limit,
    getAllBradsRequestDto.userRole,
  );
  return new brandResponseDto.GetAllBrandsResponseDTO(
    brands,
    totalBrands,
    getAllBradsRequestDto.page,
    getAllBradsRequestDto.limit,
  );
};

const getBrandByIdService = async (getBrandByIdRequestDto, logger) => {
  const brand = await brandRepo.getBrandByIdRepo(getBrandByIdRequestDto.id);
  if (!brand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }
  if (getBrandByIdRequestDto.userRole !== USER_ROLES.ADMIN && !brand.isActive) {
    throw new appError.NotFoundError(
      "Brand is not available",
      "The requested brand is currently inactive.",
      "Contact support for more information.",
    );
  }

  return new brandResponseDto.GetBrandByIdResponseDTO(brand);
};

const updateBrandService = async (updatePayload, logger) => {
  const existingBrand = await brandRepo.getBrandByIdRepo(updatePayload.id);
  if (!existingBrand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }

  if (updatePayload.name) {
    const brandWithSameName = await brandRepo.getBrandByNameRepo(
      updatePayload.name,
    );
    if (
      brandWithSameName &&
      brandWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Brand with this name already exists",
        "Another brand with the same name already exists.",
        "Use a different brand name.",
      );
    }
  }

  if (updatePayload.iconImageFile) {
    const uploadedIcon = await uploadFileToS3({
      file: updatePayload.iconImageFile,
      folder: `brands/${existingBrand.name}/icon`,
    });
    updatePayload.iconImageUrl = uploadedIcon.url;
  }

  if (updatePayload.bannerImageFile) {
    const uploadedBanner = await uploadFileToS3({
      file: updatePayload.bannerImageFile,
      folder: `brands/${existingBrand.name}/banner`,
    });
    updatePayload.bannerImageUrl = uploadedBanner.url;
  }

  const updatedBrand = await brandRepo.updateBrandRepo(
    updatePayload.id,
    updatePayload,
  );

  logger.info("Brand updated successfully", {
    brandId: updatedBrand._id.toString(),
  });

  try {
    if (updatePayload.iconImageFile) {
      await deleteImageFromS3(existingBrand.iconImageUrl);
    }
  } catch (error) {
    logger.error("Error deleting old brand images", { error });
  }
  try {
    if (updatePayload.bannerImageFile) {
      await deleteImageFromS3(existingBrand.bannerImageUrl);
    }
  } catch (error) {
    logger.error("Error deleting old brand images", { error });
  }

  return new brandResponseDto.UpdateBrandResponseDTO(updatedBrand);
};

const updateBrandStatusService = async (updateStatusDto, logger) => {
  const existingBrand = await brandRepo.getBrandByIdRepo(updateStatusDto.id);
  if (!existingBrand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }
  const updatedBrand = await brandRepo.updateBrandStatusRepo(
    updateStatusDto.id,
    updateStatusDto.isActive,
  );

  logger.info("Brand status updated successfully", {
    brandId: updatedBrand._id.toString(),
  });

  return new brandResponseDto.UpdateBrandStatusResponseDTO(updatedBrand);
};

const deleteBrandService = async (id, logger) => {
  const brand = await brandRepo.getBrandByIdRepo(id);
  if (!brand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }

  const categories = await categoryRepo.getCategoriesByBrandIdRepo(id);
  const categoryIds = categories.map(c => c._id.toString());
  
  let series = [];
  let seriesIds = [];
  if (categoryIds.length > 0) {
    series = await seriesRepo.getSeriesByCategoryIdsRepo(categoryIds);
    seriesIds = series.map(s => s._id.toString());
  }

  let products = [];
  let productIds = [];
  if (seriesIds.length > 0) {
    products = await productRepo.getProductsBySeriesIdsRepo(seriesIds);
    productIds = products.map(p => p._id.toString());
  }

  const serviceConditions = [
    { level: "brand", levelId: id }
  ];
  if (categoryIds.length > 0) serviceConditions.push({ level: "category", levelId: { $in: categoryIds } });
  if (seriesIds.length > 0) serviceConditions.push({ level: "series", levelId: { $in: seriesIds } });
  if (productIds.length > 0) serviceConditions.push({ level: "product", levelId: { $in: productIds } });

  const services = await serviceRepo.getServicesByConditionsRepo({ $or: serviceConditions, isVariant: false });
  const serviceIds = services.map(s => s._id.toString());

  const imagesToDelete = [brand.iconImageUrl, brand.bannerImageUrl];
  categories.forEach(c => c.imageUrl && imagesToDelete.push(c.imageUrl));
  series.forEach(s => s.imageUrl && imagesToDelete.push(s.imageUrl));
  products.forEach(p => p.imageUrl && imagesToDelete.push(p.imageUrl));

  const imageDeletions = imagesToDelete
    .filter(url => url)
    .map(url => deleteImageFromS3(url).catch(err => logger?.error("Error deleting image from S3 against Brand deletion", { url, error: err })));
  
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
      await seriesRepo.deleteSeriesByCategoryIdsRepo(categoryIds, session);
    }

    if (categoryIds.length > 0) {
      await categoryRepo.deleteCategoriesByBrandIdRepo(id, session);
    }

    await brandRepo.deleteBrandRepo(id, session);

    await session.commitTransaction();
    logger?.info("Brand and all associated entities deleted successfully (transaction committed)", {
      brandId: id,
      categoriesCount: categoryIds.length,
      seriesCount: seriesIds.length,
      productsCount: productIds.length,
      servicesCount: serviceIds.length
    });
  } catch (error) {
    await session.abortTransaction();
    logger?.error("Brand deletion transaction failed. Rolled back.", { brandId: id, error });
    throw new appError.InternalServerError(
      "Deletion Failed",
      "An error occurred while deleting the brand and its hierarchy. No data was deleted.",
      "Please try again."
    );
  } finally {
    session.endSession();
  }
};

module.exports = {
  createBrandService,
  getAllBrandsService,
  getBrandByIdService,
  updateBrandService,
  updateBrandStatusService,
  deleteBrandService,
};
