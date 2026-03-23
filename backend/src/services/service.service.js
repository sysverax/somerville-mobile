const mongoose = require("mongoose");
const appError = require("../utils/errors/errors");
const serviceRepo = require("../repositories/service.repo");
const productServiceRepo = require("../repositories/productService.repo");
const serviceResponseDto = require("../dtos/service.dtos/res.service.dto");
const { USER_ROLES } = require("../utils/constants/user.constants");

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
      "Service with this name already exists",
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
        isActive: true,
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

      await productServiceRepo.createManyProductServicesRepo(
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

    return new serviceResponseDto.CreateServiceResponseDTO(parentService);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    logger.error("Create service transaction rolled back", {
      error: error.message,
    });

    throw error;
  }
};

const updateServiceService = async (updateServiceRequestDto, logger) => {
  const existingService = await serviceRepo.getServiceByIdRepo(updateServiceRequestDto.id);
  if (!existingService) {
    throw new appError.NotFoundError(
      "Service not found",
      "The service with the provided ID does not exist.",
      "Provide a valid service ID and try again.",
    );
  }

  if (updateServiceRequestDto.level !== undefined) {
    const levelEntity = await serviceRepo.validateLevelIdExistsRepo(
      updateServiceRequestDto.level,
      updateServiceRequestDto.levelId,
    );
    if (!levelEntity) {
      throw new appError.BadRequestError(
        "Invalid Level ID",
        `The provided levelId does not exist in the '${updateServiceRequestDto.level}' collection.`,
        "Please provide a valid levelId that exists for the specified level.",
      );
    }
  }

  if (updateServiceRequestDto.name !== undefined) {
    const levelToCheck = updateServiceRequestDto.level || existingService.level;
    const levelIdToCheck = updateServiceRequestDto.levelId || existingService.levelId;
    
    const duplicateService = await serviceRepo.getServiceByNameRepo(
      updateServiceRequestDto.name,
      levelToCheck,
      levelIdToCheck,
    );
    
    if (duplicateService && duplicateService._id.toString() !== updateServiceRequestDto.id) {
      throw new appError.ConflictError(
        "Service with this name already exists",
        "A service with this name already exists at the specified level.",
        "Use a different service name.",
      );
    }
  }

  const isLevelChanging =
    updateServiceRequestDto.level !== undefined &&
    (updateServiceRequestDto.level !== existingService.level ||
      updateServiceRequestDto.levelId !== existingService.levelId.toString());

  const updatePayload = updateServiceRequestDto.toUpdatePayload();
  const { variants, removeVariants, newVariants, ...serviceUpdateData } = updatePayload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedService = await serviceRepo.updateServiceRepo(
      updateServiceRequestDto.id,
      serviceUpdateData,
      session,
    );

    // If changing from direct service to a parent, remove its direct product associations
    if (serviceUpdateData.isParent === true && !existingService.isParent) {
      await productServiceRepo.deleteProductServicesByServiceIdsRepo(
        [updateServiceRequestDto.id],
        session
      );
      logger.info("Service flipped to parent, removed direct product associations", {
        serviceId: updateServiceRequestDto.id,
      });
    }

    // If changing from parent to direct service, associate it with products
    if (serviceUpdateData.isParent === false && existingService.isParent) {
      const levelToCheck = updateServiceRequestDto.level || existingService.level;
      const levelIdToCheck = updateServiceRequestDto.levelId || existingService.levelId;
      
      const productIds = await serviceRepo.getProductIdsByLevelRepo(
        levelToCheck,
        levelIdToCheck,
        session
      );

      if (productIds.length > 0) {
        const productServiceDocs = productIds.map(productId => ({
          serviceId: updatedService._id,
          productId,
          price: serviceUpdateData.basePrice || updatedService.basePrice,
          estimatedTime: serviceUpdateData.estimatedTime || updatedService.estimatedTime,
          isActive: true,
          isDefault: true,
        }));

        await productServiceRepo.createManyProductServicesRepo(
          productServiceDocs,
          session
        );

        logger.info("Service flipped to direct, created product associations", {
          serviceId: updateServiceRequestDto.id,
          productCount: productIds.length,
        });
      }
    }

    //update default product services if price or time changed
    const productServiceUpdatePayload = {};
    if (serviceUpdateData.basePrice !== undefined) {
      productServiceUpdatePayload.price = serviceUpdateData.basePrice;
    }
    if (serviceUpdateData.estimatedTime !== undefined) {
      productServiceUpdatePayload.estimatedTime = serviceUpdateData.estimatedTime;
    }

    if (serviceUpdateData.isActive !== undefined) {
      await productServiceRepo.updateAllProductServicesStatusByServiceIdRepo(
        updateServiceRequestDto.id,
        serviceUpdateData.isActive,
        session
      );
    }

    if (Object.keys(productServiceUpdatePayload).length > 0) {
      // Update product services for the main service 
      await productServiceRepo.updateProductServicesByServiceIdAndIsDefaultRepo(
        updateServiceRequestDto.id,
        productServiceUpdatePayload,
        session
      );

      logger.info("Default product services updated for main service", {
        serviceId: updateServiceRequestDto.id,
        updatePayload: productServiceUpdatePayload,
      });
    }

    if (isLevelChanging) {
      const newLevel = updateServiceRequestDto.level;
      const newLevelId = updateServiceRequestDto.levelId;

      //get all service IDs affected 
      const existingVariants = await serviceRepo.getVariantsByParentServiceIdRepo(
        updateServiceRequestDto.id,
        session
      );
      const allServiceIds = [
        updateServiceRequestDto.id,
        ...existingVariants.map((v) => v._id.toString()),
      ];

      //get existing ProductServices
      const existingProductServices = await productServiceRepo.getProductServicesByServiceIdsRepo(allServiceIds, session);
      const oldProductIdSet = new Set(
        existingProductServices.map((ps) => ps.productId.toString()),
      );

      //get new product Ids 
      const newProductIds = await serviceRepo.getProductIdsByLevelRepo(
        newLevel,
        newLevelId,
        session
      );
      const newProductIdSet = new Set(
        newProductIds.map((id) => id.toString()),
      );

      //products to remove
      const productIdsToRemove = [...oldProductIdSet].filter(
        (id) => !newProductIdSet.has(id),
      );

      //products to add
      const productIdsToAdd = [...newProductIdSet].filter(
        (id) => !oldProductIdSet.has(id),
      );

      //bulk remove
      if (productIdsToRemove.length > 0) {
        await productServiceRepo.deleteProductServicesByServiceAndProductIdsRepo(
          allServiceIds,
          productIdsToRemove,
          session,
        );
      }

      //bulk create 
      if (productIdsToAdd.length > 0) {
        const productServiceDocs = [];

        if (existingService.isParent && existingVariants.length > 0) {
          for (const productId of productIdsToAdd) {
            for (const variant of existingVariants) {
              productServiceDocs.push({
                serviceId: variant._id,
                productId: new mongoose.Types.ObjectId(productId),
                price: variant.basePrice,
                estimatedTime: variant.estimatedTime,
                isActive: true,
                isDefault: true,
              });
            }
          }
        } else {
          for (const productId of productIdsToAdd) {
            productServiceDocs.push({
              serviceId: new mongoose.Types.ObjectId(updateServiceRequestDto.id),
              productId: new mongoose.Types.ObjectId(productId),
              price: existingService.basePrice,
              estimatedTime: existingService.estimatedTime,
              isActive: true,
              isDefault: true,
            });
          }
        }

        if (productServiceDocs.length > 0) {
          await productServiceRepo.createManyProductServicesRepo(
            productServiceDocs,
            session,
          );
        }
      }

      //update all variants' level/levelId 
      if (existingVariants.length > 0) {
        await serviceRepo.updateVariantsLevelRepo(
          updateServiceRequestDto.id,
          newLevel,
          newLevelId,
          session,
        );
      }
    }

    //if varient change
    if (updateServiceRequestDto.variants !== undefined && updateServiceRequestDto.variants.length > 0) {
      const variantBulkOps = [];
      for (const variant of updateServiceRequestDto.variants) {
        const variantUpdateData = {
          name: variant.name,
          description: variant.description?.trim() || "",
          basePrice: variant.basePrice,
          estimatedTime: variant.estimatedTime,
          isActive: variant.isActive,
        };

        await serviceRepo.updateVariantRepo(
          variant.id,
          variantUpdateData,
          session,
        );

        if (variant.isActive !== undefined) {
          await productServiceRepo.updateAllProductServicesStatusByServiceIdRepo(
            variant.id,
            variant.isActive,
            session,
          );
        }

        const variantProductServiceUpdatePayload = {};
        if (variantUpdateData.basePrice !== undefined) {
          variantProductServiceUpdatePayload.price = variantUpdateData.basePrice;
        }
        if (variantUpdateData.estimatedTime !== undefined) {
          variantProductServiceUpdatePayload.estimatedTime = variantUpdateData.estimatedTime;
        }

        if (Object.keys(variantProductServiceUpdatePayload).length > 0) {
          variantBulkOps.push({
            updateMany: {
              filter: {
                serviceId: new mongoose.Types.ObjectId(variant.id),
                isDefault: true,
              },
              update: { $set: variantProductServiceUpdatePayload },
            },
          });
        }
      }

      if (variantBulkOps.length > 0) {
        await productServiceRepo.bulkUpdateProductServicesRepo(variantBulkOps, session);
        logger.info("Default product services updated via bulkWrite for variants", {
          variantCount: variantBulkOps.length,
        });
      }
    }

    if (updateServiceRequestDto.removeVariants !== undefined && updateServiceRequestDto.removeVariants.length > 0) {
      await productServiceRepo.deleteProductServicesByServiceIdsRepo(
        updateServiceRequestDto.removeVariants,
        session,
      );

      await serviceRepo.deleteVariantsByIdsRepo(
        updateServiceRequestDto.removeVariants,
        session,
      );
    }

    if (updateServiceRequestDto.newVariants !== undefined && updateServiceRequestDto.newVariants.length > 0) {
      const variantLevel = updateServiceRequestDto.level || existingService.level;
      const variantLevelId = updateServiceRequestDto.levelId || existingService.levelId;

      const createdVariants = [];
      for (const variant of updateServiceRequestDto.newVariants) {
        const variantCreateData = {
          name: variant.name,
          description: variant.description?.trim() || "",
          basePrice: variant.basePrice,
          estimatedTime: variant.estimatedTime,
          isActive: variant.isActive,
          level: variantLevel,
          levelId: variantLevelId,
          parentServiceId: updateServiceRequestDto.id,
        };

        const newVariant = await serviceRepo.createVariantRepo(
          variantCreateData,
          session,
        );
        createdVariants.push(newVariant);
      }

      const productIds = await serviceRepo.getProductIdsByLevelRepo(
        variantLevel,
        variantLevelId,
        session
      );

      if (productIds.length > 0) {
        const productServiceDocs = [];
        for (const productId of productIds) {
          for (const variant of createdVariants) {
            productServiceDocs.push({
              serviceId: variant._id,
              productId,
              price: variant.basePrice,
              estimatedTime: variant.estimatedTime,
              isActive: variant.isActive,
              isDefault: true,
            });
          }
        }

        if (productServiceDocs.length > 0) {
          await productServiceRepo.createManyProductServicesRepo(
            productServiceDocs,
            session,
          );
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    return new serviceResponseDto.UpdateServiceResponseDTO(updatedService);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    logger.error("Service update transaction rolled back", {
      error: error.message,
      serviceId: updateServiceRequestDto.id,
    });

    throw error;
  }
};

const updateServiceStatusService = async (updateServiceStatusRequestDto, logger) => {
  const existingService = await serviceRepo.getServiceByIdRepo(updateServiceStatusRequestDto.id);
  if (!existingService) {
    throw new appError.NotFoundError(
      "Service not found",
      "The service with the provided ID does not exist.",
      "Provide a valid service ID and try again.",
    );
  }

  const updatedService = await serviceRepo.updateServiceStatusRepo(
    updateServiceStatusRequestDto.id,
    updateServiceStatusRequestDto.isActive,
  );

  // Sync with product services
  await productServiceRepo.updateAllProductServicesStatusByServiceIdRepo(
    updateServiceStatusRequestDto.id,
    updateServiceStatusRequestDto.isActive,
  );

  logger.info("Service status updated successfully", {
    serviceId: updateServiceStatusRequestDto.id,
    newStatus: updateServiceStatusRequestDto.isActive,
  });

  return new serviceResponseDto.UpdateServiceStatusResponseDTO(updatedService);
};

const getAllServicesService = async (getAllServicesRequestDto) => {
  const { services, total } = await serviceRepo.getAllServicesRepo({
    page: getAllServicesRequestDto.page,
    limit: getAllServicesRequestDto.limit,
    userRole: getAllServicesRequestDto.userRole,
    level: getAllServicesRequestDto.level,
    brandId: getAllServicesRequestDto.brandId,
    categoryId: getAllServicesRequestDto.categoryId,
    seriesId: getAllServicesRequestDto.seriesId,
    productId: getAllServicesRequestDto.productId,
    search: getAllServicesRequestDto.search,
    isActive: getAllServicesRequestDto.isActive,
  });

  return new serviceResponseDto.GetAllServicesResponseDTO(
    services,
    total,
    getAllServicesRequestDto.page,
    getAllServicesRequestDto.limit,
  );
};

const getServiceByIdService = async (getServiceByIdRequestDto) => {
  const { id: serviceId, userRole } = getServiceByIdRequestDto;
  const service = await serviceRepo.getServiceByIdRepo(serviceId);
  if (!service) {
    throw new appError.NotFoundError(
      "Service not found",
      "The service with the provided ID does not exist.",
      "Provide a valid service ID and try again.",
    );
  }

  if (userRole !== USER_ROLES.ADMIN && !service.isActive) {
    throw new appError.NotFoundError(
      "Service not found",
      "The service is currently unavailable.",
      "Please check again later.",
    );
  }

  let variants = await serviceRepo.getVariantsByParentServiceIdRepo(service._id);
  
  if (userRole !== USER_ROLES.ADMIN) {
    variants = variants.filter((v) => v.isActive);
  }
  
  const allServiceIds = [
    service._id.toString(),
    ...variants.map((v) => v._id.toString()),
  ];
  
  const linkedProductServices = await productServiceRepo.getProductServicesByServiceIdsRepo(allServiceIds);
  const linkedProductsCount = new Set(
    linkedProductServices.map((ps) => ps.productId.toString()),
  ).size;

  const levelEntity = await serviceRepo.validateLevelIdExistsRepo(service.level, service.levelId);
  service.assignedTo = levelEntity ? levelEntity.name : "";
  service.linkedProductsCount = linkedProductsCount;
  
  variants.forEach(v => {
    v.linkedProductsCount = linkedProductServices.filter(ps => ps.serviceId.toString() === v._id.toString()).length;
    v.assignedTo = service.assignedTo;
  });

  return new serviceResponseDto.ServiceDetailResponseDTO(
    service,
    variants,
    linkedProductsCount,
  );
};

const deleteServiceService = async (deleteServiceRequestDto, logger) => {
  const { id: serviceId } = deleteServiceRequestDto;
  const service = await serviceRepo.getServiceByIdRepo(serviceId);
  if (!service) {
    throw new appError.NotFoundError(
      "Service not found",
      "The service with the provided ID does not exist.",
      "Provide a valid service ID and try again.",
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let serviceIdsToDelete = [serviceId];

    if (service.isParent) {
      const variants = await serviceRepo.getVariantsByParentServiceIdRepo(
        serviceId,
        session,
      );
      if (variants.length > 0) {
        const variantIds = variants.map((v) => v._id.toString());
        serviceIdsToDelete = [...serviceIdsToDelete, ...variantIds];
        
        logger.info("Service is parent, adding its variants to deletion list", {
          parentId: serviceId,
          variantCount: variants.length,
        });
      }
    }

    // 1. Delete ProductServices related to these services
    await productServiceRepo.deleteProductServicesByServiceIdsRepo(
      serviceIdsToDelete,
      session,
    );
    logger.info("Product services deleted", {
      affectedServiceIds: serviceIdsToDelete,
    });

    // 2. Delete the services themselves (parent and/or variants)
    await serviceRepo.deleteServicesByIdsRepo(serviceIdsToDelete, session);
    logger.info("Services deleted", {
      serviceIds: serviceIdsToDelete,
    });

    await session.commitTransaction();
    session.endSession();

    logger.info("Delete service transaction committed successfully", {
      serviceId,
    });

    return { serviceId };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    logger.error("Delete service transaction rolled back", {
      error: error.message,
      serviceId,
    });

    throw error;
  }
};

module.exports = {
  createServiceService,
  updateServiceService,
  updateServiceStatusService,
  getAllServicesService,
  getServiceByIdService,
  deleteServiceService,
};
