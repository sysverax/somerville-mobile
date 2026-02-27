class CategoryResponseDTO {
  constructor(category) {
    this.id = category._id?.toString() || category.id || null;
    this.brandId =
      category.brandId?._id?.toString() ||
      category.brandId?.toString() ||
      null;
    this.brandName = category.brandId?.name || null;
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

class CategoryWithBrandResponseDTO extends CategoryResponseDTO {
  constructor(category) {
    super(category);
    this.brandName = category.brandId?.name || null; 
  }
}


class GetAllCategoriesResponseDTO {
  constructor(categories, totalCategories, currentPage, pageSize) {
    this.categories = categories.map((category) => new CategoryResponseDTO(category));
    this.totalCategories = totalCategories;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
  }
}

class GetCategoryByIdResponseDTO extends CategoryResponseDTO {
  constructor(category) {
    super(category);
  }
}

module.exports = {
  CategoryResponseDTO,
  CreateCategoryResponseDTO,
  UpdateCategoryResponseDTO,
  UpdateCategoryStatusResponseDTO,
  GetAllCategoriesResponseDTO,
  GetCategoryByIdResponseDTO,
};
