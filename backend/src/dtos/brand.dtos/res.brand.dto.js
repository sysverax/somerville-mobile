class BrandResponseDTO {
  constructor(brand) {
    this.id = brand._id?.toString() || brand.id || null;
    this.name = brand.name;
    this.description = brand.description || "";
    this.iconImageUrl = brand.iconImageUrl || null;
    this.bannerImageUrl = brand.bannerImageUrl || null;
    this.isActive = Boolean(brand.isActive);
    this.createdAt = brand.createdAt || null;
    this.updatedAt = brand.updatedAt || null;
  }
}

class CreateBrandResponseDTO extends BrandResponseDTO {
  constructor(brand) {
    super(brand);
  }
}

class UpdateBrandResponseDTO extends BrandResponseDTO {
  constructor(brand) {
    super(brand);
  }
}

class UpdateBrandStatusResponseDTO extends BrandResponseDTO {
  constructor(brand) {
    super(brand);
  }
}

class GetAllBrandsResponseDTO {
  constructor(brands, totalBrands, currentPage, pageSize) {
    this.brands = brands.map((brand) => new BrandResponseDTO(brand));
    this.totalBrands = totalBrands;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
  }
}

class GetBrandByIdResponseDTO extends BrandResponseDTO {
  constructor(brand) {
    super(brand);
  }
}

module.exports = {
  BrandResponseDTO,
  CreateBrandResponseDTO,
  UpdateBrandResponseDTO,
  UpdateBrandStatusResponseDTO,
  GetAllBrandsResponseDTO,
  GetBrandByIdResponseDTO,
};
