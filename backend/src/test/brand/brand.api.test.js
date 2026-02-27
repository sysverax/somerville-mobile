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
const brandService = require("../../services/brand.service");

const validId = "507f1f77bcf86cd799439011";

describe("Brand API tests", () => {
  const app = createApp();
  const oversizedFile = Buffer.alloc(6 * 1024 * 1024, 1); // 6MB

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/brands should create brand successfully", async () => {
    brandService.createBrandService.mockResolvedValueOnce({
      _id: validId,
      name: "Apple",
      logo: "http://img/logo.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from("fake"), "icon.png")
      .attach("bannerImage", Buffer.from("fake"), "banner.png");

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Brand created successfully");
    expect(brandService.createBrandService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/brands should fail when name is missing", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .attach("iconImage", Buffer.from("fake"), "icon.png")
      .attach("bannerImage", Buffer.from("fake"), "banner.png");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Brand name is required");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when name is empty", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "")
      .attach("iconImage", Buffer.from("fake"), "icon.png")
      .attach("bannerImage", Buffer.from("fake"), "banner.png");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Brand name is required");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when name contains only spaces", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "   ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Brand name is required");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when icon image is missing", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Icon image is required");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when icon image mime type is invalid", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from("txt"), {
        filename: "icon.txt",
        contentType: "text/plain",
      })
      .attach("bannerImage", Buffer.from("txt"), {
        filename: "banner.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Unsupported file type");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when banner image is missing", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from("fake"), "icon.png");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Banner image is required");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when banner image mime type is invalid", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from("fake"), "icon.png")
      .attach("bannerImage", Buffer.from("txt"), {
        filename: "banner.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain("Unsupported file type");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should return 401 for public user", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "public")
      .field("name", "Apple");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("GET /api/brands should return only active brands for public user", async () => {
    brandService.getAllBrandsService.mockResolvedValueOnce({
      brands: [{ id: validId, name: "Apple", isActive: true }],
      totalBrands: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/brands")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brands fetched successfully");
    expect(res.body.data.brands.every((brand) => brand.isActive)).toBe(true);
    expect(brandService.getAllBrandsService.mock.calls[0][0].userRole).toBe(
      "public",
    );
  });

  it("GET /api/brands should fail when page is invalid", async () => {
    const res = await request(app).get("/api/brands?page=0&limit=10");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid page number");
    expect(brandService.getAllBrandsService).not.toHaveBeenCalled();
  });

  it("GET /api/brands should fail when limit is invalid", async () => {
    const res = await request(app).get("/api/brands?page=1&limit=0");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid limit value");
    expect(brandService.getAllBrandsService).not.toHaveBeenCalled();
  });

  it("GET /api/brands/:id should return a single brand", async () => {
    brandService.getBrandByIdService.mockResolvedValueOnce({
      _id: validId,
      name: "Apple",
    });

    const res = await request(app).get(`/api/brands/${validId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand fetched successfully");
  });

  it("GET /api/brands/:id should fail when id format is invalid", async () => {
    const res = await request(app).get("/api/brands/invalid-id");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand id format");
    expect(brandService.getBrandByIdService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should update brand successfully", async () => {
    brandService.updateBrandService.mockResolvedValueOnce({
      _id: validId,
      name: "Updated",
    });

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated")
      .attach("iconImage", Buffer.from("fake"), "logo.png");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand updated successfully");
  });

  it("PATCH /api/brands/:id should pass when no update fields provided", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "No changes detected, brand data remains unchanged",
    );
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/brands/invalid-id")
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand id format");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "public")
      .field("name", "Updated");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id/status should update status successfully", async () => {
    brandService.updateBrandStatusService.mockResolvedValueOnce({
      _id: validId,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/brands/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand status updated successfully");
  });

  it("PATCH /api/brands/:id/status should fail when id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/brands/invalid-id/status")
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand id format");
    expect(brandService.updateBrandStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id/status should fail when isActive missing", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}/status`)
      .set("x-user-role", "admin")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Status is required");
    expect(brandService.updateBrandStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id/status should fail when isActive not boolean", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: "yes" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid status value");
    expect(brandService.updateBrandStatusService).not.toHaveBeenCalled();
  });

  it("DELETE /api/brands/:id should delete brand successfully", async () => {
    brandService.deleteBrandService.mockResolvedValueOnce({});

    const res = await request(app)
      .delete(`/api/brands/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand deleted successfully");
  });

  it("DELETE /api/brands/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .delete("/api/brands/invalid-id")
      .set("x-user-role", "admin");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand id format");
    expect(brandService.deleteBrandService).not.toHaveBeenCalled();
  });

  it("DELETE /api/brands/:id should return 401 for public user", async () => {
    const res = await request(app)
      .delete(`/api/brands/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(brandService.deleteBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should map unexpected error to 500", async () => {
    brandService.createBrandService.mockRejectedValueOnce(new Error("db down"));

    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from("fake"), "logo.png")
      .attach("bannerImage", Buffer.from("fake"), "banner.png");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Create brand failed");
  });

  it("GET /api/brands/:id should map unexpected error to 500", async () => {
    brandService.getBrandByIdService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app).get(`/api/brands/${validId}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Fetch brand failed");
  });

  it("PATCH /api/brands/:id should map unexpected error to 500", async () => {
    brandService.updateBrandService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update brand failed");
  });

  it("PATCH /api/brands/:id/status should map unexpected error to 500", async () => {
    brandService.updateBrandStatusService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .patch(`/api/brands/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: true });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update brand status failed");
  });

  it("DELETE /api/brands/:id should map unexpected error to 500", async () => {
    brandService.deleteBrandService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .delete(`/api/brands/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Delete brand failed");
  });

  it("GET /api/brands/:id should map NotFoundError to 404", async () => {
    brandService.getBrandByIdService.mockRejectedValueOnce(
      new NotFoundError("Brand not found"),
    );

    const res = await request(app).get(`/api/brands/${validId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("PATCH /api/brands/:id should map NotFoundError to 404", async () => {
    brandService.updateBrandService.mockRejectedValueOnce(
      new NotFoundError("Brand not found"),
    );

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("DELETE /api/brands/:id should map NotFoundError to 404", async () => {
    brandService.deleteBrandService.mockRejectedValueOnce(
      new NotFoundError("Brand not found"),
    );

    const res = await request(app)
      .delete(`/api/brands/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("PATCH /api/brands/:id should map ConflictError to 409", async () => {
    brandService.updateBrandService.mockRejectedValueOnce(
      new ConflictError("Brand with this name already exists"),
    );

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Apple");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Brand with this name already exists");
  });

  it("POST /api/brands should fail when icon image file size exceeds limit", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain("too large");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when banner image file size exceeds limit", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", oversizedFile, {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain("too large");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should fail when icon image file size exceeds limit", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain("too large");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should fail when banner image file size exceeds limit", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .set("x-user-role", "admin")
      .attach("bannerImage", oversizedFile, {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain("too large");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });
});
