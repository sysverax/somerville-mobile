const mongoose = require("mongoose");
const appError = require("../utils/errors/errors");
const serviceRepo = require("../repositories/service.repo");
const productServiceRepo = require("../repositories/productService.repo");
const productRepo = require("../repositories/product.repo");
const { 
  ProductsForServiceResponseDTO,
  GetServicesForProductResponseDTO,
  UpdateProductServiceResponseDTO,
  UpdateProductServiceStatusResponseDTO
} = require("../dtos/productService.dtos/res.productService.dto");
const { USER_ROLES } = require("../utils/constants/user.constants");

const updateProductServiceService = async (
  updateProductServiceRequestDto,
  logger,
) => {
  const existingProductService = await productServiceRepo.getProductServiceByIdRepo(
    updateProductServiceRequestDto.id,
  );
  if (!existingProductService) {
    throw new appError.NotFoundError(
      "Product service not found",
      "No product service exists for the provided id.",
      "Check the product service id and try again.",
    );
  }

  const updatePayload = {};
  if (updateProductServiceRequestDto.price !== undefined) {
    updatePayload.price = updateProductServiceRequestDto.price;
    updatePayload.isDefault = false;
  }
  if (updateProductServiceRequestDto.estimatedTime !== undefined) {
    updatePayload.estimatedTime = updateProductServiceRequestDto.estimatedTime;
    updatePayload.isDefault = false;
  }
  if (updateProductServiceRequestDto.isActive !== undefined) {
    updatePayload.isActive = updateProductServiceRequestDto.isActive;
  }

  const updatedProductService = await productServiceRepo.updateProductServiceRepo(
    updateProductServiceRequestDto.id,
    updatePayload,
  );

  logger.info("Product service updated successfully", {
    productServiceId: updatedProductService._id.toString(),
  });

  return new UpdateProductServiceResponseDTO(
    updatedProductService,
  );
};

const updateProductServiceStatusService = async (
  updateProductServiceStatusRequestDto,
  logger,
) => {
  const existingProductService = await productServiceRepo.getProductServiceByIdRepo(
    updateProductServiceStatusRequestDto.id,
  );
  if (!existingProductService) {
    throw new appError.NotFoundError(
      "Product service not found",
      "No product service exists for the provided id.",
      "Check the product service id and try again.",
    );
  }

  const updatedProductService =
    await productServiceRepo.updateProductServiceStatusRepo(
      updateProductServiceStatusRequestDto.id,
      updateProductServiceStatusRequestDto.isActive,
    );

  logger.info("Product service status updated successfully", {
    productServiceId: updatedProductService._id.toString(),
    isActive: updatedProductService.isActive,
  });

  return new UpdateProductServiceStatusResponseDTO(
    updatedProductService,
  );
};

const getServicesForProductService = async (
  getServicesForProductRequestDto,
) => {
  const { productId, userRole } = getServicesForProductRequestDto;

  const product = await productRepo.getProductByIdRepo(productId);
  if (!product) {
    throw new appError.NotFoundError(
      "Product not found",
      "No product exists for the provided product ID.",
      "Check the product ID and try again.",
    );
  }

  let productServices = await productServiceRepo.getProductServicesByProductIdRepo(productId);

  if (userRole !== USER_ROLES.ADMIN) {
    productServices = productServices.filter((ps) => {
      if (!ps.isActive) return false;

      const service = ps.serviceId;
      if (!service) return false;

      if (!service.isActive) return false;

      if (service.isVariant && service.parentServiceId) {
        return service.parentServiceId.isActive;
      }

      return true;
    });
  }

  return new GetServicesForProductResponseDTO(productServices);
};

const getProductsForServiceService = async (
  getProductsForServiceRequestDto,
) => {
  const { id: serviceId, page, limit } = getProductsForServiceRequestDto;
  const service = await serviceRepo.getServiceByIdRepo(serviceId);
  if (!service) {
    throw new appError.NotFoundError(
      "Service not found",
      "The service with the provided ID does not exist.",
      "Provide a valid service ID and try again.",
    );
  }

  let serviceIds = [serviceId];

  if (service.isParent) {
    const variants = await serviceRepo.getVariantsByParentServiceIdRepo(serviceId);
    const variantIds = variants.map((v) => v._id.toString());
    serviceIds = [...serviceIds, ...variantIds];
  }

  const { productServices, total } = await productServiceRepo.getProductsByServiceIdRepo(serviceIds, page, limit);
  return new ProductsForServiceResponseDTO(productServices, total, page, limit);
};

const resetToDefaultProductServiceService = async (
  resetToDefaultRequestDto,
  logger,
) => {
  const existingProductService = await productServiceRepo.getProductServiceByIdRepo(
    resetToDefaultRequestDto.id,
  );
  if (!existingProductService) {
    throw new appError.NotFoundError(
      "Product service not found",
      "No product service exists for the provided id.",
      "Check the product service id and try again.",
    );
  }

  const service = existingProductService.serviceId;
  if (!service) {
    throw new appError.NotFoundError(
      "Parent service not found",
      "The service associated with this product service could not be found.",
      "Check the database consistency and try again.",
    );
  }

  const updatePayload = {
    price: service.basePrice,
    estimatedTime: service.estimatedTime,
    isDefault: true,
  };

  const updatedProductService = await productServiceRepo.updateProductServiceRepo(
    resetToDefaultRequestDto.id,
    updatePayload,
  );

  logger.info("Product service reset to default successfully", {
    productServiceId: updatedProductService._id.toString(),
  });

  return new UpdateProductServiceResponseDTO(updatedProductService);
};

module.exports = {
  updateProductServiceService,
  updateProductServiceStatusService,
  getServicesForProductService,
  getProductsForServiceService,
  resetToDefaultProductServiceService,
};
