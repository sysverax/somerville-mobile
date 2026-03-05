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
      // --- standalone service: basePrice & estimatedTime required ---
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

module.exports = {
  CreateServiceRequestDTO,
};
