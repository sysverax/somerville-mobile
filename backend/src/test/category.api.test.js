const request = require("supertest");
const appError = require("../utils/errors/errors");

jest.mock("uuid", () => ({
  v4: () => "test-request-id",
}));

jest.mock("../middlewares/auth.middleware", () => ({
  validateAdmin: (req, res, next) => {
    req.userRole = "admin";
    next();
  },
  validateRoleBasedHeader: (req, res, next) => {
    req.userRole = req.headers["x-user-role"] || "public";
    next();
  },
}));

jest.mock("../services/brand.service", () => ({
  createBrandService: jest.fn(),
  getAllBrandsService: jest.fn(),
  getBrandByIdService: jest.fn(),
  updateBrandService: jest.fn(),
  updateBrandStatusService: jest.fn(),
  deleteBrandService: jest.fn(),
}));

jest.mock("../services/category.service", () => ({
  createCategoryService: jest.fn(),
  updateCategoryService: jest.fn(),
  updateCategoryStatusService: jest.fn(),
  getAllCategoriesService: jest.fn(),
  getCategoryByIdService: jest.fn(),
  deleteCategoryService: jest.fn(),
}));

jest.mock("../services/auth.service", () => ({
  adminRegisterService: jest.fn(),
  adminLoginService: jest.fn(),
}));

const { createApp } = require("../app");
const categoryService = require("../services/category.service");

const validId = "507f1f77bcf86cd799439011";

describe("Category API tests", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/categories should create category successfully", async () => {
    categoryService.createCategoryService.mockResolvedValueOnce({
      id: validId,
      brandId: validId,
      name: "SUV",
      description: "Desc",
      imageUrl: "https://example.com/suv.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/categories")
      .field(
        "body",
        JSON.stringify({
          name: "SUV",
          brandId: validId,
          description: "Desc",
        }),
      )
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Category created successfully");
    expect(categoryService.createCategoryService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/categories should validate brand id", async () => {
    const res = await request(app)
      .post("/api/categories")
      .field("body", JSON.stringify({ name: "SUV", brandId: "invalid" }))
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Brand ID format");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when name is missing", async () => {
    const res = await request(app)
      .post("/api/categories")
      .field("body", JSON.stringify({ brandId: validId, description: "Desc" }))
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Category name is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when name is empty", async () => {
    const res = await request(app)
      .post("/api/categories")
      .field(
        "body",
        JSON.stringify({ name: "", brandId: validId, description: "Desc" }),
      )
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Category name is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when name is only spaces", async () => {
    const res = await request(app)
      .post("/api/categories")
      .field(
        "body",
        JSON.stringify({ name: "   ", brandId: validId, description: "Desc" }),
      )
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Category name is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when name is not a string", async () => {
    const res = await request(app)
      .post("/api/categories")
      .field(
        "body",
        JSON.stringify({ name: 5, brandId: validId, description: "Desc" }),
      )
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid category name");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should return conflict for duplicate name within brand", async () => {
    categoryService.createCategoryService.mockRejectedValueOnce(
      new appError.ConflictError(
        "Category already exists ",
        "duplicate",
        "use different",
      ),
    );

    const res = await request(app)
      .post("/api/categories")
      .field(
        "body",
        JSON.stringify({
          name: "SUV",
          brandId: validId,
          description: "desc",
        }),
      )
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Category already exists");
  });

  it("GET /api/categories should fetch list successfully", async () => {
    categoryService.getAllCategoriesService.mockResolvedValueOnce({
      items: [{ id: validId, name: "SUV", brandId: validId, isActive: true }],
      total: 1,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get(`/api/categories?brandId=${validId}&page=1&limit=10`)
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(categoryService.getAllCategoriesService).toHaveBeenCalledTimes(1);
  });

  it("GET /api/categories should validate filter/pagination", async () => {
    const invalidBrand = await request(app)
      .get("/api/categories?brandId=invalid")
      .set("x-user-role", "public");

    expect(invalidBrand.status).toBe(400);
    expect(invalidBrand.body.message).toBe("Invalid Brand ID format");

    const invalidPage = await request(app)
      .get("/api/categories?page=0&limit=10")
      .set("x-user-role", "public");

    expect(invalidPage.status).toBe(400);
    expect(invalidPage.body.message).toBe("Invalid page number");
  });

  it("GET /api/categories/:id should validate id and return 404 for missing category", async () => {
    const invalidId = await request(app)
      .get("/api/categories/not-valid-id")
      .set("x-user-role", "public");

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid category id");

    categoryService.getCategoryByIdService.mockRejectedValueOnce(
      new appError.NotFoundError("Category not found", "missing", "check id"),
    );

    const notFound = await request(app)
      .get(`/api/categories/${validId}`)
      .set("x-user-role", "public");

    expect(notFound.status).toBe(404);
    expect(notFound.body.message).toBe("Category not found");
  });

  it("GET /api/categories/:id should fetch category successfully", async () => {
    categoryService.getCategoryByIdService.mockResolvedValueOnce({
      id: validId,
      brandId: validId,
      name: "SUV",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/categories/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category fetched successfully");
    expect(categoryService.getCategoryByIdService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/categories/:id should validate id and status value", async () => {
    const invalidId = await request(app)
      .patch("/api/categories/not-valid-id")
      .send({ isActive: true });

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid category id");

    const invalidStatus = await request(app)
      .patch(`/api/categories/${validId}`)
      .send({ isActive: "active" });

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe("Invalid status value");
  });

  it("PATCH /api/categories/:id should fail when name is empty", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid category name");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should fail when name is only spaces", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .send({ name: "   " });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid category name");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should fail when name is not a string", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .send({ name: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid category name");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should return no-change response for empty payload", async () => {
    const res = await request(app).patch(`/api/categories/${validId}`).send({});

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("No changes detected");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should return conflict when name is duplicate", async () => {
    categoryService.updateCategoryService.mockRejectedValueOnce(
      new appError.ConflictError(
        "Category name conflict",
        "duplicate",
        "use different",
      ),
    );

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .send({ name: "SUV" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Category name conflict");
  });

  it("PATCH /api/categories/:id should update category successfully", async () => {
    categoryService.updateCategoryService.mockResolvedValueOnce({
      id: validId,
      name: "SUV Updated",
      description: "Updated",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .send({ name: "SUV Updated", description: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category updated successfully");
    expect(categoryService.updateCategoryService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/categories/:id/status should validate id and status", async () => {
    const invalidId = await request(app)
      .patch("/api/categories/not-valid-id/status")
      .send({ isActive: true });

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid category id");

    const missingStatus = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .send({});

    expect(missingStatus.status).toBe(400);
    expect(missingStatus.body.message).toBe("Status value is required");
  });

  it("PATCH /api/categories/:id/status should update status successfully", async () => {
    categoryService.updateCategoryStatusService.mockResolvedValueOnce({
      id: validId,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category status updated successfully");
    expect(categoryService.updateCategoryStatusService).toHaveBeenCalledTimes(
      1,
    );
  });

  it("DELETE /api/categories/:id should validate id and return 404 for missing category", async () => {
    const invalidId = await request(app).delete("/api/categories/not-valid-id");

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid category id");

    categoryService.deleteCategoryService.mockRejectedValueOnce(
      new appError.NotFoundError("Category not found", "missing", "check id"),
    );

    const notFound = await request(app).delete(`/api/categories/${validId}`);

    expect(notFound.status).toBe(404);
    expect(notFound.body.message).toBe("Category not found");
  });

  it("DELETE /api/categories/:id should delete category successfully", async () => {
    categoryService.deleteCategoryService.mockResolvedValueOnce();

    const res = await request(app).delete(`/api/categories/${validId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category deleted successfully");
    expect(categoryService.deleteCategoryService).toHaveBeenCalledTimes(1);
  });
});
