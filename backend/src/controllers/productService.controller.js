const appError = require("../utils/errors/errors");
const { 
  UpdateProductServiceRequestDTO, 
  UpdateProductServiceStatusRequestDTO,
  GetServicesForProductRequestDTO,
  GetProductsForServiceRequestDTO,
  ResetToDefaultProductServiceRequestDTO,
} = require("../dtos/productService.dtos/req.productService.dto");
const serviceService = require("../services/productService.service");

const updateProductServiceController = async (req, res, next) => {
  const logger = req.logger;
  try {
    logger.info("Update product service request received", {
      productServiceId: req.params.id,
    });
    const updateProductServiceRequestDTO = new UpdateProductServiceRequestDTO(
      req.params,
      req.body,
    );
    updateProductServiceRequestDTO.validate();
    logger.info("Updating product service data is validated");

    const updatedProductService =
      await serviceService.updateProductServiceService(
        updateProductServiceRequestDTO,
        logger,
      );

    return res.status(200).json({
      message: "Product service updated successfully",
      data: updatedProductService,
      error: null,
    });
  } catch (error) {
    logger.error("Update product service request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update product service failed",
        "An unexpected error occurred while updating the product service.",
        "Please try again later.",
      ),
    );
  }
};

const updateProductServiceStatusController = async (req, res, next) => {
  const logger = req.logger;
  try {
    logger.info("Update product service status request received", {
      productServiceId: req.params.id,
    });
    const updateProductServiceStatusRequestDTO =
      new UpdateProductServiceStatusRequestDTO(req.params, req.body);
    updateProductServiceStatusRequestDTO.validate();

    const updatedProductService =
      await serviceService.updateProductServiceStatusService(
        updateProductServiceStatusRequestDTO,
        logger,
      );

    return res.status(200).json({
      message: "Product service status updated successfully",
      data: updatedProductService,
      error: null,
    });
  } catch (error) {
    logger.error("Update product service status request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update product service status failed",
        "An unexpected error occurred while updating the product service status.",
        "Please try again later.",
      ),
    );
  }
};

const getServicesForProductController = async (req, res, next) => {
  try {
    const userRole = req.userRole;
    req.logger.info("Get services for product request received", { params: req.params, userRole });

    const getServicesForProductRequestDto = new GetServicesForProductRequestDTO(req.params, userRole);
    getServicesForProductRequestDto.validate();

    const response = await serviceService.getServicesForProductService(getServicesForProductRequestDto);

    return res.status(200).json({
      message: "Product services fetched successfully",
      data: response,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get services for product failed", { error: error.message });
    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch product services failed",
        "An unexpected error occurred while fetching the product services.",
        "Please try again later.",
      ),
    );
  }
};

const getProductsForServiceController = async (req, res, next) => {
  try {
    req.logger.info("Get products for service request received", { 
      params: req.params, 
      query: req.query 
    });

    const getProductsForServiceRequestDto = new GetProductsForServiceRequestDTO(req.params, req.query);
    getProductsForServiceRequestDto.validate();

    const response = await serviceService.getProductsForServiceService(getProductsForServiceRequestDto);

    return res.status(200).json({
      message: "Products for service fetched successfully",
      data: response,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get products for service failed", { error: error.message });
    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch products for service failed",
        "An unexpected error occurred while fetching products for the service.",
        "Please try again later.",
      ),
    );
  }
};

const resetToDefaultProductServiceController = async (req, res, next) => {
  const logger = req.logger;
  try {
    logger.info("Reset product service to default request received", {
      productServiceId: req.params.id,
    });
    const resetToDefaultRequestDto = new ResetToDefaultProductServiceRequestDTO(
      req.params,
    );
    resetToDefaultRequestDto.validate();

    const response = await serviceService.resetToDefaultProductServiceService(
      resetToDefaultRequestDto,
      logger,
    );

    return res.status(200).json({
      message: "Product service reset to default successfully",
      data: response,
      error: null,
    });
  } catch (error) {
    logger.error("Reset product service to default failed", {
      error: error.message,
    });
    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Reset product service to default failed",
        "An unexpected error occurred while resetting the product service to default.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  updateProductServiceController,
  updateProductServiceStatusController,
  getServicesForProductController,
  getProductsForServiceController,
  resetToDefaultProductServiceController,
};
