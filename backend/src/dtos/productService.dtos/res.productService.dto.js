class ProductServiceResponseDTO {
  constructor(productService) {
    const service = productService.serviceId;
    this.id = productService._id?.toString() || productService.id || null;
    this.serviceId = service?._id?.toString() || productService.serviceId?.toString() || null;
    this.productId = productService.productId?._id?.toString() || productService.productId?.toString() || null;
    
    this.price = productService.price;
    this.estimatedTime = productService.estimatedTime;
    this.isActive = Boolean(productService.isActive);
    this.isDefault = Boolean(productService.isDefault);
    
    if (service && typeof service === "object") {
      this.name = service.name || null;
      this.description = service.description || null;
      this.basePrice = service.basePrice || 0;
      this.baseEstimatedTime = service.estimatedTime || 0;
      this.level = service.level || null;
      this.isVariant = Boolean(service.isVariant);
    }

    this.createdAt = productService.createdAt || null;
    this.updatedAt = productService.updatedAt || null;
  }
}

class ProductsForServiceResponseDTO {
  constructor(productServices, totalProducts, currentPage, pageSize) {
    this.products = productServices.map((ps) => ({
      productServiceId: ps._id.toString(),
      serviceId: ps.serviceId._id ? ps.serviceId._id.toString() : ps.serviceId.toString(),
      price: ps.price,
      estimatedTime: ps.estimatedTime,
      isDefault: ps.isDefault,
      isActive: ps.isActive,
      product: ps.productId ? {
        id: ps.productId._id.toString(),
        name: ps.productId.name,
        isActive: ps.productId.isActive,
        brand: ps.productId.seriesId?.categoryId?.brandId ? { name: ps.productId.seriesId.categoryId.brandId.name } : null,
        category: ps.productId.seriesId?.categoryId ? { name: ps.productId.seriesId.categoryId.name } : null,
      } : null
    }));
    this.totalProducts = totalProducts;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
  }
}

class GetServicesForProductResponseDTO {
  constructor(productServices) {
    const groupedMap = new Map();

    productServices.forEach((ps) => {
      const service = ps.serviceId;
      if (!service || typeof service !== "object") return;

      const parent = service.parentServiceId;

      if (service.isVariant && parent && typeof parent === "object") {
        const parentId = parent._id.toString();
        if (!groupedMap.has(parentId)) {
          groupedMap.set(parentId, {
            id: parentId,
            name: parent.name,
            description: parent.description,
            isParent: true,
            level: parent.level,
            variants: [],
          });
        }
        groupedMap.get(parentId).variants.push(new ProductServiceResponseDTO(ps));
      } else {
        const serviceId = service._id.toString();
        groupedMap.set(serviceId, new ProductServiceResponseDTO(ps));
      }
    });

    this.services = Array.from(groupedMap.values());
  }
}

class UpdateProductServiceStatusResponseDTO {
  constructor(productService) {
    this.id = productService._id?.toString() || productService.id || null;
    this.isActive = Boolean(productService.isActive);
  }
}

class UpdateProductServiceResponseDTO {
  constructor(productService) {
    this.id = productService._id?.toString() || productService.id || null;
    this.price = productService.price;
    this.estimatedTime = productService.estimatedTime;
    this.isActive = Boolean(productService.isActive);
  }
}

module.exports = {
  ProductServiceResponseDTO,
  ProductsForServiceResponseDTO,
  GetServicesForProductResponseDTO,
  UpdateProductServiceStatusResponseDTO,
  UpdateProductServiceResponseDTO,
};
