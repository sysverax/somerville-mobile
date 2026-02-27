const categoryService = require("../services/category.service");
const appError = require("../utils/errors/errors");
const categoryRequestDto = require("../dtos/category.dtos/req.category.dto");

const createCategoryController = async (req, res, next) => {
  try {
    req.logger.info("Create category request received");
    const body =
      typeof req.body?.body === "string" ? JSON.parse(req.body.body) : req.body;
    const createCategoryRequestDto =
      new categoryRequestDto.CreateCategoryRequestDTO(body, req.files);
    createCategoryRequestDto.validate();

    req.logger.info("Creating category data is validated");

    const createCategoryResponseDto =
      await categoryService.createCategoryService(
        createCategoryRequestDto,
        req.logger,
      );

    return res.status(201).json({
      message: "Category created successfully",
      data: createCategoryResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Create category request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Create category failed",
        "An unexpected error occurred while creating the category.",
        "Please try again later.",
      ),
    );
  }
};

const updateCategoryController = async (req, res, next) => {
  try {
    req.logger.info("Update category request received", {
      categoryId: req.params.id,
    });
    const updateCategoryDto = new categoryRequestDto.UpdateCategoryRequestDTO(
      req.params,
      req.body,
      req.files,
    );
    updateCategoryDto.validate();
    req.logger.info("Updating category data is validated");
    const updatePayload = updateCategoryDto.toUpdatePayload();

    if (Object.keys(updatePayload).length === 1) {
      req.logger.info(
        "No updatable fields provided, skipping update operation",
      );
      return res.status(200).json({
        message: "No changes detected, category data remains unchanged",
        data: null,
        error: null,
      });
    }

    const updatedCategoryResponseDto =
      await categoryService.updateCategoryService(updatePayload, req.logger);

    return res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategoryResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update category request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update category failed",
        "An unexpected error occurred while updating the category.",
        "Please try again later.",
      ),
    );
  }
};

const updateCategoryStatusController = async (req, res, next) => {
  try {
    req.logger.info("Update category status request received", {
      categoryId: req.params.id,
    });
    const updateStatusDto =
      new categoryRequestDto.UpdateCategoryStatusRequestDTO(
        req.params,
        req.body,
      );
    updateStatusDto.validate();

    const updateCategoryStatusResponseDto =
      await categoryService.updateCategoryStatusService(
        updateStatusDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Category status updated successfully",
      data: updateCategoryStatusResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update category status request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update category status failed",
        "An unexpected error occurred while updating the category status.",
        "Please try again later.",
      ),
    );
  }
};

const getAllCategoriesController = async (req, res, next) => {
  try {
    req.logger.info(
      "Get all categories request received with query parameters",
      {
        query: req.query,
        userRole: req.userRole,
      },
    );
    const getAllCategoriesRequestDto =
      new categoryRequestDto.GetAllCategoriesRequestDTO(
        req.query,
        req.userRole,
      );
    getAllCategoriesRequestDto.validate();
    req.logger.info(
      "Get all categories request query parameters are validated",
    );

    const getAllCategoriesResponseDto =
      await categoryService.getAllCategoriesService(
        getAllCategoriesRequestDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Categories fetched successfully",
      data: getAllCategoriesResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get all categories request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch categories failed",
        "An unexpected error occurred while fetching categories.",
        "Please try again later.",
      ),
    );
  }
};

const getCategoryByIdController = async (req, res, next) => {
  try {
    req.logger.info("Get category by id request received", {
      categoryId: req.params.id,
      userRole: req.userRole,
    });
    const getCategoryByIdRequestDto =
      new categoryRequestDto.GetCategoryByIdRequestDTO(
        req.params,
        req.userRole,
      );
    getCategoryByIdRequestDto.validate();
    req.logger.info("Get category by id request parameters are validated");

    const getCategoryByIdResponseDto =
      await categoryService.getCategoryByIdService(
        getCategoryByIdRequestDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Category fetched successfully",
      data: getCategoryByIdResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get category by id request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch category failed",
        "An unexpected error occurred while fetching the category.",
        "Please try again later.",
      ),
    );
  }
};

const deleteCategoryController = async (req, res, next) => {
  try {
    req.logger.info("Delete category request received", {
      categoryId: req.params.id,
    });

    const deleteCategoryRequestDto =
      new categoryRequestDto.DeleteCategoryRequestDTO(req.params);
    deleteCategoryRequestDto.validate();
    req.logger.info("Delete category request parameters are validated");

    await categoryService.deleteCategoryService(
      deleteCategoryRequestDto.id,
      req.logger,
    );

    return res.status(200).json({
      message: "Category deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    req.logger.error("Delete category request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Delete category failed",
        "An unexpected error occurred while deleting the category.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createCategoryController,
  updateCategoryController,
  updateCategoryStatusController,
  getAllCategoriesController,
  getCategoryByIdController,
  deleteCategoryController,
};
