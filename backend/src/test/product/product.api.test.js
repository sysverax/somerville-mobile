const request = require("supertest");
const {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require("../../utils/errors/errors");

jest.mock("uuid", () => ({
  v4: () => "test-request-id",
}));

jest.mock("../../middlewares/auth.middleware", () => ({
  validateAdmin: (req, res, next) => {
    const {
      UnauthorizedError: MockUnauthorizedError,
    } = require("../../utils/errors/errors");
    if (req.headers["x-user-role"] !== "admin") {
      return next(
        new MockUnauthorizedError(
          "Access token missing",
          "No access token found in cookies.",
          "Please login and try again.",
        ),
      );
    }
    req.userRole = "admin";
    next();
  },
  validateRoleBasedHeader: (req, res, next) => {
    req.userRole = req.headers["x-user-role"] || "public";
    next();
  },
}));

jest.mock("../../services/brand.service", () => ({
  createBrandService: jest.fn(),
  getAllBrandsService: jest.fn(),
  getBrandByIdService: jest.fn(),
  updateBrandService: jest.fn(),
  updateBrandStatusService: jest.fn(),
  deleteBrandService: jest.fn(),
}));

jest.mock("../../services/category.service", () => ({
  createCategoryService: jest.fn(),
  updateCategoryService: jest.fn(),
  updateCategoryStatusService: jest.fn(),
  getAllCategoriesService: jest.fn(),
  getCategoryByIdService: jest.fn(),
  deleteCategoryService: jest.fn(),
}));

jest.mock("../../services/series.service", () => ({
  createSeriesService: jest.fn(),
  getAllSeriesService: jest.fn(),
  getSeriesByIdService: jest.fn(),
  updateSeriesService: jest.fn(),
  updateSeriesStatusService: jest.fn(),
  deleteSeriesService: jest.fn(),
}));

jest.mock("../../services/product.service", () => ({
  createProductService: jest.fn(),
  getAllProductsService: jest.fn(),
  getProductByIdService: jest.fn(),
  updateProductService: jest.fn(),
  updateProductStatusService: jest.fn(),
  deleteProductService: jest.fn(),
}));

jest.mock("../../services/auth.service", () => ({
  adminRegisterService: jest.fn(),
  adminLoginService: jest.fn(),
}));

const { createApp } = require("../../app");
const productService = require("../../services/product.service");

const validId = "507f1f77bcf86cd799439011";
const validSeriesId = "507f1f77bcf86cd799439022";
const validCategoryId = "507f1f77bcf86cd799439033";
const validBrandId = "507f1f77bcf86cd799439044";

describe("Product API tests", () => {
  const app = createApp();
  const oversizedFile = Buffer.alloc(6 * 1024 * 1024, 1); // 6MB

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /api/products
  // ─────────────────────────────────────────────────────────────────────────────

  it("POST /api/products should create product successfully", async () => {
    productService.createProductService.mockResolvedValueOnce({
      _id: validId,
      seriesId: validSeriesId,
      name: "iPhone 15",
      imageUrl: "http://img/icon.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Product created successfully");
    expect(productService.createProductService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/products should fail when seriesId is missing", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Series id is required");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when seriesId format is invalid", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", "invalid-id")
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid series id format");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when name is missing", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Product name is required");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when name is empty", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Product name is required");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when name contains only spaces", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "   ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Product name is required");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when icon image is missing", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "iPhone 15");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Icon image is required");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when icon image mime type is invalid", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Unsupported file type");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should fail when icon image file size exceeds limit", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "iPhone 15")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("File too large");
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should return 401 for public user", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "public")
      .field("seriesId", validSeriesId)
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(401);
    expect(productService.createProductService).not.toHaveBeenCalled();
  });

  it("POST /api/products should map unexpected error to 500", async () => {
    productService.createProductService.mockRejectedValueOnce(
      new Error("Unexpected"),
    );

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", validSeriesId)
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Create product failed");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/products
  // ─────────────────────────────────────────────────────────────────────────────

  it("GET /api/products should return products with filters", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [{ _id: validId, name: "iPhone 15" }],
      totalProducts: 1,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ seriesId: validSeriesId, page: 1, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Products fetched successfully");
    expect(productService.getAllProductsService).toHaveBeenCalledTimes(1);
  });

  it("GET /api/products should return products with no query params", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [{ _id: validId, name: "iPhone 15" }],
      totalProducts: 1,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(productService.getAllProductsService).toHaveBeenCalledTimes(1);
  });

  it("GET /api/products should filter by seriesId correctly", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [],
      totalProducts: 0,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ seriesId: validSeriesId });

    expect(res.status).toBe(200);
    const calledDto = productService.getAllProductsService.mock.calls[0][0];
    expect(calledDto.seriesId).toBe(validSeriesId);
  });

  it("GET /api/products should filter by categoryId correctly", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [],
      totalProducts: 0,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ categoryId: validCategoryId });

    expect(res.status).toBe(200);
    const calledDto = productService.getAllProductsService.mock.calls[0][0];
    expect(calledDto.categoryId).toBe(validCategoryId);
  });

  it("GET /api/products should filter by brandId correctly", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [],
      totalProducts: 0,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ brandId: validBrandId });

    expect(res.status).toBe(200);
    const calledDto = productService.getAllProductsService.mock.calls[0][0];
    expect(calledDto.brandId).toBe(validBrandId);
  });

  it("GET /api/products should return only active products for public user", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [{ _id: validId, name: "iPhone 15", isActive: true }],
      totalProducts: 1,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    const calledDto = productService.getAllProductsService.mock.calls[0][0];
    expect(calledDto.userRole).toBe("public");
  });

  it("GET /api/products should return active + inactive for admin", async () => {
    productService.getAllProductsService.mockResolvedValueOnce({
      products: [
        { _id: validId, name: "iPhone 15", isActive: true },
        { _id: "507f1f77bcf86cd799439099", name: "iPhone 14", isActive: false },
      ],
      totalProducts: 2,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    const calledDto = productService.getAllProductsService.mock.calls[0][0];
    expect(calledDto.userRole).toBe("admin");
  });

  it("GET /api/products should fail when seriesId format is invalid", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ seriesId: "invalid-id" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid series id format");
  });

  it("GET /api/products should fail when categoryId format is invalid", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ categoryId: "invalid-id" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid category id format");
  });

  it("GET /api/products should fail when brandId format is invalid", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ brandId: "invalid-id" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand id format");
  });

  it("GET /api/products should fail when page is invalid", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ page: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid page number");
  });

  it("GET /api/products should fail when limit is invalid", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ limit: "abc" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid limit value");
  });

  it("GET /api/products should map unexpected error to 500", async () => {
    productService.getAllProductsService.mockRejectedValueOnce(
      new Error("Unexpected"),
    );

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Fetch products failed");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/products/:id
  // ─────────────────────────────────────────────────────────────────────────────

  it("GET /api/products/:id should return product successfully", async () => {
    productService.getProductByIdService.mockResolvedValueOnce({
      _id: validId,
      name: "iPhone 15",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product fetched successfully");
  });

  it("GET /api/products/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .get("/api/products/invalid-id")
      .set("x-user-role", "admin");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid product id format");
  });

  it("GET /api/products/:id should map NotFoundError to 404", async () => {
    productService.getProductByIdService.mockRejectedValueOnce(
      new NotFoundError("Product not found", "No product exists", "Check id"),
    );

    const res = await request(app)
      .get(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });

  it("GET /api/products/:id should map unexpected error to 500", async () => {
    productService.getProductByIdService.mockRejectedValueOnce(
      new Error("Unexpected"),
    );

    const res = await request(app)
      .get(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Fetch product failed");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /api/products/:id
  // ─────────────────────────────────────────────────────────────────────────────

  it("PATCH /api/products/:id should update product successfully", async () => {
    productService.updateProductService.mockResolvedValueOnce({
      _id: validId,
      name: "iPhone 15 Pro",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "iPhone 15 Pro")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product updated successfully");
    expect(productService.updateProductService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/products/:id should return no-change success when no fields provided", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "No changes detected, product data remains unchanged",
    );
  });

  it("PATCH /api/products/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/products/invalid-id")
      .set("x-user-role", "admin")
      .field("name", "iPhone 15 Pro");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid product id format");
  });

  it("PATCH /api/products/:id should fail when seriesId format is invalid", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("seriesId", "invalid-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid series id format");
  });

  it("PATCH /api/products/:id should fail when name is empty or whitespace", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "   ");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid product name");
  });

  it("PATCH /api/products/:id should update description only", async () => {
    productService.updateProductService.mockResolvedValueOnce({
      _id: validId,
      name: "iPhone 15",
      description: "New description",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("description", "New description");

    expect(res.status).toBe(200);
    expect(productService.updateProductService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/products/:id should update icon image successfully", async () => {
    productService.updateProductService.mockResolvedValueOnce({
      _id: validId,
      name: "iPhone 15",
      imageUrl: "http://img/new-icon.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "new-icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(productService.updateProductService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/products/:id should fail when iconImage file size exceeds limit", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("File too large");
  });

  it("PATCH /api/products/:id should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "public")
      .field("name", "iPhone 15 Pro");

    expect(res.status).toBe(401);
  });

  it("PATCH /api/products/:id should map NotFoundError to 404", async () => {
    productService.updateProductService.mockRejectedValueOnce(
      new NotFoundError("Product not found", "No product exists", "Check id"),
    );

    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "iPhone 15 Pro");

    expect(res.status).toBe(404);
  });

  it("PATCH /api/products/:id should map ConflictError to 409", async () => {
    productService.updateProductService.mockRejectedValueOnce(
      new ConflictError("Product exists", "Duplicate name", "Use another name"),
    );

    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "iPhone 15 Pro");

    expect(res.status).toBe(409);
  });

  it("PATCH /api/products/:id should map unexpected error to 500", async () => {
    productService.updateProductService.mockRejectedValueOnce(
      new Error("Unexpected"),
    );

    const res = await request(app)
      .patch(`/api/products/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "iPhone 15 Pro");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update product failed");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /api/products/:id/status
  // ─────────────────────────────────────────────────────────────────────────────

  it("PATCH /api/products/:id/status should update status successfully", async () => {
    productService.updateProductStatusService.mockResolvedValueOnce({
      _id: validId,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/products/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product status updated successfully");
    expect(productService.updateProductStatusService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/products/:id/status should fail when id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/products/invalid-id/status")
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid product id format");
  });

  it("PATCH /api/products/:id/status should fail when isActive is missing", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}/status`)
      .set("x-user-role", "admin")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Status is required");
  });

  it("PATCH /api/products/:id/status should fail when isActive is not boolean", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: "yes" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid status value");
  });

  it("PATCH /api/products/:id/status should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/products/${validId}/status`)
      .set("x-user-role", "public")
      .send({ isActive: false });

    expect(res.status).toBe(401);
  });

  it("PATCH /api/products/:id/status should map NotFoundError to 404", async () => {
    productService.updateProductStatusService.mockRejectedValueOnce(
      new NotFoundError("Product not found", "No product exists", "Check id"),
    );

    const res = await request(app)
      .patch(`/api/products/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(404);
  });

  it("PATCH /api/products/:id/status should map unexpected error to 500", async () => {
    productService.updateProductStatusService.mockRejectedValueOnce(
      new Error("Unexpected"),
    );

    const res = await request(app)
      .patch(`/api/products/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update product status failed");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /api/products/:id
  // ─────────────────────────────────────────────────────────────────────────────

  it("DELETE /api/products/:id should delete product successfully", async () => {
    productService.deleteProductService.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .delete(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product deleted successfully");
    expect(productService.deleteProductService).toHaveBeenCalledTimes(1);
  });

  it("DELETE /api/products/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .delete("/api/products/invalid-id")
      .set("x-user-role", "admin");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid product id format");
  });

  it("DELETE /api/products/:id should return 401 for public user", async () => {
    const res = await request(app)
      .delete(`/api/products/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(401);
  });

  it("DELETE /api/products/:id should map NotFoundError to 404", async () => {
    productService.deleteProductService.mockRejectedValueOnce(
      new NotFoundError("Product not found", "No product exists", "Check id"),
    );

    const res = await request(app)
      .delete(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
  });

  it("DELETE /api/products/:id should map unexpected error to 500", async () => {
    productService.deleteProductService.mockRejectedValueOnce(
      new Error("Unexpected"),
    );

    const res = await request(app)
      .delete(`/api/products/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Delete product failed");
  });
});
