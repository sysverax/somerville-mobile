class ProductResponseDTO {
  constructor(product) {
    this.id = product._id?.toString() || product.id || null;
    this.name = product.name;
    this.description = product.description || "";
    this.imageUrl = product.imageUrl || null;
    this.isActive = Boolean(product.isActive);
        this.series = {
      id:
        product.seriesId?._id?.toString() ||
        product.seriesId?.id ||
        product.seriesId?.toString() ||
        null,
      name: product.seriesId?.name || null,
      isActive:
        product.seriesId?.isActive != null
          ? Boolean(product.seriesId.isActive)
          : null,
    };

    this.category = {
      id:
        product.seriesId?.categoryId?._id?.toString() ||
        product.seriesId?.categoryId?.id ||
        product.seriesId?.categoryId?.toString() ||
        null,
      name: product.seriesId?.categoryId?.name || null,
      isActive:
        product.seriesId?.categoryId?.isActive != null
          ? Boolean(product.seriesId.categoryId.isActive)
          : null,
    };

    this.brand = {
      id:
        product.seriesId?.categoryId?.brandId?._id?.toString() ||
        product.seriesId?.categoryId?.brandId?.id ||
        product.seriesId?.categoryId?.brandId?.toString() ||
        null,
      name: product.seriesId?.categoryId?.brandId?.name || null,
      isActive:
        product.seriesId?.categoryId?.brandId?.isActive != null
          ? Boolean(product.seriesId.categoryId.brandId.isActive)
          : null,
    };
    this.createdAt = product.createdAt || null;
    this.updatedAt = product.updatedAt || null;
    this.activeServiceCount = product.activeServiceCount || 0;
    this.totalServiceCount = product.totalServiceCount || 0;
  }
}

class SimpleProductResponseDTO {
  constructor(product) {
    this.id = product._id?.toString() || product.id || null;
    this.name = product.name;
    this.description = product.description || "";
    this.imageUrl = product.imageUrl || null;
    this.isActive = Boolean(product.isActive);
    this.seriesId =
      product.seriesId?._id?.toString() ||
      product.seriesId?.id ||
      product.seriesId?.toString() ||
      null;
    this.createdAt = product.createdAt || null;
    this.updatedAt = product.updatedAt || null;
  }
}

class CreateProductResponseDTO extends SimpleProductResponseDTO {
  constructor(product) {
    super(product);
  }
}

class UpdateProductResponseDTO extends SimpleProductResponseDTO {
  constructor(product) {
    super(product);
  }
}

class UpdateProductStatusResponseDTO {
  constructor(product) {
    this.id = product._id?.toString() || product.id || null;
    this.isActive = Boolean(product.isActive);
  }
}

class GetAllProductsResponseDTO {
  constructor(products, totalProducts, currentPage, pageSize) {
    this.products = products.map((p) => new ProductResponseDTO(p));
    this.totalProducts = totalProducts;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
  }
}

class GetProductByIdResponseDTO extends ProductResponseDTO {
  constructor(product) {
    super(product);
  }
}

module.exports = {
  ProductResponseDTO,
  CreateProductResponseDTO,
  UpdateProductResponseDTO,
  UpdateProductStatusResponseDTO,
  GetAllProductsResponseDTO,
  GetProductByIdResponseDTO,
};
