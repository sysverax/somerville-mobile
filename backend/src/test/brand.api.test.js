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
const brandService = require("../services/brand.service");

const validId = "507f1f77bcf86cd799439011";

describe("Brand API tests", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/brands should create brand successfully", async () => {
    brandService.createBrandService.mockResolvedValueOnce({
      id: validId,
      name: "Nike",
      description: "Desc",
      iconImageUrl: "https://example.com/icon.png",
      bannerImageUrl: "https://example.com/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: "Nike", description: "Desc" }))
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Brand created successfully");
    expect(brandService.createBrandService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/brands should fail when name is missing", async () => {
    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ description: "Desc" }))
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

  it("POST /api/brands should fail when name is empty", async () => {
    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: "", description: "Desc" }))
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

  it("POST /api/brands should fail when name is only spaces", async () => {
    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: "   ", description: "Desc" }))
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

  it("POST /api/brands should fail when name is not a string", async () => {
    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: 5, description: "Desc" }))
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand name");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when images are missing", async () => {
    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: "Nike", description: "Desc" }));

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Icon image is required");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should fail when image file type is invalid", async () => {
    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: "Nike", description: "Desc" }))
      .attach("iconImage", Buffer.from("not-an-image"), {
        filename: "icon.txt",
        contentType: "text/plain",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Unsupported file type");
    expect(brandService.createBrandService).not.toHaveBeenCalled();
  });

  it("POST /api/brands should return conflict for duplicate brand name", async () => {
    brandService.createBrandService.mockRejectedValueOnce(
      new appError.ConflictError(
        "Brand already exists ",
        "duplicate",
        "use different",
      ),
    );

    const res = await request(app)
      .post("/api/brands")
      .field("body", JSON.stringify({ name: "Nike", description: "Desc" }))
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain("Brand already exists");
  });

  it("GET /api/brands should fetch list successfully", async () => {
    brandService.getAllBrandsService.mockResolvedValueOnce({
      items: [{ id: validId, name: "Nike", isActive: true }],
      total: 1,
      page: 1,
      limit: 10,
    });

    const res = await request(app)
      .get("/api/brands?page=1&limit=10")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brands fetched successfully");
    expect(brandService.getAllBrandsService).toHaveBeenCalledTimes(1);
  });

  it("GET /api/brands should validate page", async () => {
    const invalidPage = await request(app)
      .get("/api/brands?page=0&limit=10")
      .set("x-user-role", "public");

    expect(invalidPage.status).toBe(400);
    expect(invalidPage.body.message).toBe("Invalid page number");
  });

  it("GET /api/brands should validate limit", async () => {
    const invalidLimit = await request(app)
      .get("/api/brands?page=1&limit=101")
      .set("x-user-role", "public");

    expect(invalidLimit.status).toBe(400);
    expect(invalidLimit.body.message).toBe("Invalid limit value");
  });

  it("GET /api/brands/:id should validate mongoose id", async () => {
    const res = await request(app)
      .get("/api/brands/not-valid-id")
      .set("x-user-role", "public");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand id");
    expect(brandService.getBrandByIdService).not.toHaveBeenCalled();
  });

  it("GET /api/brands/:id should return 404 when brand does not exist", async () => {
    brandService.getBrandByIdService.mockRejectedValueOnce(
      new appError.NotFoundError("Brand not found", "missing", "check id"),
    );

    const res = await request(app)
      .get(`/api/brands/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("GET /api/brands/:id should fetch brand successfully", async () => {
    brandService.getBrandByIdService.mockResolvedValueOnce({
      id: validId,
      name: "Nike",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/brands/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand fetched successfully");
    expect(brandService.getBrandByIdService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/brands/:id should validate id and status value", async () => {
    const invalidId = await request(app)
      .patch("/api/brands/not-valid-id")
      .send({ isActive: true });

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid brand id");

    const invalidStatus = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ isActive: "active" });

    expect(invalidStatus.status).toBe(400);
    expect(invalidStatus.body.message).toBe("Invalid status value");
  });

  it("PATCH /api/brands/:id should fail when name is empty", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand name");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should fail when name is only spaces", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ name: "   " });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand name");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should fail when name is not a string", async () => {
    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ name: 5 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid brand name");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should return no-change response when payload is empty", async () => {
    const res = await request(app).patch(`/api/brands/${validId}`).send({});

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("No changes detected");
    expect(brandService.updateBrandService).not.toHaveBeenCalled();
  });

  it("PATCH /api/brands/:id should return conflict when name is duplicate", async () => {
    brandService.updateBrandService.mockRejectedValueOnce(
      new appError.ConflictError(
        "Brand name conflict",
        "duplicate",
        "use different",
      ),
    );

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ name: "Nike" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Brand name conflict");
  });

  it("PATCH /api/brands/:id should return 404 when brand does not exist", async () => {
    brandService.updateBrandService.mockRejectedValueOnce(
      new appError.NotFoundError("Brand not found", "missing", "check id"),
    );

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("PATCH /api/brands/:id should update brand successfully", async () => {
    brandService.updateBrandService.mockResolvedValueOnce({
      id: validId,
      name: "Updated Name",
      description: "Updated",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/brands/${validId}`)
      .send({ name: "Updated Name", description: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand updated successfully");
    expect(brandService.updateBrandService).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/brands/:id/status should validate id and status", async () => {
    const invalidId = await request(app)
      .patch("/api/brands/not-valid-id/status")
      .send({ isActive: true });

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid brand id");

    const missingStatus = await request(app)
      .patch(`/api/brands/${validId}/status`)
      .send({});

    expect(missingStatus.status).toBe(400);
    expect(missingStatus.body.message).toBe("Status value is required");
  });

  it("PATCH /api/brands/:id/status should update status successfully", async () => {
    brandService.updateBrandStatusService.mockResolvedValueOnce({
      id: validId,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/brands/${validId}/status`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand status updated successfully");
    expect(brandService.updateBrandStatusService).toHaveBeenCalledTimes(1);
  });

  it("DELETE /api/brands/:id should validate id and return 404 for missing brand", async () => {
    const invalidId = await request(app).delete("/api/brands/not-valid-id");

    expect(invalidId.status).toBe(400);
    expect(invalidId.body.message).toBe("Invalid brand id");

    brandService.deleteBrandService.mockRejectedValueOnce(
      new appError.NotFoundError("Brand not found", "missing", "check id"),
    );

    const notFound = await request(app).delete(`/api/brands/${validId}`);

    expect(notFound.status).toBe(404);
    expect(notFound.body.message).toBe("Brand not found");
  });

  it("DELETE /api/brands/:id should delete brand successfully", async () => {
    brandService.deleteBrandService.mockResolvedValueOnce();

    const res = await request(app).delete(`/api/brands/${validId}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand deleted successfully");
    expect(brandService.deleteBrandService).toHaveBeenCalledTimes(1);
  });
});
