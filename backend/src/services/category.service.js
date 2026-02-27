const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const categoryRepo = require("../repositories/category.repo");
const categoryResponseDto = require("../dtos/category.dtos/res.category.dto");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const { randomUUID } = require("crypto");

const createCategoryService = async (createCategoryRequestDto, logger) => {
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
      existingCategory.brandId.toString(),
    );
    if (
      categoryWithSameName &&
      categoryWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Category with this name already exists for the selected brand",
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
  if (
    getCategoryByIdRequestDto.userRole !== USER_ROLES.ADMIN &&
    !category.isActive
  ) {
    throw new appError.ForbiddenError(
      "Category is inactive",
      "The requested category is inactive and cannot be accessed.",
      "Contact an administrator for more information.",
    );
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

  await Promise.all([deleteImageFromS3(category.iconImage)]);

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
