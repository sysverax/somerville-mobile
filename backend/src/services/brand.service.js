const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const { USER_ROLES } = require("../utils/constants/user.constants");
const brandRepo = require("../repositories/brand.repo");
const { uploadFileToS3, deleteImageFromS3 } = require("../utils/aws/s3Utils");
const brandResponseDto = require("../dtos/brand.dtos/res.brand.dto");

const createBrandService = async (createBrandRequestDto, logger) => {
  const existingBrand = await brandRepo.getBrandByNameRepo(
    createBrandRequestDto.name,
  );
  if (existingBrand) {
    throw new appError.ConflictError(
      "Brand already exists ",
      "A brand with this name already exists.",
      "Use a different brand name.",
    );
  }

  const [iconImageUrl, bannerImageUrl] = await Promise.all([
    uploadFileToS3({
      file: createBrandRequestDto.iconImageFile,
      folder: `brands/${createBrandRequestDto.name}/icon`,
    }).then((result) => result.url),
    uploadFileToS3({
      file: createBrandRequestDto.bannerImageFile,
      folder: `brands/${createBrandRequestDto.name}/banner`,
    }).then((result) => result.url),
  ]);

  const brand = await brandRepo.createBrandRepo({
    name: createBrandRequestDto.name,
    description: createBrandRequestDto.description?.trim() || "",
    iconImageUrl,
    bannerImageUrl,
    isActive: createBrandRequestDto.isActive,
  });

  logger.info("Brand created successfully", {
    brandId: brand._id.toString(),
  });

  return new brandResponseDto.CreateBrandResponseDTO(brand);
};

const getAllBrandsService = async (getAllBradsRequestDto, logger) => {
  logger.info("Fetching brands with pagination", {
    page: getAllBradsRequestDto.page,
    limit: getAllBradsRequestDto.limit,
    userRole: getAllBradsRequestDto.userRole,
  });
  const { brands, totalBrands } = await brandRepo.getAllBrandsRepo(
    getAllBradsRequestDto.page,
    getAllBradsRequestDto.limit,
    getAllBradsRequestDto.userRole,
  );
  return new brandResponseDto.GetAllBrandsResponseDTO(
    brands,
    totalBrands,
    getAllBradsRequestDto.page,
    getAllBradsRequestDto.limit,
  );
};

const getBrandByIdService = async (getBrandByIdRequestDto, logger) => {
  const brand = await brandRepo.getBrandByIdRepo(getBrandByIdRequestDto.id);
  if (!brand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }
  if (getBrandByIdRequestDto.userRole !== USER_ROLES.ADMIN && !brand.isActive) {
    throw new appError.ForbiddenError(
      "Brand is inactive",
      "The requested brand is inactive and cannot be accessed.",
      "Contact an administrator for more information.",
    );
  }

  return new brandResponseDto.GetBrandByIdResponseDTO(brand);
};

const updateBrandService = async (updatePayload, logger) => {
  const existingBrand = await brandRepo.getBrandByIdRepo(updatePayload.id);
  if (!existingBrand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }

  if (updatePayload.name) {
    const brandWithSameName = await brandRepo.getBrandByNameRepo(
      updatePayload.name,
    );
    if (
      brandWithSameName &&
      brandWithSameName._id.toString() !== updatePayload.id
    ) {
      throw new appError.ConflictError(
        "Brand name conflict",
        "Another brand with the same name already exists.",
        "Use a different brand name.",
      );
    }
  }

  if (updatePayload.iconImageFile) {
    const uploadedIcon = await uploadFileToS3({
      file: updatePayload.iconImageFile,
      folder: `brands/${existingBrand.name}/icon`,
    });
    updatePayload.iconImageUrl = uploadedIcon.url;
    await deleteImageFromS3(existingBrand.iconImageUrl);
  }

  if (updatePayload.bannerImageFile) {
    const uploadedBanner = await uploadFileToS3({
      file: updatePayload.bannerImageFile,
      folder: `brands/${existingBrand.name}/banner`,
    });
    updatePayload.bannerImageUrl = uploadedBanner.url;
    await deleteImageFromS3(existingBrand.bannerImageUrl);
  }

  const updatedBrand = await brandRepo.updateBrandRepo(
    updatePayload.id,
    updatePayload,
  );

  logger.info("Brand updated successfully", {
    brandId: updatedBrand._id.toString(),
  });

  return new brandResponseDto.UpdateBrandResponseDTO(updatedBrand);
};

const updateBrandStatusService = async (updateStatusDto, logger) => {
  const existingBrand = await brandRepo.getBrandByIdRepo(updateStatusDto.id);
  if (!existingBrand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }
  const updatedBrand = await brandRepo.updateBrandStatusRepo(
    updateStatusDto.id,
    updateStatusDto.isActive,
  );

  logger.info("Brand status updated successfully", {
    brandId: updatedBrand._id.toString(),
  });

  return new brandResponseDto.UpdateBrandStatusResponseDTO(updatedBrand);
};

const deleteBrandService = async (id, logger) => {
  const brand = await brandRepo.getBrandByIdRepo(id);
  if (!brand) {
    throw new appError.NotFoundError(
      "Brand not found",
      "No brand exists for the provided id.",
      "Check the brand id and try again.",
    );
  }

  await Promise.all([
    deleteImageFromS3(brand.iconImageUrl),
    deleteImageFromS3(brand.bannerImageUrl),
  ]);

  await brandRepo.deleteBrandRepo(id);

  logger?.info("Brand deleted successfully", {
    brandId: brand._id.toString(),
  });
};

module.exports = {
  createBrandService,
  getAllBrandsService,
  getBrandByIdService,
  updateBrandService,
  updateBrandStatusService,
  deleteBrandService,
};
