class CategoryResponseDTO {
  constructor(category) {
    this.id = category._id?.toString() || category.id || null;
    this.brandId = category.brandId?.toString() || null;
    this.name = category.name;
    this.description = category.description || "";
    this.imageUrl = category.imageUrl || null;
    this.isActive = Boolean(category.isActive);
    this.createdAt = category.createdAt || null;
    this.updatedAt = category.updatedAt || null;
  }
}

class CreateCategoryResponseDTO extends CategoryResponseDTO {
  constructor(category) {
    super(category);
  }
}

class UpdateCategoryResponseDTO extends CategoryResponseDTO {
  constructor(category) {
    super(category);
  }
}

class UpdateCategoryStatusResponseDTO extends CategoryResponseDTO {
  constructor(category) {
    super(category);
  }
}

module.exports = {
  CategoryResponseDTO,
  CreateCategoryResponseDTO,
  UpdateCategoryResponseDTO,
  UpdateCategoryStatusResponseDTO,
};
