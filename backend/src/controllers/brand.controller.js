const brandService = require("../services/brand.service");
const appError = require("../utils/errors/errors");
const brandRequestDto = require("../dtos/brand.dtos/req.brand.dto");
const {
  BrandResponseDTO,
  BrandListResponseDTO,
} = require("../dtos/brand.dtos/res.brand.dto");

const createBrandController = async (req, res, next) => {
  try {
    req.logger.info("Create brand request received");
    const body =
      typeof req.body?.body === "string" ? JSON.parse(req.body.body) : req.body;
    const createBrandRequestDto = new brandRequestDto.CreateBrandRequestDTO(
      body,
      req.files,
    );
    createBrandRequestDto.validate();

    req.logger.info("Creating brand data is validated");

    const createBrandResponseDto = await brandService.createBrandService(
      createBrandRequestDto,
      req.logger,
    );

    return res.status(201).json({
      message: "Brand created successfully",
      data: createBrandResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Create brand request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Create brand failed",
        "An unexpected error occurred while creating the brand.",
        "Please try again later.",
      ),
    );
  }
};

const getAllBrandsController = async (req, res, next) => {
  try {
    req.logger.info("Get all brands request received with query parameters", {
      query: req.query,
      userRole: req.userRole,
    });
    const getAllBradsRequestDto = new brandRequestDto.GetAllBrandsRequestDTO(
      req.query,
      req.userRole,
    );
    getAllBradsRequestDto.validate();
    req.logger.info("Get all brands request query parameters are validated");

    const getAllBrandsResponseDto = await brandService.getAllBrandsService(
      getAllBradsRequestDto,
      req.logger,
    );

    return res.status(200).json({
      message: "Brands fetched successfully",
      data: getAllBrandsResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get all brands request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch brands failed",
        "An unexpected error occurred while fetching brands.",
        "Please try again later.",
      ),
    );
  }
};

const getBrandByIdController = async (req, res, next) => {
  try {
    req.logger.info("Get brand by id request received", {
      brandId: req.params.id,
      userRole: req.userRole,
    });
    const getBrandByIdRequestDto = new brandRequestDto.GetBrandByIdRequestDTO(
      req.params,
      req.userRole,
    );
    getBrandByIdRequestDto.validate();
    req.logger.info("Get brand by id request parameters are validated");

    const getBrandByIdResponseDto = await brandService.getBrandByIdService(
      getBrandByIdRequestDto,
      req.logger,
    );

    return res.status(200).json({
      message: "Brand fetched successfully",
      data: getBrandByIdResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get brand by id request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch brand failed",
        "An unexpected error occurred while fetching the brand.",
        "Please try again later.",
      ),
    );
  }
};

const updateBrandController = async (req, res, next) => {
  try {
    req.logger.info("Update brand request received", {
      brandId: req.params.id,
    });
    const updateBrandDto = new brandRequestDto.UpdateBrandRequestDTO(
      req.params,
      req.body,
      req.files,
    );
    updateBrandDto.validate();
    req.logger.info("Updating brand data is validated");
    const updatePayload = updateBrandDto.toUpdatePayload();

    if (Object.keys(updatePayload).length === 1) {
      req.logger.info(
        "No updatable fields provided, skipping update operation",
      );
      return res.status(200).json({
        message: "No changes detected, brand data remains unchanged",
        data: null,
        error: null,
      });
    }
    const updatedBrandResponseDto = await brandService.updateBrandService(
      updatePayload,
      req.logger,
    );

    return res.status(200).json({
      message: "Brand updated successfully",
      data: updatedBrandResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update brand request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update brand failed",
        "An unexpected error occurred while updating the brand.",
        "Please try again later.",
      ),
    );
  }
};

const updateBrandStatusController = async (req, res, next) => {
  try {
    req.logger.info("Update brand status request received", {
      brandId: req.params.id,
    });
    const updateStatusDto = new brandRequestDto.UpdateBrandStatusRequestDTO(
      req.params,
      req.body,
    );
    updateStatusDto.validate();
    const updateBrandStatusResponseDto =
      await brandService.updateBrandStatusService(updateStatusDto, req.logger);
    return res.status(200).json({
      message: "Brand status updated successfully",
      data: updateBrandStatusResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update brand status request failed", {
      error: error.message,
    });
    if (error instanceof appError.AppError) {
      return next(error);
    }
    return next(
      new appError.InternalServerError(
        "Update brand status failed",
        "An unexpected error occurred while updating the brand status.",
        "Please try again later.",
      ),
    );
  }
};

const deleteBrandController = async (req, res, next) => {
  try {
    req.logger.info("Delete brand request received", {
      brandId: req.params.id,
    });

    const deleteBrandRequestDto = new brandRequestDto.DeleteBrandRequestDTO(
      req.params,
    );
    deleteBrandRequestDto.validate();
    req.logger.info("Delete brand request parameters are validated");

    await brandService.deleteBrandService(deleteBrandRequestDto.id, req.logger);

    return res.status(200).json({
      message: "Brand deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    req.logger.error("Delete brand request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Delete brand failed",
        "An unexpected error occurred while deleting the brand.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createBrandController,
  getAllBrandsController,
  getBrandByIdController,
  updateBrandController,
  updateBrandStatusController,
  deleteBrandController,
};
