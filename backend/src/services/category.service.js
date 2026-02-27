const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const categoryRepo = require("../repositories/category.repo");
const categoryResponseDto = require("../dtos/category.dtos/res.category.dto");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const { randomUUID } = require("crypto");

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
      "Category already exists ",
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

  if (updatePayload.name) {
    const categoryWithSameName = await categoryRepo.getCategoryByNameRepo(
      updatePayload.name,
      existingCategory.brandId._id.toString(),
    );
    if (
      categoryWithSameName &&
      categoryWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Category name conflict",
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
    userRole: getAllCategoriesRequestDto.userRole,
    brandId: getAllCategoriesRequestDto.brandId,
  });
  const { categories, totalCategories } =
    await categoryRepo.getAllCategoriesRepo(
      getAllCategoriesRequestDto.page,
      getAllCategoriesRequestDto.limit,
      getAllCategoriesRequestDto.userRole,
      getAllCategoriesRequestDto.brandId,
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
      throw new appError.ForbiddenError(
        "Category is inactive",
        "The requested category is inactive and cannot be accessed.",
        "Contact an administrator for more information.",
      );
    }

    if (!category.brandId?.isActive) {
      throw new appError.ForbiddenError(
        "Category unavailable",
        "The brand of this category is inactive.",
        "Contact an administrator for more information.",
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

  // Delete all associated series and their images
  const seriesRepo = require("../repositories/series.repo");
  const associatedSeries = await seriesRepo.getSeriesByCategoryIdRepo(id);

  if (associatedSeries.length > 0) {
    const seriesImageDeletions = associatedSeries
      .filter((s) => s.imageUrl)
      .map((s) =>
        deleteImageFromS3(s.imageUrl).catch((err) => {
          logger?.error("Error deleting series image", {
            seriesId: s._id.toString(),
            error: err,
          });
        }),
      );

    await Promise.all(seriesImageDeletions);
    await seriesRepo.deleteSeriesByCategoryIdRepo(id);

    logger?.info("Associated series deleted", {
      categoryId: id,
      count: associatedSeries.length,
    });
  }

  // Delete category image
  if (category.imageUrl) {
    try {
      await deleteImageFromS3(category.imageUrl);
    } catch (error) {
      logger?.error("Error deleting category image", { error });
    }
  }

  await categoryRepo.deleteCategoryRepo(id);

  logger?.info("Category deleted successfully", {
    categoryId: category._id.toString(),
  });
};

module.exports = {
  createCategoryService,
  updateCategoryService,
  updateCategoryStatusService,
  getAllCategoriesService,
  getCategoryByIdService,
  deleteCategoryService,
};
