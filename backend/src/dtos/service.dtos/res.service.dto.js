class ServiceResponseDTO {
  constructor(service) {
    this.id = service._id?.toString() || service.id || null;
    this.name = service.name;
    this.description = service.description || "";
    this.basePrice = service.basePrice;
    this.estimatedTime = service.estimatedTime;
    this.isActive = Boolean(service.isActive);
    this.level = service.level || null;
    this.levelId = service.levelId?.toString() || null;
    this.isParent = Boolean(service.isParent);
    this.isVariant = Boolean(service.isVariant);
    this.parentServiceId = service.parentServiceId?.toString() || null;
    this.createdAt = service.createdAt || null;
    this.updatedAt = service.updatedAt || null;
  }
}

class CreateServiceResponseDTO {
  constructor(parentService, variants, linkedProductsCount) {
    this.service = new ServiceResponseDTO(parentService);
    this.variants = variants
      ? variants.map((v) => new ServiceResponseDTO(v))
      : [];
    this.linkedProductsCount = linkedProductsCount || 0;
  }
}

module.exports = {
  ServiceResponseDTO,
  CreateServiceResponseDTO,
};
