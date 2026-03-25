const mongoose = require("mongoose");

const appError = require("../../utils/errors/errors");
const serviceConstants = require("../../utils/constants/service.constants");

class CreateServiceRequestDTO {
  constructor(body) {
    this.name = typeof body.name === "string" ? body.name.trim() : body.name;
    this.description =
      typeof body.description === "string"
        ? body.description.trim()
        : body.description;

    this.variants =
      body.variants && Array.isArray(body.variants) && body.variants.length > 0
        ? body.variants.map((v) => ({
            name: typeof v.name === "string" ? v.name.trim() : v.name,
            description:
              typeof v.description === "string"
                ? v.description.trim()
                : v.description,
            basePrice: Number(v.basePrice),
            estimatedTime: Number(v.estimatedTime),
            isActive: v.isActive !== undefined ? (v.isActive === true || v.isActive === "true") : (body.isActive === true || body.isActive === "true"),
          }))
        : null;

    this.isParent = this.variants !== null;
    this.isVariant = false;
    this.parentServiceId = null;
    this.basePrice = this.isParent ? 0 : Number(body.basePrice);
    this.estimatedTime = this.isParent ? 0 : Number(body.estimatedTime);

    this.isActive = body.isActive === true || body.isActive === "true";
    this.level = body.level || null;
    this.levelId = body.levelId || null;
  }

  validate() {
    if (!this.name) {
      throw new appError.BadRequestError(
        "Service name is required",
        "The 'name' field is required to create a service.",
        "Provide a valid service name and try again.",
      );
    }
    if (typeof this.name !== "string" || this.name.trim() === "") {
      throw new appError.BadRequestError(
        "Invalid service name",
        "The 'name' field must be a non-empty string.",
        "Provide a valid service name and try again.",
      );
    }

    if (
      this.description !== undefined &&
      typeof this.description !== "string"
    ) {
      throw new appError.BadRequestError(
        "Invalid description",
        "The 'description' field must be a string if provided.",
        "Provide a valid description or omit the field.",
      );
    }

    if (this.isParent) {
      if (!this.variants || this.variants.length === 0) {
        throw new appError.BadRequestError(
          "Variants are required",
          "At least one variant is required when creating a parent service.",
          "Add at least one variant and try again.",
        );
      }

      const variantNames = new Set();
      this.variants.forEach((v, index) => {
        if (!v.name) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} name is required`,
            `The 'name' field is required for variant ${index + 1}.`,
            "Provide a valid name for each variant.",
          );
        }
        if (typeof v.name !== "string" || v.name.trim() === "") {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} name`,
            `The 'name' field must be a non-empty string for variant ${index + 1}.`,
            "Provide a valid name for each variant.",
          );
        }

        const normalizedName = v.name.trim().toLowerCase();
        if (variantNames.has(normalizedName)) {
          throw new appError.BadRequestError(
            "Duplicate variant name",
            `Variant name '${v.name}' is duplicated. Each variant must have a unique name.`,
            "Provide unique names for each variant.",
          );
        }
        variantNames.add(normalizedName);

        if ((!v.basePrice && v.basePrice !== 0) || isNaN(v.basePrice)) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} base price is required`,
            `The 'basePrice' field is required for variant ${index + 1}.`,
            "Provide a valid base price and try again.",
          );
        }
        if (v.basePrice <= 0) {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} base price`,
            `The 'basePrice' field must be greater than 0 for variant ${index + 1}.`,
            "Provide a base price greater than 0.",
          );
        }

        if ((!v.estimatedTime && v.estimatedTime !== 0) || isNaN(v.estimatedTime)) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} estimated time is required`,
            `The 'estimatedTime' field is required for variant ${index + 1}.`,
            "Provide a valid estimated time and try again.",
          );
        }
        if (v.estimatedTime <= 0) {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} estimated time`,
            `The 'estimatedTime' field must be greater than 0 for variant ${index + 1}.`,
            "Provide an estimated time greater than 0.",
          );
        }
      });
    } else {
      if (isNaN(this.basePrice)) {
        throw new appError.BadRequestError(
          "Base price is required",
          "The 'basePrice' field is required when creating a service without variants.",
          "Provide a valid base price and try again.",
        );
      }
      if (this.basePrice <= 0) {
        throw new appError.BadRequestError(
          "Invalid base price",
          "The 'basePrice' field must be greater than 0 when service has no variants.",
          "Provide a base price greater than 0.",
        );
      }

      if (isNaN(this.estimatedTime)) {
        throw new appError.BadRequestError(
          "Estimated time is required",
          "The 'estimatedTime' field is required when creating a service without variants.",
          "Provide a valid estimated time and try again.",
        );
      }
      if (this.estimatedTime <= 0) {
        throw new appError.BadRequestError(
          "Invalid estimated time",
          "The 'estimatedTime' field must be greater than 0 when service has no variants.",
          "Provide an estimated time greater than 0.",
        );
      }
    }

    if (!this.level) {
      throw new appError.BadRequestError(
        "Service level is required",
        "The 'level' field is required to create a service.",
        "Provide a valid service level and try again.",
      );
    }
    if (!Object.values(serviceConstants.SERVICE_LEVELS).includes(this.level)) {
      throw new appError.BadRequestError(
        "Invalid service level",
        `The 'level' field must be one of: ${Object.values(serviceConstants.SERVICE_LEVELS).join(", ")}.`,
        "Provide a valid service level and try again.",
      );
    }

    if (!this.levelId) {
      throw new appError.BadRequestError(
        "Level ID is required",
        "The 'levelId' field is required to create a service.",
        "Select a valid option from the level dropdown.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.levelId)) {
      throw new appError.BadRequestError(
        "Invalid Level ID format",
        "Level ID must be a valid MongoDB ObjectId.",
        "Please provide a valid level ID.",
      );
    }
  }
}

class UpdateServiceRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.name =
      body?.name !== undefined
        ? typeof body.name === "string"
          ? body.name.trim()
          : body.name
        : undefined;
    this.description =
      body?.description !== undefined
        ? typeof body.description === "string"
          ? body.description.trim()
          : body.description
        : undefined;
    this.basePrice = body?.basePrice !== undefined ? Number(body.basePrice) : undefined;
    this.estimatedTime = body?.estimatedTime !== undefined ? Number(body.estimatedTime) : undefined;
    this.isActive = body?.isActive !== undefined ? body.isActive : undefined;
    this.level = body?.level !== undefined ? body.level : undefined;
    this.levelId = body?.levelId !== undefined ? body.levelId : undefined;
    this.isParent = body?.isParent !== undefined ? body.isParent : undefined;
    
    this.variants =
      body?.variants !== undefined
        ? Array.isArray(body.variants) && body.variants.length > 0
          ? body.variants.map((v) => ({
              id: v.id,
              name: typeof v.name === "string" ? v.name.trim() : v.name,
              description:
                typeof v.description === "string"
                  ? v.description.trim()
                  : v.description,
              basePrice: Number(v.basePrice),
              estimatedTime: Number(v.estimatedTime),
              isActive: v.isActive !== undefined ? v.isActive : true,
            }))
          : []
        : undefined;

    this.removeVariants =
      body?.removeVariants !== undefined
        ? Array.isArray(body.removeVariants)
          ? body.removeVariants
          : []
        : undefined;

    this.newVariants =
      body?.newVariants !== undefined
        ? Array.isArray(body.newVariants) && body.newVariants.length > 0
          ? body.newVariants.map((v) => ({
              name: typeof v.name === "string" ? v.name.trim() : v.name,
              description:
                typeof v.description === "string"
                  ? v.description.trim()
                  : v.description,
              basePrice: Number(v.basePrice),
              estimatedTime: Number(v.estimatedTime),
              isActive: v.isActive !== undefined ? v.isActive : true,
            }))
          : []
        : undefined;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Service id is required",
        "The 'id' parameter is required to update a service.",
        "Provide a valid service id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid service id format",
        "Provided service id is not a valid MongoDB ObjectId.",
        "Provide a valid service id and try again.",
      );
    }

    if (this.name !== undefined) {
      if (typeof this.name !== "string" || this.name.trim() === "") {
        throw new appError.BadRequestError(
          "Invalid service name",
          "The 'name' field must be a non-empty string when provided.",
          "Provide a valid service name and try again.",
        );
      }
    }

    if (this.description !== undefined) {
      if (typeof this.description !== "string") {
        throw new appError.BadRequestError(
          "Invalid description",
          "The 'description' field must be a string when provided.",
          "Provide a valid description or omit the field.",
        );
      }
    }

    if (this.basePrice !== undefined) {
      if (isNaN(this.basePrice)) {
        throw new appError.BadRequestError(
          "Invalid base price",
          "The 'basePrice' field must be a valid number when provided.",
          "Provide a valid base price and try again.",
        );
      }
      if (this.basePrice <= 0) {
        throw new appError.BadRequestError(
          "Invalid base price",
          "The 'basePrice' field must be greater than 0 when provided.",
          "Provide a base price greater than 0.",
        );
      }
    }

    if (this.estimatedTime !== undefined) {
      if (isNaN(this.estimatedTime)) {
        throw new appError.BadRequestError(
          "Invalid estimated time",
          "The 'estimatedTime' field must be a valid number when provided.",
          "Provide a valid estimated time and try again.",
        );
      }
      if (this.estimatedTime <= 0) {
        throw new appError.BadRequestError(
          "Invalid estimated time",
          "The 'estimatedTime' field must be greater than 0 when provided.",
          "Provide an estimated time greater than 0.",
        );
      }
    }

    if (this.isActive !== undefined) {
      if (typeof this.isActive !== "boolean") {
        throw new appError.BadRequestError(
          "Invalid status value",
          "The 'isActive' field must be a boolean when provided.",
          "Provide a valid status value and try again.",
        );
      }
    }

    if (this.level !== undefined) {
      if (!this.level) {
        throw new appError.BadRequestError(
          "Invalid service level",
          "The 'level' field must not be empty when provided.",
          "Provide a valid service level and try again.",
        );
      }
      if (!Object.values(serviceConstants.SERVICE_LEVELS).includes(this.level)) {
        throw new appError.BadRequestError(
          "Invalid service level",
          `The 'level' field must be one of: ${Object.values(serviceConstants.SERVICE_LEVELS).join(", ")}.`,
          "Provide a valid service level and try again.",
        );
      }
    }

    if (this.levelId !== undefined) {
      if (!this.levelId) {
        throw new appError.BadRequestError(
          "Invalid Level ID",
          "The 'levelId' field must not be empty when provided.",
          "Provide a valid level ID and try again.",
        );
      }
      if (!mongoose.Types.ObjectId.isValid(this.levelId)) {
        throw new appError.BadRequestError(
          "Invalid Level ID format",
          "Level ID must be a valid MongoDB ObjectId.",
          "Please provide a valid level ID.",
        );
      }
    }

    if ((this.level !== undefined && this.levelId === undefined) || 
        (this.level === undefined && this.levelId !== undefined)) {
      throw new appError.BadRequestError(
        "Level and Level ID required together",
        "Both 'level' and 'levelId' must be provided together when updating service level.",
        "Provide both level and levelId or omit both.",
      );
    }

    if (this.variants !== undefined && this.variants.length > 0) {
      const variantNames = new Set();
      this.variants.forEach((v, index) => {
        if (!v.id) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} ID is required`,
            `The 'id' field is required when updating an existing variant (variant ${index + 1}).`,
            "Provide the variant ID for each variant to update.",
          );
        }
        if (!mongoose.Types.ObjectId.isValid(v.id)) {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} ID format`,
            `Variant ID must be a valid MongoDB ObjectId for variant ${index + 1}.`,
            "Please provide a valid variant ID.",
          );
        }

        if (!v.name) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} name is required`,
            `The 'name' field is required for variant ${index + 1}.`,
            "Provide a valid name for each variant.",
          );
        }
        if (typeof v.name !== "string" || v.name.trim() === "") {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} name`,
            `The 'name' field must be a non-empty string for variant ${index + 1}.`,
            "Provide a valid name for each variant.",
          );
        }

        const normalizedName = v.name.trim().toLowerCase();
        if (variantNames.has(normalizedName)) {
          throw new appError.BadRequestError(
            "Duplicate variant name",
            `Variant name '${v.name}' is duplicated. Each variant must have a unique name.`,
            "Provide unique names for each variant.",
          );
        }
        variantNames.add(normalizedName);

        if ((!v.basePrice && v.basePrice !== 0) || isNaN(v.basePrice)) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} base price is required`,
            `The 'basePrice' field is required for variant ${index + 1}.`,
            "Provide a valid base price and try again.",
          );
        }
        if (v.basePrice <= 0) {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} base price`,
            `The 'basePrice' field must be greater than 0 for variant ${index + 1}.`,
            "Provide a base price greater than 0.",
          );
        }

        if ((!v.estimatedTime && v.estimatedTime !== 0) || isNaN(v.estimatedTime)) {
          throw new appError.BadRequestError(
            `Variant ${index + 1} estimated time is required`,
            `The 'estimatedTime' field is required for variant ${index + 1}.`,
            "Provide a valid estimated time and try again.",
          );
        }
        if (v.estimatedTime <= 0) {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} estimated time`,
            `The 'estimatedTime' field must be greater than 0 for variant ${index + 1}.`,
            "Provide an estimated time greater than 0.",
          );
        }

        if (v.isActive !== undefined && typeof v.isActive !== "boolean") {
          throw new appError.BadRequestError(
            `Invalid variant ${index + 1} status`,
            `The 'isActive' field must be a boolean for variant ${index + 1}.`,
            "Provide a valid status value and try again.",
          );
        }
      });
    }

    if (this.removeVariants !== undefined && this.removeVariants.length > 0) {
      this.removeVariants.forEach((variantId, index) => {
        if (!variantId) {
          throw new appError.BadRequestError(
            `Remove variant ${index + 1} ID is required`,
            `Each entry in 'removeVariants' must be a valid variant ID.`,
            "Provide valid variant IDs to remove.",
          );
        }
        if (!mongoose.Types.ObjectId.isValid(variantId)) {
          throw new appError.BadRequestError(
            `Invalid remove variant ${index + 1} ID format`,
            `Variant ID '${variantId}' is not a valid MongoDB ObjectId.`,
            "Please provide valid variant IDs.",
          );
        }
      });
    }

    if (this.newVariants !== undefined && this.newVariants.length > 0) {
      const newVariantNames = new Set();
      this.newVariants.forEach((v, index) => {
        if (!v.name) {
          throw new appError.BadRequestError(
            `New variant ${index + 1} name is required`,
            `The 'name' field is required for new variant ${index + 1}.`,
            "Provide a valid name for each new variant.",
          );
        }
        if (typeof v.name !== "string" || v.name.trim() === "") {
          throw new appError.BadRequestError(
            `Invalid new variant ${index + 1} name`,
            `The 'name' field must be a non-empty string for new variant ${index + 1}.`,
            "Provide a valid name for each new variant.",
          );
        }

        const normalizedName = v.name.trim().toLowerCase();
        if (newVariantNames.has(normalizedName)) {
          throw new appError.BadRequestError(
            "Duplicate new variant name",
            `New variant name '${v.name}' is duplicated. Each variant must have a unique name.`,
            "Provide unique names for each new variant.",
          );
        }
        newVariantNames.add(normalizedName);

        if ((!v.basePrice && v.basePrice !== 0) || isNaN(v.basePrice)) {
          throw new appError.BadRequestError(
            `New variant ${index + 1} base price is required`,
            `The 'basePrice' field is required for new variant ${index + 1}.`,
            "Provide a valid base price and try again.",
          );
        }
        if (v.basePrice <= 0) {
          throw new appError.BadRequestError(
            `Invalid new variant ${index + 1} base price`,
            `The 'basePrice' field must be greater than 0 for new variant ${index + 1}.`,
            "Provide a base price greater than 0.",
          );
        }

        if ((!v.estimatedTime && v.estimatedTime !== 0) || isNaN(v.estimatedTime)) {
          throw new appError.BadRequestError(
            `New variant ${index + 1} estimated time is required`,
            `The 'estimatedTime' field is required for new variant ${index + 1}.`,
            "Provide a valid estimated time and try again.",
          );
        }
        if (v.estimatedTime <= 0) {
          throw new appError.BadRequestError(
            `Invalid new variant ${index + 1} estimated time`,
            `The 'estimatedTime' field must be greater than 0 for new variant ${index + 1}.`,
            "Provide an estimated time greater than 0.",
          );
        }

        if (v.isActive !== undefined && typeof v.isActive !== "boolean") {
          throw new appError.BadRequestError(
            `Invalid new variant ${index + 1} status`,
            `The 'isActive' field must be a boolean for new variant ${index + 1}.`,
            "Provide a valid status value and try again.",
          );
        }
      });
    }
  }

  toUpdatePayload() {
    const payload = {};
    payload.id = this.id;
    if (this.name !== undefined) payload.name = this.name;
    if (this.description !== undefined) payload.description = this.description;
    if (this.basePrice !== undefined) payload.basePrice = this.basePrice;
    if (this.estimatedTime !== undefined) payload.estimatedTime = this.estimatedTime;
    if (this.isActive !== undefined) payload.isActive = this.isActive;
    if (this.level !== undefined) payload.level = this.level;
    if (this.levelId !== undefined) payload.levelId = this.levelId;
    if (this.variants !== undefined) payload.variants = this.variants;
    if (this.removeVariants !== undefined) payload.removeVariants = this.removeVariants;
    if (this.newVariants !== undefined) payload.newVariants = this.newVariants;
    if (this.isParent !== undefined) payload.isParent = this.isParent;
    return payload;
  }
}

class UpdateServiceStatusRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.isActive = body.isActive;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Service id is required",
        "The 'id' parameter is required to update service status.",
        "Provide a valid service id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid service id format",
        "Provided service id is not a valid MongoDB ObjectId.",
        "Provide a valid service id and try again.",
      );
    }

    if (this.isActive === undefined) {
      throw new appError.BadRequestError(
        "Status value is required",
        "The 'isActive' field is required to update service status.",
        "Provide a valid status value and try again.",
      );
    }
    if (typeof this.isActive !== "boolean") {
      throw new appError.BadRequestError(
        "Invalid status value",
        "The 'isActive' field must be a boolean when provided.",
        "Provide a valid status value and try again.",
      );
    }
  }
}

class GetAllServicesRequestDTO {
  constructor(query, userRole) {
    this.page = Number(query.page) || 1;
    this.limit = Number(query.limit) || 10;
    this.userRole = userRole;
    this.level = typeof query.level === "string" && query.level.trim() !== "" ? query.level.trim() : undefined;
    this.brandId = typeof query.brandId === "string" && query.brandId.trim() !== "" ? query.brandId.trim() : undefined;
    this.categoryId = typeof query.categoryId === "string" && query.categoryId.trim() !== "" ? query.categoryId.trim() : undefined;
    this.seriesId = typeof query.seriesId === "string" && query.seriesId.trim() !== "" ? query.seriesId.trim() : undefined;
    this.productId = typeof query.productId === "string" && query.productId.trim() !== "" ? query.productId.trim() : undefined;
    this.search = typeof query.search === "string" ? query.search.trim() : query.search;
    this.isActive = query.isActive !== undefined ? query.isActive === "true" || query.isActive === true : undefined;
  }

  validate() {
    if (this.page < 1) {
      throw new appError.BadRequestError(
        "Invalid page number",
        "The 'page' query parameter must be a positive integer.",
        "Provide a valid page number and try again.",
      );
    }
    if (this.limit < 1 || this.limit > 100) {
      throw new appError.BadRequestError(
        "Invalid limit",
        "The 'limit' query parameter must be between 1 and 100.",
        "Provide a valid limit and try again.",
      );
    }

    if (this.productId && !this.seriesId) {
      throw new appError.BadRequestError(
        "Invalid Selection Path",
        "Series ID is required when filtering by Product.",
        "Select a series first, then select a product."
      );
    }
    if (this.seriesId && !this.categoryId) {
      throw new appError.BadRequestError(
        "Invalid Selection Path",
        "Category ID is required when filtering by Series.",
        "Select a category first, then select a series."
      );
    }
    if (this.categoryId && !this.brandId) {
      throw new appError.BadRequestError(
        "Invalid Selection Path",
        "Brand ID is required when filtering by Category.",
        "Select a brand first, then select a category."
      );
    }

    const idsToCheck = [this.brandId, this.categoryId, this.seriesId, this.productId];
    idsToCheck.forEach((id) => {
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw new appError.BadRequestError(
          "Invalid ID format",
          `Provided ID '${id}' is not a valid MongoDB ObjectId.`,
          "Provide a valid ID and try again.",
        );
      }
    });

    if (this.level && !Object.values(serviceConstants.SERVICE_LEVELS).includes(this.level)) {
      throw new appError.BadRequestError(
        "Invalid service level",
        `The 'level' field must be one of: ${Object.values(serviceConstants.SERVICE_LEVELS).join(", ")}.`,
        "Provide a valid service level and try again.",
      );
    }
  }
}

class GetServiceByIdRequestDTO {
  constructor(params, userRole) {
    this.id = params.id;
    this.userRole = userRole;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Service id is required",
        "The 'id' parameter is required to fetch service details.",
        "Provide a valid service id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid service id format",
        "Provided service id is not a valid MongoDB ObjectId.",
        "Provide a valid service id and try again.",
      );
    }
  }
}

class DeleteServiceRequestDTO {
  constructor(params) {
    this.id = params.id;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Service id is required",
        "The 'id' parameter is required to delete a service.",
        "Provide a valid service id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid service id format",
        "Provided service id is not a valid MongoDB ObjectId.",
        "Provide a valid service id and try again.",
      );
    }
  }
}

module.exports = {
  CreateServiceRequestDTO,
  UpdateServiceRequestDTO,
  UpdateServiceStatusRequestDTO,
  GetAllServicesRequestDTO,
  GetServiceByIdRequestDTO,
  DeleteServiceRequestDTO,
};
