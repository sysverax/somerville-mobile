const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const categoryRepo = require("../repositories/category.repo");
const seriesRepo = require("../repositories/series.repo");
const seriesResponseDto = require("../dtos/series.dtos/res.series.dto");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const { randomUUID } = require("crypto");
const productRepo = require("../repositories/product.repo");
const serviceRepo = require("../repositories/service.repo");
const productServiceRepo = require("../repositories/productService.repo");

const createSeriesService = async (createSeriesRequestDto, logger) => {
  const category = await categoryRepo.getCategoryByIdRepo(
    createSeriesRequestDto.categoryId,
  );
  if (!category) {
    throw new appError.NotFoundError(
      "Category not found",
      "No category exists for the provided category id.",
      "Check the category id and try again.",
    );
  }

  const existingSeries = await seriesRepo.getSeriesByNameRepo(
    createSeriesRequestDto.name,
    createSeriesRequestDto.categoryId,
  );
  if (existingSeries) {
    throw new appError.ConflictError(
      "Series already exists ",
      "A series with this name already exists in this category.",
      "Use a different series name.",
    );
  }

  const [iconImageUrl] = await Promise.all([
    uploadFileToS3({
      file: createSeriesRequestDto.iconImageFile,
      folder: `series/${createSeriesRequestDto.name}-${randomUUID()}`,
    }).then((result) => result.url),
  ]);

  const series = await seriesRepo.createSeriesRepo({
    name: createSeriesRequestDto.name,
    description: createSeriesRequestDto.description?.trim() || "",
    imageUrl: iconImageUrl,
    isActive: createSeriesRequestDto.isActive,
    categoryId: createSeriesRequestDto.categoryId,
  });

  logger.info("Series created successfully", {
    seriesId: series._id.toString(),
  });

  return new seriesResponseDto.CreateSeriesResponseDTO(series);
};

const updateSeriesService = async (updatePayload, logger) => {
  const existingSeries = await seriesRepo.getSeriesByIdRepo(updatePayload.id);
  if (!existingSeries) {
    throw new appError.NotFoundError(
      "Series not found",
      "No series exists for the provided id.",
      "Check the series id and try again.",
    );
  }

  const targetCategoryId = existingSeries.categoryId._id.toString();

  if (updatePayload.name) {
    const seriesWithSameName = await seriesRepo.getSeriesByNameRepo(
      updatePayload.name,
      targetCategoryId,
    );
    if (
      seriesWithSameName &&
      seriesWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Series with this name already exists",
        "Another series with the same name already exists in this category.",
        "Use a different series name.",
      );
    }
  }

  if (updatePayload.iconImageFile) {
    const uploadedIcon = await uploadFileToS3({
      file: updatePayload.iconImageFile,
      folder: `series/${existingSeries.name}-${randomUUID()}`,
    });
    updatePayload.imageUrl = uploadedIcon.url;
  }

  const updatedSeries = await seriesRepo.updateSeriesRepo(
    updatePayload.id,
    updatePayload,
  );

  logger.info("Series updated successfully", {
    seriesId: updatedSeries._id.toString(),
  });

  if (updatePayload.iconImageFile && existingSeries.imageUrl) {
    try {
      await deleteImageFromS3(existingSeries.imageUrl);
    } catch (error) {
      logger.error("Error deleting old series image", { error });
    }
  }

  return new seriesResponseDto.UpdateSeriesResponseDTO(updatedSeries);
};

const updateSeriesStatusService = async (updateStatusDto, logger) => {
  const existingSeries = await seriesRepo.getSeriesByIdRepo(updateStatusDto.id);
  if (!existingSeries) {
    throw new appError.NotFoundError(
      "Series not found",
      "No series exists for the provided id.",
      "Check the series id and try again.",
    );
  }

  const updatedSeries = await seriesRepo.updateSeriesStatusRepo(
    updateStatusDto.id,
    updateStatusDto.isActive,
  );

  logger.info("Series status updated successfully", {
    seriesId: updatedSeries._id.toString(),
  });

  return new seriesResponseDto.UpdateSeriesStatusResponseDTO(updatedSeries);
};

const getAllSeriesService = async (getAllSeriesRequestDto, logger) => {
  logger.info("Fetching series with pagination", {
    page: getAllSeriesRequestDto.page,
    limit: getAllSeriesRequestDto.limit,
    userRole: getAllSeriesRequestDto.userRole,
    categoryId: getAllSeriesRequestDto.categoryId,
    brandId: getAllSeriesRequestDto.brandId,
  });
  const { series, totalSeries } = await seriesRepo.getAllSeriesRepo(
    getAllSeriesRequestDto.page,
    getAllSeriesRequestDto.limit,
    getAllSeriesRequestDto.userRole,
    getAllSeriesRequestDto.categoryId,
    getAllSeriesRequestDto.brandId,
  );
  return new seriesResponseDto.GetAllSeriesResponseDTO(
    series,
    totalSeries,
    getAllSeriesRequestDto.page,
    getAllSeriesRequestDto.limit,
  );
};

const getSeriesByIdService = async (getSeriesByIdRequestDto, logger) => {
  logger.info("Fetching series by id", {
    seriesId: getSeriesByIdRequestDto.id,
  });
  const series = await seriesRepo.getSeriesByIdRepo(getSeriesByIdRequestDto.id);
  if (!series) {
    throw new appError.NotFoundError(
      "Series not found",
      "No series exists for the provided id.",
      "Check the series id and try again.",
    );
  }
  if (getSeriesByIdRequestDto.userRole !== USER_ROLES.ADMIN) {
    if (!series.isActive) {
      throw new appError.NotFoundError(
        "Series not found",
        "No series exists for the provided id.",
        "Check the series id and try again.",
      );
    }

    if (!series.categoryId?.isActive) {
      throw new appError.NotFoundError(
        "Series not found",
        "No series exists for the provided id.",
        "Check the series id and try again.",
      );
    }

    if (!series.categoryId?.brandId?.isActive) {
      throw new appError.NotFoundError(
        "Series not found",
        "No series exists for the provided id.",
        "Check the series id and try again.",
      );
    }
  }

  return new seriesResponseDto.GetSeriesByIdResponseDTO(series);
};

const deleteSeriesService = async (id, logger) => {
  const series = await seriesRepo.getSeriesByIdRepo(id);
  if (!series) {
    throw new appError.NotFoundError(
      "Series not found",
      "No series exists for the provided id.",
      "Check the series id and try again.",
    );
  }

  const products = await productRepo.getProductsBySeriesIdsRepo([id]);
  const productIds = products.map(p => p._id.toString());

  const serviceConditions = [
    { level: "series", levelId: id }
  ];
  if (productIds.length > 0) serviceConditions.push({ level: "product", levelId: { $in: productIds } });

  const services = await serviceRepo.getServicesByConditionsRepo({ $or: serviceConditions, isVariant: false });
  const serviceIds = services.map(s => s._id.toString());

  const imagesToDelete = [series.imageUrl];
  products.forEach(p => p.imageUrl && imagesToDelete.push(p.imageUrl));

  const imageDeletions = imagesToDelete
    .filter(url => url)
    .map(url => deleteImageFromS3(url).catch(err => logger?.error("Error deleting image from S3 against Series deletion", { url, error: err })));
  
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
      await productRepo.deleteProductsBySeriesIdsRepo([id], session);
    }

    await seriesRepo.deleteSeriesRepo(id, session);

    await session.commitTransaction();
    logger?.info("Series and all associated entities deleted successfully", {
      seriesId: id,
      productsCount: productIds.length,
      servicesCount: serviceIds.length,
    });
  } catch (error) {
    await session.abortTransaction();
    logger?.error("Series deletion transaction failed. Rolled back.", { seriesId: id, error });
    throw new appError.InternalServerError(
      "Deletion Failed",
      "An error occurred while deleting the series and its hierarchy. No data was deleted.",
      "Please try again."
    );
  } finally {
    session.endSession();
  }
};

module.exports = {
  createSeriesService,
  updateSeriesService,
  updateSeriesStatusService,
  getAllSeriesService,
  getSeriesByIdService,
  deleteSeriesService,
};
