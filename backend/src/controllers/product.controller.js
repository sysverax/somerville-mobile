
const productService = require("../services/product.service");
const appError = require("../utils/errors/errors");
const productRequestDto = require("../dtos/product.dtos/req.product.dto");

const createProductController = async (req, res, next) => {
  try {
    req.logger.info("Create product request received");

    const body =
      typeof req.body?.body === "string" ? JSON.parse(req.body.body) : req.body;

    const createProductRequestDto = new productRequestDto.CreateProductRequestDTO(
      body,
      req.files,
    );
    createProductRequestDto.validate();

    req.logger.info("Creating product data is validated");

    const createProductResponseDto = await productService.createProductService(
      createProductRequestDto,
      req.logger,
    );

    return res.status(201).json({
      message: "Product created successfully",
      data: createProductResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Create product request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Create product failed",
        "An unexpected error occurred while creating the product.",
        "Please try again later.",
      ),
    );
  }
};

const updateProductController = async (req, res, next) => {
  try {
    req.logger.info("Update product request received", {
      productId: req.params.id,
    });

    const body =
      typeof req.body?.body === "string" ? JSON.parse(req.body.body) : req.body;
    const updateProductDto = new productRequestDto.UpdateProductRequestDTO(
      req.params,
      body,
      req.files,
    );
    updateProductDto.validate();
    req.logger.info("Updating product data is validated");

    const updatePayload = updateProductDto.toUpdatePayload();

    if (Object.keys(updatePayload).length === 1) {
      req.logger.info(
        "No updatable fields provided, skipping update operation",
      );
      return res.status(200).json({
        message: "No changes detected, product data remains unchanged",
        data: null,
        error: null,
      });
    }

    const updatedProductResponseDto = await productService.updateProductService(
      updatePayload,
      req.logger,
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: updatedProductResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update product request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update product failed",
        "An unexpected error occurred while updating the product.",
        "Please try again later.",
      ),
    );
  }
};

const updateProductStatusController = async (req, res, next) => {
  try {
    req.logger.info("Update product status request received", {
      productId: req.params.id,
    });

    const updateStatusDto =
      new productRequestDto.UpdateProductStatusRequestDTO(req.params, req.body);
    updateStatusDto.validate();

    const updateProductStatusResponseDto =
      await productService.updateProductStatusService(updateStatusDto, req.logger);

    return res.status(200).json({
      message: "Product status updated successfully",
      data: updateProductStatusResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update product status request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update product status failed",
        "An unexpected error occurred while updating the product status.",
        "Please try again later.",
      ),
    );
  }
};

const getAllProductsController = async (req, res, next) => {
  try {
    req.logger.info(
      "Get all products request received with query parameters",
      {
        query: req.query,
        userRole: req.userRole,
      },
    );

    const getAllProductsRequestDto =
      new productRequestDto.GetAllProductsRequestDTO(req.query, req.userRole);
    getAllProductsRequestDto.validate();
    req.logger.info(
      "Get all products request query parameters are validated",
    );

    const getAllProductsResponseDto =
      await productService.getAllProductsService(
        getAllProductsRequestDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Products fetched successfully",
      data: getAllProductsResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get all products request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch products failed",
        "An unexpected error occurred while fetching products.",
        "Please try again later.",
      ),
    );
  }
};

const getProductByIdController = async (req, res, next) => {
  try {
    req.logger.info("Get product by id request received", {
      productId: req.params.id,
      userRole: req.userRole,
    });

    const getProductByIdRequestDto =
      new productRequestDto.GetProductByIdRequestDTO(req.params, req.userRole);
    getProductByIdRequestDto.validate();
    req.logger.info("Get product by id request parameters are validated");

    const getProductByIdResponseDto =
      await productService.getProductByIdService(
        getProductByIdRequestDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Product fetched successfully",
      data: getProductByIdResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get product by id request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch product failed",
        "An unexpected error occurred while fetching the product.",
        "Please try again later.",
      ),
    );
  }
};

const deleteProductController = async (req, res, next) => {
  try {
    req.logger.info("Delete product request received", {
      productId: req.params.id,
    });

    const deleteProductRequestDto =
      new productRequestDto.DeleteProductRequestDTO(req.params);
    deleteProductRequestDto.validate();
    req.logger.info("Delete product request parameters are validated");

    await productService.deleteProductService(
      deleteProductRequestDto.id,
      req.logger,
    );

    return res.status(200).json({
      message: "Product deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    req.logger.error("Delete product request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Delete product failed",
        "An unexpected error occurred while deleting the product.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createProductController,
  updateProductController,
  updateProductStatusController,
  getAllProductsController,
  getProductByIdController,
  deleteProductController,
};

