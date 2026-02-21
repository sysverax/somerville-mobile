const mongoose = require("mongoose");

const appError = require("../../utils/errors/errors");
const validators = require("../../utils/validators/validator");

class CreateBrandRequestDTO {
  constructor(body, files) {
    this.name = body.name?.trim() || "";
    this.description = body.description?.trim() || "";
    this.isActive = true; // default to active on creation
    this.iconImageFile = files?.iconImage ? files.iconImage[0] : null;
    this.bannerImageFile = files?.bannerImage ? files.bannerImage[0] : null;
  }

  validate() {
    if (!this.name) {
      throw new appError.BadRequestError(
        "Brand name is required",
        "The 'name' field is required to create a brand.",
        "Provide a valid brand name and try again.",
      );
    }
    if (typeof this.name !== "string" || this.name.trim() === "") {
      throw new appError.BadRequestError(
        "Invalid brand name",
        "The 'name' field must be a non-empty string.",
        "Provide a valid brand name and try again.",
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
        "The 'iconImage' field is required to create a brand.",
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
    if (!this.bannerImageFile) {
      throw new appError.BadRequestError(
        "Banner image is required",
        "The 'bannerImage' field is required to create a brand.",
        "Provide a valid banner image and try again.",
      );
    }
    if (!validators.isValidImageType(this.bannerImageFile.mimetype)) {
      throw new appError.BadRequestError(
        "Invalid banner image type",
        `The uploaded banner image has unsupported type '${this.bannerImageFile.mimetype}'.`,
        "Upload only jpeg, png, webp, or svg image files for the banner.",
      );
    }
    if (!validators.isValidFileSize(this.bannerImageFile.size)) {
      throw new appError.BadRequestError(
        "Banner image file size exceeded",
        `The uploaded banner image exceeds the maximum allowed size`,
        "Upload a smaller banner image file.",
      );
    }
  }
}

class GetAllBrandsRequestDTO {
  constructor(query, userRole) {
    this.page = query.page ? parseInt(query.page, 10) : 1;
    this.limit = query.limit ? parseInt(query.limit, 10) : 10;
    this.userRole = userRole; // Pass user role for potential role-based access control
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
  }
}

class GetBrandByIdRequestDTO {
  constructor(params, userRole) {
    this.id = params.id;
    this.userRole = userRole; // Pass user role for potential role-based access control
  }
  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Brand id is required",
        "The 'id' parameter is required to fetch brand details.",
        "Provide a valid brand id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid brand id",
        "Provided brand id is not a valid MongoDB ObjectId.",
        "Provide a valid brand id and try again.",
      );
    }
  }
}

class UpdateBrandRequestDTO {
  constructor(params, body, files) {
    this.id = params.id;
    this.name = body?.name !== undefined ? body.name.trim() : undefined;
    this.description =
      body?.description !== undefined ? body.description.trim() : undefined;
    this.isActive = body?.isActive !== undefined ? body.isActive : undefined;
    if (files) {
      this.iconImageFile = files?.iconImage ? files.iconImage[0] : null;
      this.bannerImageFile = files?.bannerImage ? files.bannerImage[0] : null;
    }
  }

  validate() {
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid brand id",
        "Provided brand id is not a valid MongoDB ObjectId.",
        "Provide a valid brand id and try again.",
      );
    }

    if (this.name !== undefined) {
      if (typeof this.name !== "string" || this.name.trim() === "") {
        throw new appError.BadRequestError(
          "Invalid brand name",
          "The 'name' field must be a non-empty string when provided.",
          "Provide a valid brand name and try again.",
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
    if (this.bannerImageFile) {
      if (!validators.isValidImageType(this.bannerImageFile.mimetype)) {
        throw new appError.BadRequestError(
          "Invalid banner image type",
          `The uploaded banner image has unsupported type '${this.bannerImageFile.mimetype}'.`,
          "Upload only jpeg, png, webp, or svg image files for the banner.",
        );
      }
      if (!validators.isValidFileSize(this.bannerImageFile.size)) {
        throw new appError.BadRequestError(
          "Banner image file size exceeded",
          `The uploaded banner image exceeds the maximum allowed size`,
          "Upload a smaller banner image file.",
        );
      }
    }
  }

  toUpdatePayload() {
    const payload = {};
    payload.id = this.id;
    if (this.name !== undefined) payload.name = this.name;
    if (this.description !== undefined) payload.description = this.description;
    if (this.isActive !== undefined) payload.isActive = this.isActive;
    if (this.iconImageFile) payload.iconImageFile = this.iconImageFile;
    if (this.bannerImageFile) payload.bannerImageFile = this.bannerImageFile;
    return payload;
  }
}

class UpdateBrandStatusRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.isActive = body.isActive;
  }
  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Brand id is required",
        "The 'id' parameter is required to update brand status.",
        "Provide a valid brand id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid brand id",
        "Provided brand id is not a valid MongoDB ObjectId.",
        "Provide a valid brand id and try again.",
      );
    }

    if (this.isActive === undefined) {
      throw new appError.BadRequestError(
        "Status value is required",
        "The 'isActive' field is required to update brand status.",
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

class DeleteBrandRequestDTO {
  constructor(params) {
    this.id = params.id;
  }
  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Brand id is required",
        "The 'id' parameter is required to delete a brand.",
        "Provide a valid brand id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid brand id",
        "Provided brand id is not a valid MongoDB ObjectId.",
        "Provide a valid brand id and try again.",
      );
    }
  }
}

module.exports = {
  CreateBrandRequestDTO,
  GetAllBrandsRequestDTO,
  GetBrandByIdRequestDTO,
  UpdateBrandRequestDTO,
  UpdateBrandStatusRequestDTO,
  DeleteBrandRequestDTO,
};
