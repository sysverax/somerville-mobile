const mongoose = require("mongoose");

const appError = require("../utils/errors/errors");
const serviceRepo = require("../repositories/service.repo");
const serviceResponseDto = require("../dtos/service.dtos/res.service.dto");

const createServiceService = async (createServiceRequestDto, logger) => {
  const levelEntity = await serviceRepo.validateLevelIdExistsRepo(
    createServiceRequestDto.level,
    createServiceRequestDto.levelId,
  );
  if (!levelEntity) {
    throw new appError.BadRequestError(
      "Invalid Level ID",
      `The provided levelId does not exist in the '${createServiceRequestDto.level}' collection.`,
      "Please provide a valid levelId that exists for the specified level.",
    );
  }

  const existingService = await serviceRepo.getServiceByNameRepo(
    createServiceRequestDto.name,
    createServiceRequestDto.level,
    createServiceRequestDto.levelId,
  );
  if (existingService) {
    throw new appError.ConflictError(
      "Service already exists",
      "A service with this name already exists at the specified level.",
      "Use a different service name.",
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //create parent service
    const parentService = await serviceRepo.createServiceRepo(
      {
        name: createServiceRequestDto.name,
        description: createServiceRequestDto.description?.trim() || "",
        basePrice: createServiceRequestDto.basePrice,
        estimatedTime: createServiceRequestDto.estimatedTime,
        isActive: createServiceRequestDto.isActive,
        level: createServiceRequestDto.level,
        levelId: createServiceRequestDto.levelId,
        isParent: createServiceRequestDto.isParent,
        isVariant: false,
        parentServiceId: null,
      },
      session,
    );

    logger.info("Parent service created", {
      serviceId: parentService._id.toString(),
      isParent: parentService.isParent,
    });

    //create Variants
    let variants = [];

    if (
      createServiceRequestDto.isParent &&
      createServiceRequestDto.variants &&
      createServiceRequestDto.variants.length > 0
    ) {
      const variantDocs = createServiceRequestDto.variants.map((v) => ({
        name: v.name,
        description: v.description?.trim() || "",
        basePrice: v.basePrice,
        estimatedTime: v.estimatedTime,
        isActive: createServiceRequestDto.isActive,
        level: createServiceRequestDto.level,
        levelId: new mongoose.Types.ObjectId(createServiceRequestDto.levelId),
        isParent: false,
        isVariant: true,
        parentServiceId: parentService._id,
      }));

      variants = await serviceRepo.createManyServicesRepo(
        variantDocs,
        session,
      );

      logger.info("Variants created", {
        parentServiceId: parentService._id.toString(),
        variantCount: variants.length,
      });
    }

    //find associated Products 
    const productIds = await serviceRepo.getProductIdsByLevelRepo(
      createServiceRequestDto.level,
      createServiceRequestDto.levelId,
    );

    logger.info("Products found for level", {
      level: createServiceRequestDto.level,
      levelId: createServiceRequestDto.levelId,
      productCount: productIds.length,
    });

    //create Product Services
    if (productIds.length > 0) {
      const productServiceDocs = [];

      if (createServiceRequestDto.isParent && variants.length > 0) {
        for (const productId of productIds) {
          for (const variant of variants) {
            productServiceDocs.push({
              serviceId: variant._id,
              productId,
              price: variant.basePrice,
              estimatedTime: variant.estimatedTime,
              isActive: true,
              isDefault: true,
            });
          }
        }
      } else {
        for (const productId of productIds) {
          productServiceDocs.push({
            serviceId: parentService._id,
            productId,
            price: parentService.basePrice,
            estimatedTime: parentService.estimatedTime,
            isActive: true,
            isDefault: true,
          });
        }
      }

      await serviceRepo.createManyProductServicesRepo(
        productServiceDocs,
        session,
      );

      logger.info("Product services created", {
        productServiceCount: productServiceDocs.length,
      });
    }

    await session.commitTransaction();
    session.endSession();

    logger.info("Create service transaction committed successfully", {
      serviceId: parentService._id.toString(),
    });

    return new serviceResponseDto.CreateServiceResponseDTO(
      parentService,
      variants,
      productIds.length,
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Create service transaction rolled back", {
      error: error.message,
    });

    throw error;
  }
};

module.exports = {
  createServiceService,
};
