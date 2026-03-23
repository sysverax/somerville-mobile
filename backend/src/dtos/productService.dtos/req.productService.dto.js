const mongoose = require("mongoose");

const appError = require("../../utils/errors/errors");

class UpdateProductServiceRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.price =
      body?.price !== undefined ? Number(body.price) : undefined;
    this.estimatedTime =
      body?.estimatedTime !== undefined ? Number(body.estimatedTime) : undefined;
    this.isActive = body?.isActive !== undefined
      ? body.isActive === true || body.isActive === "true"
      : undefined;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product service ID is required",
        "The 'id' parameter is required to update a product service.",
        "Provide a valid product service ID and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product service ID format",
        "Provided product service ID is not a valid MongoDB ObjectId.",
        "Provide a valid product service ID and try again.",
      );
    }

    if (this.price === undefined && this.estimatedTime === undefined && this.isActive === undefined) {
      throw new appError.BadRequestError(
        "No updatable fields provided",
        "At least one of 'price', 'estimatedTime', or 'isActive' must be provided.",
        "Provide price, estimatedTime, or isActive to update.",
      );
    }

    if (this.price !== undefined) {
      if (isNaN(this.price)) {
        throw new appError.BadRequestError(
          "Invalid price",
          "The 'price' field must be a valid number.",
          "Provide a valid price and try again.",
        );
      }
      if (this.price <= 0) {
        throw new appError.BadRequestError(
          "Invalid price",
          "The 'price' field must be greater than 0.",
          "Provide a price greater than 0.",
        );
      }
    }

    if (this.estimatedTime !== undefined) {
      if (isNaN(this.estimatedTime)) {
        throw new appError.BadRequestError(
          "Invalid estimated time",
          "The 'estimatedTime' field must be a valid number.",
          "Provide a valid estimated time and try again.",
        );
      }
      if (this.estimatedTime <= 0) {
        throw new appError.BadRequestError(
          "Invalid estimated time",
          "The 'estimatedTime' field must be greater than 0.",
          "Provide an estimated time greater than 0.",
        );
      }
    }

    if (this.isActive !== undefined && typeof this.isActive !== "boolean") {
      throw new appError.BadRequestError(
        "Invalid status value",
        "The 'isActive' field must be a boolean.",
        "Provide a valid status value and try again.",
      );
    }
  }
}

class UpdateProductServiceStatusRequestDTO {
  constructor(params, body) {
    this.id = params.id;
    this.isActive = body.isActive;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product service ID is required",
        "The 'id' parameter is required to update product service status.",
        "Provide a valid product service ID and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product service ID format",
        "Provided product service ID is not a valid MongoDB ObjectId.",
        "Provide a valid product service ID and try again.",
      );
    }

    if (this.isActive === undefined) {
      throw new appError.BadRequestError(
        "Status value is required",
        "The 'isActive' field is required to update product service status.",
        "Provide a valid status value and try again.",
      );
    }
    if (typeof this.isActive !== "boolean") {
      throw new appError.BadRequestError(
        "Invalid status value",
        "The 'isActive' field must be a boolean.",
        "Provide a valid status value and try again.",
      );
    }
  }
}

class GetServicesForProductRequestDTO {
  constructor(params, userRole) {
    this.productId = params.productId;
    this.userRole = userRole;
  }

  validate() {
    if (!this.productId) {
      throw new appError.BadRequestError(
        "Product id is required",
        "The 'productId' parameter is required to fetch services for a product.",
        "Provide a valid product id and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.productId)) {
      throw new appError.BadRequestError(
        "Invalid product id format",
        "Provided product id is not a valid MongoDB ObjectId.",
        "Provide a valid product id and try again.",
      );
    }
  }
}

class GetProductsForServiceRequestDTO {
  constructor(params, query) {
    this.id = params.id;
    this.page = query.page !== undefined ? Number(query.page) : undefined;
    this.limit = query.limit !== undefined ? Number(query.limit) : undefined;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Service id is required",
        "The 'id' parameter is required to fetch products for a service.",
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
    if (this.page !== undefined && this.page < 1) {
      throw new appError.BadRequestError(
        "Invalid page number",
        "The 'page' query parameter must be a positive integer.",
        "Provide a valid page number and try again.",
      );
    }
    if (this.limit !== undefined && (this.limit < 1 || this.limit > 100)) {
      throw new appError.BadRequestError(
        "Invalid limit",
        "The 'limit' query parameter must be between 1 and 100.",
        "Provide a valid limit and try again.",
      );
    }
  }
}

class ResetToDefaultProductServiceRequestDTO {
  constructor(params) {
    this.id = params.id;
  }

  validate() {
    if (!this.id) {
      throw new appError.BadRequestError(
        "Product service ID is required",
        "The 'id' parameter is required to reset a product service to default.",
        "Provide a valid product service ID and try again.",
      );
    }
    if (!mongoose.Types.ObjectId.isValid(this.id)) {
      throw new appError.BadRequestError(
        "Invalid product service ID format",
        "Provided product service ID is not a valid MongoDB ObjectId.",
        "Provide a valid product service ID and try again.",
      );
    }
  }
}

module.exports = {
  UpdateProductServiceRequestDTO,
  UpdateProductServiceStatusRequestDTO,
  GetServicesForProductRequestDTO,
  GetProductsForServiceRequestDTO,
  ResetToDefaultProductServiceRequestDTO,
};
