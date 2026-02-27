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

jest.mock(
  "../../services/series.service",
  () => ({
    createSeriesService: jest.fn(),
    getAllSeriesService: jest.fn(),
    getSeriesByIdService: jest.fn(),
    updateSeriesService: jest.fn(),
    updateSeriesStatusService: jest.fn(),
    deleteSeriesService: jest.fn(),
  }),
  { virtual: true },
);

const { createApp } = require("../../app");
const seriesService = require("../../services/series.service");

const validId = "507f1f77bcf86cd799439011";
const validCategoryId = "507f1f77bcf86cd799439022";
const validBrandId = "507f1f77bcf86cd799439033";

describe("Series API tests", () => {
  const app = createApp();
  const oversizedFile = Buffer.alloc(6 * 1024 * 1024, 1); // 6MB

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /api/series should create series successfully", async () => {
    seriesService.createSeriesService.mockResolvedValueOnce({
      _id: validId,
      categoryId: validCategoryId,
      name: "Galaxy",
      imageUrl: "http://img/galaxy.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Series created successfully");
    expect(seriesService.createSeriesService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/series should fail when categoryId is missing", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when categoryId format is invalid", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", "invalid-id")
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when name is missing", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when name is empty", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when name contains only spaces", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "   ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when icon image is missing", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "Galaxy");

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when icon image mime type is invalid", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from("txt"), {
        filename: "icon.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should fail when icon image file size exceeds limit", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "Galaxy")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should return 401 for public user", async () => {
    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "public")
      .field("categoryId", validCategoryId)
      .field("name", "Galaxy");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(seriesService.createSeriesService).not.toHaveBeenCalled();
  });

  it("GET /api/series should return series with filters", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, name: "Galaxy" }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app).get(
      `/api/series?categoryId=${validCategoryId}&brandId=${validBrandId}&name=gal&page=1&limit=10`,
    );

    expect(res.status).toBe(200);
    expect(seriesService.getAllSeriesService).toHaveBeenCalled();
  });

  it("GET /api/series should return series with no query params", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, name: "Galaxy" }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app).get("/api/series");

    expect(res.status).toBe(200);
    expect(seriesService.getAllSeriesService).toHaveBeenCalledTimes(1);
  });

  it("GET /api/series should filter by categoryId correctly", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, categoryId: validCategoryId, name: "Galaxy" }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app).get(
      `/api/series?categoryId=${validCategoryId}`,
    );

    expect(res.status).toBe(200);
    expect(seriesService.getAllSeriesService.mock.calls[0][0].categoryId).toBe(
      validCategoryId,
    );
  });

  it("GET /api/series should filter by brandId correctly", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, name: "Galaxy" }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app).get(`/api/series?brandId=${validBrandId}`);

    expect(res.status).toBe(200);
    expect(seriesService.getAllSeriesService.mock.calls[0][0].brandId).toBe(
      validBrandId,
    );
  });

  it("GET /api/series should return only active series for public user", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, name: "Galaxy", isActive: true }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/series")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(seriesService.getAllSeriesService.mock.calls[0][0].userRole).toBe(
      "public",
    );
  });

  it("GET /api/series should hide series under inactive category for public", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, name: "Galaxy", isActive: true }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/series?page=1&limit=10")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
  });

  it("GET /api/series should hide series under inactive brand for public", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [{ _id: validId, name: "Galaxy", isActive: true }],
      totalSeries: 1,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/series?page=1&limit=10")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
  });

  it("GET /api/series should return active + inactive for admin", async () => {
    seriesService.getAllSeriesService.mockResolvedValueOnce({
      series: [
        { _id: validId, name: "Galaxy", isActive: true },
        { _id: "507f1f77bcf86cd799439044", name: "Old", isActive: false },
      ],
      totalSeries: 2,
      currentPage: 1,
      pageSize: 10,
    });

    const res = await request(app)
      .get("/api/series?page=1&limit=10")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(seriesService.getAllSeriesService.mock.calls[0][0].userRole).toBe(
      "admin",
    );
  });

  it("GET /api/series should fail when categoryId format is invalid", async () => {
    const res = await request(app).get("/api/series?categoryId=invalid-id");

    expect(res.status).toBe(400);
    expect(seriesService.getAllSeriesService).not.toHaveBeenCalled();
  });

  it("GET /api/series should fail when brandId format is invalid", async () => {
    const res = await request(app).get("/api/series?brandId=invalid-id");

    expect(res.status).toBe(400);
    expect(seriesService.getAllSeriesService).not.toHaveBeenCalled();
  });

  it("GET /api/series should fail when page is invalid", async () => {
    const res = await request(app).get("/api/series?page=0");

    expect(res.status).toBe(400);
    expect(seriesService.getAllSeriesService).not.toHaveBeenCalled();
  });

  it("GET /api/series should fail when limit is invalid", async () => {
    const res = await request(app).get("/api/series?limit=0");

    expect(res.status).toBe(400);
    expect(seriesService.getAllSeriesService).not.toHaveBeenCalled();
  });

  it("GET /api/series/:id should return series successfully", async () => {
    seriesService.getSeriesByIdService.mockResolvedValueOnce({
      _id: validId,
      name: "Galaxy",
    });

    const res = await request(app).get(`/api/series/${validId}`);

    expect(res.status).toBe(200);
  });

  it("GET /api/series/:id should fail when id format is invalid", async () => {
    const res = await request(app).get("/api/series/invalid-id");

    expect(res.status).toBe(400);
    expect(seriesService.getSeriesByIdService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id should update series successfully", async () => {
    seriesService.updateSeriesService.mockResolvedValueOnce({
      _id: validId,
      name: "Updated",
    });

    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "Updated")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
  });

  it("PATCH /api/series/:id should return no-change success when no fields provided", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(seriesService.updateSeriesService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id should fail when series id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/series/invalid-id")
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(400);
    expect(seriesService.updateSeriesService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id should fail when categoryId format is invalid", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .field("categoryId", "invalid-id")
      .field("name", "Updated");

    expect(res.status).toBe(400);
    expect(seriesService.updateSeriesService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "public")
      .field("name", "Updated");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(seriesService.updateSeriesService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id should update description only", async () => {
    seriesService.updateSeriesService.mockResolvedValueOnce({
      _id: validId,
      description: "Updated description",
    });

    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .field("description", "Updated description");

    expect(res.status).toBe(200);
  });

  it("PATCH /api/series/:id should update icon image successfully", async () => {
    seriesService.updateSeriesService.mockResolvedValueOnce({
      _id: validId,
      name: "Galaxy",
    });

    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
  });

  it("PATCH /api/series/:id should fail when iconImage file size exceeds limit", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .attach("iconImage", oversizedFile, {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(400);
    expect(seriesService.updateSeriesService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id/status should update status successfully", async () => {
    seriesService.updateSeriesStatusService.mockResolvedValueOnce({
      _id: validId,
      isActive: false,
    });

    const res = await request(app)
      .patch(`/api/series/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(200);
  });

  it("PATCH /api/series/:id/status should fail when id format is invalid", async () => {
    const res = await request(app)
      .patch("/api/series/invalid-id/status")
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(seriesService.updateSeriesStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id/status should fail when isActive is missing", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}/status`)
      .set("x-user-role", "admin")
      .send({});

    expect(res.status).toBe(400);
    expect(seriesService.updateSeriesStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id/status should fail when isActive is not boolean", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: "yes" });

    expect(res.status).toBe(400);
    expect(seriesService.updateSeriesStatusService).not.toHaveBeenCalled();
  });

  it("PATCH /api/series/:id/status should return 401 for public user", async () => {
    const res = await request(app)
      .patch(`/api/series/${validId}/status`)
      .set("x-user-role", "public")
      .send({ isActive: true });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(seriesService.updateSeriesStatusService).not.toHaveBeenCalled();
  });

  it("DELETE /api/series/:id should delete series successfully", async () => {
    seriesService.deleteSeriesService.mockResolvedValueOnce({});

    const res = await request(app)
      .delete(`/api/series/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
  });

  it("DELETE /api/series/:id should fail when id format is invalid", async () => {
    const res = await request(app)
      .delete("/api/series/invalid-id")
      .set("x-user-role", "admin");

    expect(res.status).toBe(400);
    expect(seriesService.deleteSeriesService).not.toHaveBeenCalled();
  });

  it("DELETE /api/series/:id should return 401 for public user", async () => {
    const res = await request(app)
      .delete(`/api/series/${validId}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access token missing");
    expect(seriesService.deleteSeriesService).not.toHaveBeenCalled();
  });

  it("POST /api/series should map unexpected error to 500", async () => {
    seriesService.createSeriesService.mockRejectedValueOnce(
      new Error("db down"),
    );

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", validCategoryId)
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(500);
  });

  it("GET /api/series should map unexpected error to 500", async () => {
    seriesService.getAllSeriesService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app).get("/api/series");

    expect(res.status).toBe(500);
  });

  it("GET /api/series/:id should map unexpected error to 500", async () => {
    seriesService.getSeriesByIdService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app).get(`/api/series/${validId}`);

    expect(res.status).toBe(500);
  });

  it("PATCH /api/series/:id should map unexpected error to 500", async () => {
    seriesService.updateSeriesService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(500);
  });

  it("PATCH /api/series/:id/status should map unexpected error to 500", async () => {
    seriesService.updateSeriesStatusService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .patch(`/api/series/${validId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: true });

    expect(res.status).toBe(500);
  });

  it("DELETE /api/series/:id should map unexpected error to 500", async () => {
    seriesService.deleteSeriesService.mockRejectedValueOnce(
      new Error("unexpected"),
    );

    const res = await request(app)
      .delete(`/api/series/${validId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(500);
  });

  it("GET /api/series/:id should map NotFoundError to 404", async () => {
    seriesService.getSeriesByIdService.mockRejectedValueOnce(
      new NotFoundError("Series not found"),
    );

    const res = await request(app).get(`/api/series/${validId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Series not found");
  });

  it("PATCH /api/series/:id should map NotFoundError to 404", async () => {
    seriesService.updateSeriesService.mockRejectedValueOnce(
      new NotFoundError("Series not found"),
    );

    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Series not found");
  });

  it("PATCH /api/series/:id should map ConflictError to 409", async () => {
    seriesService.updateSeriesService.mockRejectedValueOnce(
      new ConflictError(
        "Series with this name already exists for the selected category",
      ),
    );

    const res = await request(app)
      .patch(`/api/series/${validId}`)
      .set("x-user-role", "admin")
      .field("name", "Galaxy")
      .field("categoryId", validCategoryId);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe(
      "Series with this name already exists for the selected category",
    );
  });
});
