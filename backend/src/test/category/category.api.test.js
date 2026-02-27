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

jest.mock("../../services/auth.service", () => ({
  adminRegisterService: jest.fn(),
  adminLoginService: jest.fn(),
}));

const { createApp } = require("../../app");
const categoryService = require("../../services/category.service");

const validId = "507f1f77bcf86cd799439011";
const validBrandId = "507f1f77bcf86cd799439022";

describe("Category API tests", () => {
  const app = createApp();
  const oversizedFile = Buffer.alloc(6 * 1024 * 1024, 1); // 6MB

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/categories should create category successfully", async () => {
    categoryService.createCategoryService.mockResolvedValueOnce({
      _id: validId,
      brandId: validBrandId,
      name: "Phones",
      iconImage: "http://img/logo.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "Phones")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Category created successfully");
    expect(categoryService.createCategoryService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/categories should fail when brandId is missing", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("name", "Phones")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Brand ID is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when brandId format is invalid", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", "invalid-id")
      .field("name", "Phones")
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
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
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
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Category name is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when name contains only spaces", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "   ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Category name is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when icon image is missing", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "Phones");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Icon image is required");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should fail when image mime type is invalid", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "Phones")
      .attach("iconImage", Buffer.from("txt"), {
        filename: "icon.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Unsupported file type");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should return 401 for public user", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "public")
      .field("name", "Phones")
      .field("brandId", validBrandId);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("GET /api/categories should return categories with filters", async () => {
    categoryService.getAllCategoriesService.mockResolvedValueOnce({
      data: [{ _id: validId, name: "Phones" }],
      total: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app).get(
      `/api/categories?brandId=${validBrandId}&name=ph&page=1&limit=10`,
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(categoryService.getAllCategoriesService).toHaveBeenCalled();
    expect(
      categoryService.getAllCategoriesService.mock.calls[0][0],
    ).toMatchObject({
      brandId: validBrandId,
      page: 1,
      limit: 10,
      userRole: "public",
    });
  });

  it("GET /api/categories should return only active categories for public user", async () => {
    categoryService.getAllCategoriesService.mockResolvedValueOnce({
      categories: [{ id: validId, name: "Phones", isActive: true }],
      totalCategories: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get(`/api/categories?brandId=${validBrandId}&page=1&limit=10`)
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(
      res.body.data.categories.every((category) => category.isActive),
    ).toBe(true);
    expect(
      categoryService.getAllCategoriesService.mock.calls[0][0].userRole,
    ).toBe("public");
  });

  it("GET /api/categories should not return categories from inactive brand for public user", async () => {
    categoryService.getAllCategoriesService.mockResolvedValueOnce({
      categories: [
        { id: validId, brandId: validBrandId, name: "Phones", isActive: true },
      ],
      totalCategories: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/categories?page=1&limit=10")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(res.body.data.categories.length).toBe(1);
    expect(
      categoryService.getAllCategoriesService.mock.calls[0][0].userRole,
    ).toBe("public");
  });

  it("GET /api/categories should fail when page is invalid", async () => {
    const res = await request(app).get("/api/categories?page=0");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid page number");
    expect(categoryService.getAllCategoriesService).not.toHaveBeenCalled();
  });

  it("GET /api/categories should fail when limit is invalid", async () => {
    const res = await request(app).get("/api/categories?limit=0");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid limit value");
    expect(categoryService.getAllCategoriesService).not.toHaveBeenCalled();
  });

  it("GET /api/categories should fail when brandId is invalid", async () => {
    const res = await request(app).get("/api/categories?brandId=invalid-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Brand ID format");
    expect(categoryService.getAllCategoriesService).not.toHaveBeenCalled();
  });

  it("GET /api/categories/:id should return a single category", async () => {
    categoryService.getCategoryByIdService.mockResolvedValueOnce({
      _id: validId,
      name: "Phones",
    });

    const res = await request(app).get(`/api/categories/${validId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category fetched successfully");
  });

  it("GET /api/categories/:id should fail when id format is invalid", async () => {
    const res = await request(app).get("/api/categories/invalid-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Category ID format");
    expect(categoryService.getCategoryByIdService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should update category successfully", async () => {
    categoryService.updateCategoryService.mockResolvedValueOnce({
      _id: validId,
      name: "Updated",
    });

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "Updated")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category updated successfully");
  });

  it("PATCH /api/categories/:id should fail when no update fields provided", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "No changes detected, category data remains unchanged",
    );
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should fail when category id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/categories/invalid-id")
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Category ID format");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should fail when category id format is invalid", async () => {
    const res = await request(app)
      .patch(`/api/categories/invalid-id`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Category ID format");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should fail when brand id format is invalid", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .field("brandId", "invalid-id")
      .field("name", "Updated")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Brand ID format");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "public")
      .field("name", "Updated");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id/status should update status successfully", async () => {
    categoryService.updateCategoryStatusService.mockResolvedValueOnce({
      _id: validId,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category status updated successfully");
  });

  it("PATCH /api/categories/:id/status should fail when id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/categories/invalid-id/status")
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Category ID format");
    expect(categoryService.updateCategoryStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id/status should fail when isActive missing", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .set("x-user-role", "admin")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Status value is required");
    expect(categoryService.updateCategoryStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id/status should fail when isActive not boolean", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: "yes" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid status value");
    expect(categoryService.updateCategoryStatusService).not.toHaveBeenCalled();
  });

  it("DELETE /api/categories/:id should delete category successfully", async () => {
    categoryService.deleteCategoryService.mockResolvedValueOnce({});

    const res = await request(app)
      .delete(`/api/categories/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category deleted successfully");
  });

  it("DELETE /api/categories/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .delete("/api/categories/invalid-id")
      .set("x-user-role", "admin");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Category ID format");
    expect(categoryService.deleteCategoryService).not.toHaveBeenCalled();
  });

  it("DELETE /api/categories/:id should return 401 for public user", async () => {
    const res = await request(app)
      .delete(`/api/categories/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(categoryService.deleteCategoryService).not.toHaveBeenCalled();
  });

  it("POST /api/categories should map unexpected error to 500", async () => {
    categoryService.createCategoryService.mockRejectedValueOnce(
      new Error("db down"),
    );

    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "Phones")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Create category failed");
  });

  it("GET /api/categories should map unexpected error to 500", async () => {
    categoryService.getAllCategoriesService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Fetch categories failed");
  });

  it("GET /api/categories/:id should map unexpected error to 500", async () => {
    categoryService.getCategoryByIdService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app).get(`/api/categories/${validId}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Fetch category failed");
  });

  it("PATCH /api/categories/:id should map unexpected error to 500", async () => {
    categoryService.updateCategoryService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update category failed");
  });

  it("PATCH /api/categories/:id/status should map unexpected error to 500", async () => {
    categoryService.updateCategoryStatusService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: true });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update category status failed");
  });

  it("DELETE /api/categories/:id should map unexpected error to 500", async () => {
    categoryService.deleteCategoryService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .delete(`/api/categories/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Delete category failed");
  });

  it("GET /api/categories/:id should map NotFoundError to 404", async () => {
    categoryService.getCategoryByIdService.mockRejectedValueOnce(
      new NotFoundError("Category not found"),
    );

    const res = await request(app).get(`/api/categories/${validId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });

  it("PATCH /api/categories/:id should map NotFoundError to 404", async () => {
    categoryService.updateCategoryService.mockRejectedValueOnce(
      new NotFoundError("Category not found"),
    );

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });

  it("DELETE /api/categories/:id should map NotFoundError to 404", async () => {
    categoryService.deleteCategoryService.mockRejectedValueOnce(
      new NotFoundError("Category not found"),
    );

    const res = await request(app)
      .delete(`/api/categories/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Category not found");
  });

  it("PATCH /api/categories/:id should map ConflictError to 409", async () => {
    categoryService.updateCategoryService.mockRejectedValueOnce(
      new ConflictError(
        "Category with this name already exists for the selected brand",
      ),
    );

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Phones")
      .field("brandId", validBrandId);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(
      "Category with this name already exists for the selected brand",
    );
  });

  it("POST /api/categories should fail when iconImage file size exceeds limit", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", validBrandId)
      .field("name", "Phones")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain("too large");
    expect(categoryService.createCategoryService).not.toHaveBeenCalled();
  });

  it("GET /api/categories should return categories successfully with no query params", async () => {
    categoryService.getAllCategoriesService.mockResolvedValueOnce({
      categories: [{ _id: validId, name: "Phones", isActive: true }],
      totalCategories: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(categoryService.getAllCategoriesService).toHaveBeenCalledTimes(1);
  });

  it("GET /api/categories should return active + inactive categories for admin user", async () => {
    categoryService.getAllCategoriesService.mockResolvedValueOnce({
      categories: [
        { _id: validId, name: "Phones", isActive: true },
        { _id: "507f1f77bcf86cd799439012", name: "Legacy", isActive: false },
      ],
      totalCategories: 2,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/categories?page=1&limit=10")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Categories fetched successfully");
    expect(
      categoryService.getAllCategoriesService.mock.calls[0][0].userRole,
    ).toBe("admin");
  });

  it("PATCH /api/categories/:id should update description only", async () => {
    categoryService.updateCategoryService.mockResolvedValueOnce({
      _id: validId,
      description: "Updated desc",
    });

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .field("description", "Updated desc");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category updated successfully");
  });

  it("PATCH /api/categories/:id should update icon image successfully", async () => {
    categoryService.updateCategoryService.mockResolvedValueOnce({
      _id: validId,
      name: "Phones",
    });

    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Category updated successfully");
  });

  it("PATCH /api/categories/:id should fail when iconImage file size exceeds limit", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain("too large");
    expect(categoryService.updateCategoryService).not.toHaveBeenCalled();
  });

  it("PATCH /api/categories/:id/status should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/categories/${validId}/status`)
      .set("x-user-role", "public")
      .send({ isActive: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(categoryService.updateCategoryStatusService).not.toHaveBeenCalled();
  });
});
