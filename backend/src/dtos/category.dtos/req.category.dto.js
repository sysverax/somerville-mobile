const mongoose = require("mongoose");

const appError = require("../../utils/errors/errors");
const validators = require("../../utils/validators/validator");

class CreateCategoryRequestDTO {
  constructor(body, files) {
    this.name = typeof body.name === "string" ? body.name.trim() : body.name;
    this.description =
      typeof body.description === "string"
        ? body.description.trim()
        : body.description;
    this.brandId = body.brandId || null;
    this.isActive = true;
    this.iconImageFile = files?.iconImage ? files.iconImage[0] : null;
  }

  validate() {
    if (!this.brandId) {
      throw new appError.BadRequestError(
        "Brand ID is required",
        "The 'brandId' field is required to create a category.",
        "Provide a valid brand ID and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.brandId)) {
      throw new appError.BadRequestError(
        "Invalid Brand ID format",
        "Brand ID must be a valid MongoDB ObjectId.",
        "Please provide a valid brand ID.",
      );
    }
    if (!this.name) {
      throw new appError.BadRequestError(
        "Category name is required",
        "The 'name' field is required to create a category.",
        "Provide a valid category name and try again.",
      );
    }
    if (typeof this.name !== "string" || this.name.trim() === "") {
      throw new appError.BadRequestError(
        "Invalid category name",
        "The 'name' field must be a non-empty string.",
        "Provide a valid category name and try again.",
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
    if (!this.iconImageFile) {
      throw new appError.BadRequestError(
        "Icon image is required",
        "The 'iconImage' field is required to create a category.",
        "Provide a valid icon image and try again.",
      );
    }
    if (!validators.isValidImageType(this.iconImageFile.mimetype)) {
      throw new appError.BadRequestError(
        "Invalid icon image type",
        `The uploaded icon image has unsupported type '${this.iconImageFile.mimetype}'.`,
        "Upload only jpeg, png, webp, or svg image files for the icon.",
      );
    }
    if (!validators.isValidFileSize(this.iconImageFile.size)) {
      throw new appError.BadRequestError(
        "Icon image file size exceeded",
        `The uploaded icon image exceeds the maximum allowed size`,
        "Upload a smaller icon image file.",
      );
    }
  }
}

class UpdateCategoryRequestDTO {
  constructor(params, body, files) {
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
    this.brandId = body?.brandId !== undefined ? body.brandId : undefined;
    this.isActive = body?.isActive !== undefined ? body.isActive : undefined;
    if (files) {
      this.iconImageFile = files?.iconImage ? files.iconImage[0] : null;
    }
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Category id is required",
        "The 'id' parameter is required to update a category.",
        "Provide a valid category id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid Category ID format",
        "Provided category id is not a valid MongoDB ObjectId.",
        "Provide a valid category id and try again.",
      );
    }

    if (this.name !== undefined) {
      if (typeof this.name !== "string" || this.name.trim() === "") {
        throw new appError.BadRequestError(
          "Invalid category name",
          "The 'name' field must be a non-empty string when provided.",
          "Provide a valid category name and try again.",
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

    if (this.brandId !== undefined) {
      if (!this.brandId) {
        throw new appError.BadRequestError(
          "Invalid Brand ID",
          "The 'brandId' field must not be empty when provided.",
          "Provide a valid brand ID and try again.",
        );
      }
      if (!mongoose.Types.ObjectId.isValid(this.brandId)) {
        throw new appError.BadRequestError(
          "Invalid Brand ID format",
          "Brand ID must be a valid MongoDB ObjectId.",
          "Please provide a valid brand ID.",
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

    if (this.iconImageFile) {
      if (!validators.isValidImageType(this.iconImageFile.mimetype)) {
        throw new appError.BadRequestError(
          "Invalid icon image type",
          `The uploaded icon image has unsupported type '${this.iconImageFile.mimetype}'.`,
          "Upload only jpeg, png, webp, or svg image files for the icon.",
        );
      }
      if (!validators.isValidFileSize(this.iconImageFile.size)) {
        throw new appError.BadRequestError(
          "Icon image file size exceeded",
          `The uploaded icon image exceeds the maximum allowed size`,
          "Upload a smaller icon image file.",
        );
      }
    }
  }

  toUpdatePayload() {
    const payload = {};
    payload.id = this.id;
    if (this.name !== undefined) payload.name = this.name;
    if (this.description !== undefined) payload.description = this.description;
    if (this.brandId !== undefined) payload.brandId = this.brandId;
    if (this.isActive !== undefined) payload.isActive = this.isActive;
    if (this.iconImageFile) payload.iconImageFile = this.iconImageFile;
    return payload;
  }
}

class UpdateCategoryStatusRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.isActive = body.isActive;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Category id is required",
        "The 'id' parameter is required to update category status.",
        "Provide a valid category id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid Category ID format",
        "Provided category id is not a valid MongoDB ObjectId.",
        "Provide a valid category id and try again.",
      );
    }

    if (this.isActive === undefined) {
      throw new appError.BadRequestError(
        "Status value is required",
        "The 'isActive' field is required to update category status.",
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

class GetAllCategoriesRequestDTO {
  constructor(query, userRole) {
    this.page = query.page ? parseInt(query.page, 10) : 1;
    this.limit = query.limit ? parseInt(query.limit, 10) : 10;
    this.brandId = query.brandId || null;
    this.userRole = userRole;
  }
  validate() {
    if (isNaN(this.page) || this.page < 1) {
      throw new appError.BadRequestError(
        "Invalid page number",
        "The 'page' query parameter must be a positive integer.",
        "Provide a valid page number and try again.",
      );
    }
    if (isNaN(this.limit) || this.limit < 1 || this.limit > 100) {
      throw new appError.BadRequestError(
        "Invalid limit value",
        "The 'limit' query parameter must be a positive integer between 1 and 100.",
        "Provide a valid limit value and try again.",
      );
    }
    if (this.brandId && !mongoose.Types.ObjectId.isValid(this.brandId)) {
      throw new appError.BadRequestError(
        "Invalid Brand ID format",
        "The 'brandId' query parameter must be a valid MongoDB ObjectId.",
        "Provide a valid brand ID and try again.",
      );
    }
  }
}

class GetCategoryByIdRequestDTO {
  constructor(params, userRole) {
    this.id = params.id;
    this.userRole = userRole;
  }
  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Category id is required",
        "The 'id' parameter is required to fetch category details.",
        "Provide a valid category id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid Category ID format",
        "Provided category id is not a valid MongoDB ObjectId.",
        "Provide a valid category id and try again.",
      );
    }
  }
}

class DeleteCategoryRequestDTO {
  constructor(params) {
    this.id = params.id;
  }
  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Category id is required",
        "The 'id' parameter is required to delete a category.",
        "Provide a valid category id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid Category ID format",
        "Provided category id is not a valid MongoDB ObjectId.",
        "Provide a valid category id and try again.",
      );
    }
  }
}

module.exports = {
  CreateCategoryRequestDTO,
  UpdateCategoryRequestDTO,
  UpdateCategoryStatusRequestDTO,
  GetAllCategoriesRequestDTO,
  GetCategoryByIdRequestDTO,
  DeleteCategoryRequestDTO,
};
