const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const categoryRepo = require("../repositories/category.repo");
const seriesRepo = require("../repositories/series.repo");
const seriesResponseDto = require("../dtos/series.dtos/res.series.dto");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const { randomUUID } = require("crypto");

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

  if (updatePayload.name) {
    const seriesWithSameName = await seriesRepo.getSeriesByNameRepo(
      updatePayload.name,
      existingSeries.categoryId._id.toString(),
    );
    if (
      seriesWithSameName &&
      seriesWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Series name conflict",
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
  });
  const { series, totalSeries } = await seriesRepo.getAllSeriesRepo(
    getAllSeriesRequestDto.page,
    getAllSeriesRequestDto.limit,
    getAllSeriesRequestDto.userRole,
    getAllSeriesRequestDto.categoryId,
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
      throw new appError.ForbiddenError(
        "Series is inactive",
        "The requested series is inactive and cannot be accessed.",
        "Contact an administrator for more information.",
      );
    }

    if (!series.categoryId?.isActive) {
      throw new appError.ForbiddenError(
        "Series unavailable",
        "The category of this series is inactive.",
        "Contact an administrator for more information.",
      );
    }

    if (!series.categoryId?.brandId?.isActive) {
      throw new appError.ForbiddenError(
        "Series unavailable",
        "The brand of this series is inactive.",
        "Contact an administrator for more information.",
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

  await Promise.all([deleteImageFromS3(series.imageUrl)]);

  await seriesRepo.deleteSeriesRepo(id);

  logger?.info("Series deleted successfully", {
    seriesId: series._id.toString(),
  });
};

module.exports = {
  createSeriesService,
  updateSeriesService,
  updateSeriesStatusService,
  getAllSeriesService,
  getSeriesByIdService,
  deleteSeriesService,
};
