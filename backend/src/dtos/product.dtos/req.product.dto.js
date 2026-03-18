const mongoose = require("mongoose");

const appError = require("../../utils/errors/errors");
const validators = require("../../utils/validators/validator");

class CreateProductRequestDTO {
  constructor(body, files) {
    this.name =
      typeof body.name === "string" ? body.name.trim() : (body.name ?? "");
    this.description =
      typeof body.description === "string"
        ? body.description.trim()
        : (body.description ?? "");
    this.seriesId = body.seriesId;
    this.isActive = true;
    this.iconImageFile = files?.iconImage ? files.iconImage[0] : null;
  }

  validate() {
    if (!this.seriesId) {
      throw new appError.BadRequestError(
        "Series id is required",
        "The 'seriesId' field is required to create a product.",
        "Provide a valid series id and try again.",
      );
    }

    if (!mongoose.Types.ObjectId.isValid(this.seriesId)) {
      throw new appError.BadRequestError(
        "Invalid series id format",
        "Provided series id is not a valid MongoDB ObjectId.",
        "Provide a valid series id and try again.",
      );
    }
    
    if (!this.name) {
      throw new appError.BadRequestError(
        "Product name is required",
        "The 'name' field is required to create a product.",
        "Provide a valid product name and try again.",
      );
    }

    if (typeof this.name !== "string" || this.name.trim() === "") {
      throw new appError.BadRequestError(
        "Invalid product name",
        "The 'name' field must be a non-empty string.",
        "Provide a valid product name and try again.",
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
        "The 'iconImage' field is required to create a product.",
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
        "The uploaded icon image exceeds the maximum allowed size",
        "Upload a smaller icon image file.",
      );
    }
  }
}

class UpdateProductRequestDTO {
  constructor(params, body, files) {
    this.id = params.id;
    this.seriesId = body?.seriesId !== undefined ? body.seriesId : undefined;
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
    this.isActive = body?.isActive !== undefined ? body.isActive : undefined;
    this.iconImageFile = files?.iconImage ? files.iconImage[0] : null;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product id is required",
        "The 'id' parameter is required to update a product.",
        "Provide a valid product id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product id format",
        "Provided product id is not a valid MongoDB ObjectId.",
        "Provide a valid product id and try again.",
      );
    }

    if (this.seriesId !== undefined) {
      throw new appError.BadRequestError(
        "Series ID cannot be updated",
        "The series association of a product cannot be changed after creation.",
        "Remove the 'seriesId' field from the request.",
      );
    }

    if (this.name !== undefined) {
      if (typeof this.name !== "string" || this.name.trim() === "") {
        throw new appError.BadRequestError(
          "Invalid product name",
          "The 'name' field must be a non-empty string when provided.",
          "Provide a valid product name and try again.",
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
          "The uploaded icon image exceeds the maximum allowed size",
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
    if (this.isActive !== undefined) payload.isActive = this.isActive;
    if (this.iconImageFile) payload.iconImageFile = this.iconImageFile;
    return payload;
  }
}

class UpdateProductStatusRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.isActive = body.isActive;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product id is required",
        "The 'id' parameter is required to update product status.",
        "Provide a valid product id and try again.",
      );
    }

    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product id format",
        "Provided product id is not a valid MongoDB ObjectId.",
        "Provide a valid product id and try again.",
      );
    }

    if (this.isActive === undefined) {
      throw new appError.BadRequestError(
        "Status is required",
        "The 'isActive' field is required to update product status.",
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

class GetAllProductsRequestDTO {
  constructor(query, userRole) {
    this.page = query.page ? parseInt(query.page, 10) : 1;
    this.limit = query.limit ? parseInt(query.limit, 10) : 10;
    this.userRole = userRole;
    this.seriesId = query.seriesId;
    this.categoryId = query.categoryId;
    this.brandId = query.brandId;
    this.search = query.search || "";
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

    if (this.seriesId && !mongoose.Types.ObjectId.isValid(this.seriesId)) {
      throw new appError.BadRequestError(
        "Invalid series id format",
        "Provided series id is not a valid MongoDB ObjectId.",
        "Provide a valid series id and try again.",
      );
    }

    if (this.categoryId && !mongoose.Types.ObjectId.isValid(this.categoryId)) {
      throw new appError.BadRequestError(
        "Invalid category id format",
        "Provided category id is not a valid MongoDB ObjectId.",
        "Provide a valid category id and try again.",
      );
    }

    if (this.brandId && !mongoose.Types.ObjectId.isValid(this.brandId)) {
      throw new appError.BadRequestError(
        "Invalid brand id format",
        "Provided brand id is not a valid MongoDB ObjectId.",
        "Provide a valid brand id and try again.",
      );
    }
  }
}

class GetProductByIdRequestDTO {
  constructor(params, userRole) {
    this.id = params.id;
    this.userRole = userRole;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product id is required",
        "The 'id' parameter is required to fetch product details.",
        "Provide a valid product id and try again.",
      );
    }

    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product id format",
        "Provided product id is not a valid MongoDB ObjectId.",
        "Provide a valid product id and try again.",
      );
    }
  }
}

class DeleteProductRequestDTO {
  constructor(params) {
    this.id = params.id;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product id is required",
        "The 'id' parameter is required to delete a product.",
        "Provide a valid product id and try again.",
      );
    }

    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product id format",
        "Provided product id is not a valid MongoDB ObjectId.",
        "Provide a valid product id and try again.",
      );
    }
  }
}

module.exports = {
  CreateProductRequestDTO,
  GetAllProductsRequestDTO,
  GetProductByIdRequestDTO,
  UpdateProductRequestDTO,
  UpdateProductStatusRequestDTO,
  DeleteProductRequestDTO,
};
