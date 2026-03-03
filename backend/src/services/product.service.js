
const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const seriesRepo = require("../repositories/series.repo");
const productRepo = require("../repositories/product.repo");
const productResponseDto = require("../dtos/product.dtos/res.product.dto");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const { randomUUID } = require("crypto");

const createProductService = async (createProductRequestDto, logger) => {
  const series = await seriesRepo.getSeriesByIdRepo(
    createProductRequestDto.seriesId,
  );
  if (!series) {
    throw new appError.NotFoundError(
      "Series not found",
      "No series exists for the provided series id.",
      "Check the series id and try again.",
    );
  }

  const existingProduct = await productRepo.getProductByNameRepo(
    createProductRequestDto.name,
    createProductRequestDto.seriesId,
  );
  if (existingProduct) {
    throw new appError.ConflictError(
      "Product already exists",
      "A product with this name already exists in this series.",
      "Use a different product name.",
    );
  }

  const [iconImageUrl] = await Promise.all([
    uploadFileToS3({
      file: createProductRequestDto.iconImageFile,
      folder: `products/${createProductRequestDto.name}-${randomUUID()}`,
    }).then((result) => result.url),
  ]);

  const product = await productRepo.createProductRepo({
    name: createProductRequestDto.name,
    description: createProductRequestDto.description?.trim() || "",
    imageUrl: iconImageUrl,
    isActive: createProductRequestDto.isActive,
    seriesId: createProductRequestDto.seriesId,
  });

  logger.info("Product created successfully", {
    productId: product._id.toString(),
  });

  return new productResponseDto.CreateProductResponseDTO(product);
};

const updateProductService = async (updatePayload, logger) => {
  const existingProduct = await productRepo.getProductByIdRepo(updatePayload.id);
  if (!existingProduct) {
    throw new appError.NotFoundError(
      "Product not found",
      "No product exists for the provided id.",
      "Check the product id and try again.",
    );
  }

  if (updatePayload.seriesId) {
    const series = await seriesRepo.getSeriesByIdRepo(updatePayload.seriesId);
    if (!series) {
      throw new appError.NotFoundError(
        "Series not found",
        "No series exists for the provided series id.",
        "Check the series id and try again.",
      );
    }
  }

  const targetSeriesId =
    updatePayload.seriesId || existingProduct.seriesId._id.toString();

  if (updatePayload.name) {
    const productWithSameName = await productRepo.getProductByNameRepo(
      updatePayload.name,
      targetSeriesId,
    );
    if (
      productWithSameName &&
      productWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Product with this name already exists for the selected series",
        "Another product with the same name already exists in this series.",
        "Use a different product name.",
      );
    }
  }

  if (updatePayload.iconImageFile) {
    const uploadedIcon = await uploadFileToS3({
      file: updatePayload.iconImageFile,
      folder: `products/${existingProduct.name}-${randomUUID()}`,
    });
    updatePayload.imageUrl = uploadedIcon.url;
  }

  if (updatePayload.seriesId) {
    updatePayload.seriesId = new mongoose.Types.ObjectId(updatePayload.seriesId);
  }

  const updatedProduct = await productRepo.updateProductRepo(
    updatePayload.id,
    updatePayload,
  );

  logger.info("Product updated successfully", {
    productId: updatedProduct._id.toString(),
  });

  if (updatePayload.iconImageFile && existingProduct.imageUrl) {
    try {
      await deleteImageFromS3(existingProduct.imageUrl);
    } catch (error) {
      logger.error("Error deleting old product image", { error });
    }
  }

  return new productResponseDto.UpdateProductResponseDTO(updatedProduct);
};

const updateProductStatusService = async (updateStatusDto, logger) => {
  const existingProduct = await productRepo.getProductByIdRepo(
    updateStatusDto.id,
  );
  if (!existingProduct) {
    throw new appError.NotFoundError(
      "Product not found",
      "No product exists for the provided id.",
      "Check the product id and try again.",
    );
  }

  const updatedProduct = await productRepo.updateProductStatusRepo(
    updateStatusDto.id,
    updateStatusDto.isActive,
  );

  logger.info("Product status updated successfully", {
    productId: updatedProduct._id.toString(),
  });

  return new productResponseDto.UpdateProductStatusResponseDTO(updatedProduct);
};

const getAllProductsService = async (getAllProductsRequestDto, logger) => {
  logger.info("Fetching products with pagination", {
    page: getAllProductsRequestDto.page,
    limit: getAllProductsRequestDto.limit,
    userRole: getAllProductsRequestDto.userRole,
    seriesId: getAllProductsRequestDto.seriesId,
    categoryId: getAllProductsRequestDto.categoryId,
    brandId: getAllProductsRequestDto.brandId,
  });

  const { products, totalProducts } = await productRepo.getAllProductsRepo(
    getAllProductsRequestDto.page,
    getAllProductsRequestDto.limit,
    getAllProductsRequestDto.userRole,
    getAllProductsRequestDto.seriesId,
    getAllProductsRequestDto.categoryId,
    getAllProductsRequestDto.brandId,
  );

  return new productResponseDto.GetAllProductsResponseDTO(
    products,
    totalProducts,
    getAllProductsRequestDto.page,
    getAllProductsRequestDto.limit,
  );
};

const getProductByIdService = async (getProductByIdRequestDto, logger) => {
  logger.info("Fetching product by id", {
    productId: getProductByIdRequestDto.id,
  });

  const product = await productRepo.getProductByIdRepo(
    getProductByIdRequestDto.id,
  );

  if (!product) {
    throw new appError.NotFoundError(
      "Product not found",
      "No product exists for the provided id.",
      "Check the product id and try again.",
    );
  }

  if (getProductByIdRequestDto.userRole !== USER_ROLES.ADMIN) {
    if (!product.isActive) {
      throw new appError.NotFoundError(
        "Product not found",
        "No product exists for the provided id.",
        "Check the product id and try again.",
      );
    }

    if (!product.seriesId?.isActive) {
      throw new appError.NotFoundError(
        "Product not found",
        "No product exists for the provided id.",
        "Check the product id and try again.",
      );
    }

    if (!product.seriesId?.categoryId?.isActive) {
      throw new appError.NotFoundError(
        "Product not found",
        "No product exists for the provided id.",
        "Check the product id and try again.",
      );
    }

    if (!product.seriesId?.categoryId?.brandId?.isActive) {
      throw new appError.NotFoundError(
        "Product not found",
        "No product exists for the provided id.",
        "Check the product id and try again.",
      );
    }
  }

  return new productResponseDto.GetProductByIdResponseDTO(product);
};

const deleteProductService = async (id, logger) => {
  const product = await productRepo.getProductByIdRepo(id);
  if (!product) {
    throw new appError.NotFoundError(
      "Product not found",
      "No product exists for the provided id.",
      "Check the product id and try again.",
    );
  }

  if (product.imageUrl) {
    await deleteImageFromS3(product.imageUrl).catch((error) => {
      logger?.error("Error deleting product image", { error });
    });
  }

  await productRepo.deleteProductRepo(id);

  logger?.info("Product deleted successfully", {
    productId: product._id.toString(),
  });
};

module.exports = {
  createProductService,
  updateProductService,
  updateProductStatusService,
  getAllProductsService,
  getProductByIdService,
  deleteProductService,
};

