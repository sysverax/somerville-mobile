const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../utils/aws/s3Utils", () => ({
  uploadFileToS3: jest.fn(
    async ({ file, folder }) => `${folder}/${file.originalname}`,
  ),
  deleteImageFromS3: jest.fn(async () => true),
}));

jest.mock("uuid", () => ({
  v4: () => "test-request-id",
}));

jest.mock("../../middlewares/auth.middleware", () => ({
  validateAdmin: (req, res, next) => {
    if (req.headers["x-user-role"] !== "admin") {
      const { UnauthorizedError } = require("../../utils/errors/errors");
      return next(
        new UnauthorizedError(
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

const { createApp } = require("../../app");
const Brand = require("../../models/brand");
const Category = require("../../models/category");
const Series = require("../../models/series");

describe("Series DB integration tests", () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp();
  });

  beforeEach(async () => {
    await Series.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  const seedCategory = async ({
    brandName = "Apple",
    brandActive = true,
    categoryName = "Phones",
    categoryActive = true,
  } = {}) => {
    const brand = await Brand.create({
      name: brandName,
      iconImageUrl: `brands/${brandName.toLowerCase()}/icon.png`,
      bannerImageUrl: `brands/${brandName.toLowerCase()}/banner.png`,
      isActive: brandActive,
    });

    const category = await Category.create({
      brandId: brand._id,
      name: categoryName,
      imageUrl: `categories/${categoryName.toLowerCase()}.png`,
      isActive: categoryActive,
    });

    return { brand, category };
  };

  it("POST /api/series should create series under valid category", async () => {
    const { category } = await seedCategory();

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", category._id.toString())
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Galaxy");
  });

  it("POST /api/series should return 404 if category does not exist", async () => {
    const categoryId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", categoryId)
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(404);
  });

  it("POST /api/series should trim name before saving", async () => {
    const { category } = await seedCategory();

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", category._id.toString())
      .field("name", " Galaxy ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Galaxy");
  });

  it("POST /api/series should return 409 for case-insensitive duplicate under same category", async () => {
    const { category } = await seedCategory();

    await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", category._id.toString())
      .field("name", "galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
  });

  it("POST /api/series should allow same series name under different categories", async () => {
    const { category: categoryA } = await seedCategory({
      brandName: "Apple",
      categoryName: "Phones",
    });
    const { category: categoryB } = await seedCategory({
      brandName: "Samsung",
      categoryName: "Tablets",
    });

    await Series.create({
      categoryId: categoryA._id,
      name: "Galaxy",
      imageUrl: "series/galaxy-a.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/series")
      .set("x-user-role", "admin")
      .field("categoryId", categoryB._id.toString())
      .field("name", "Galaxy")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
  });

  it("GET /api/series should hide inactive series/category/brand combinations for public", async () => {
    const { category: categoryVisible } = await seedCategory({
      brandName: "VisibleBrand",
      brandActive: true,
      categoryName: "VisibleCategory",
      categoryActive: true,
    });

    const { category: categoryInactive } = await seedCategory({
      brandName: "Brand2",
      brandActive: true,
      categoryName: "InactiveCategory",
      categoryActive: false,
    });

    const { category: brandInactiveCategory } = await seedCategory({
      brandName: "InactiveBrand",
      brandActive: false,
      categoryName: "ActiveCategory",
      categoryActive: true,
    });

    await Series.create({
      categoryId: categoryVisible._id,
      name: "VisibleSeries",
      imageUrl: "series/visible.png",
      isActive: true,
    });
    await Series.create({
      categoryId: categoryVisible._id,
      name: "HiddenSeries",
      imageUrl: "series/hidden.png",
      isActive: false,
    });
    await Series.create({
      categoryId: categoryInactive._id,
      name: "HiddenByCategory",
      imageUrl: "series/hidden-category.png",
      isActive: true,
    });
    await Series.create({
      categoryId: brandInactiveCategory._id,
      name: "HiddenByBrand",
      imageUrl: "series/hidden-brand.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/series")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    const names = res.body.data.series.map((series) => series.name);
    expect(names).toContain("VisibleSeries");
    expect(names).not.toContain("HiddenSeries");
    expect(names).not.toContain("HiddenByCategory");
    expect(names).not.toContain("HiddenByBrand");
  });

  it("GET /api/series should return active + inactive for admin", async () => {
    const { category } = await seedCategory({
      brandActive: false,
      categoryActive: false,
    });

    await Series.create({
      categoryId: category._id,
      name: "A",
      imageUrl: "series/a.png",
      isActive: true,
    });
    await Series.create({
      categoryId: category._id,
      name: "B",
      imageUrl: "series/b.png",
      isActive: false,
    });

    const res = await request(app)
      .get("/api/series")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.series.length).toBe(2);
  });

  it("GET /api/series should filter by categoryId correctly", async () => {
    const { category: categoryA } = await seedCategory({ brandName: "Apple" });
    const { category: categoryB } = await seedCategory({
      brandName: "Samsung",
    });

    await Series.create({
      categoryId: categoryA._id,
      name: "A-Series",
      imageUrl: "series/a-series.png",
      isActive: true,
    });
    await Series.create({
      categoryId: categoryB._id,
      name: "B-Series",
      imageUrl: "series/b-series.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/series?categoryId=${categoryA._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    const names = res.body.data.series.map((series) => series.name);
    expect(names).toContain("A-Series");
    expect(names).not.toContain("B-Series");
  });

  it("GET /api/series should filter by brandId correctly", async () => {
    const { brand: brandA, category: categoryA } = await seedCategory({
      brandName: "Apple",
      categoryName: "Phones",
    });
    const { category: categoryB } = await seedCategory({
      brandName: "Samsung",
      categoryName: "Tablets",
    });

    await Series.create({
      categoryId: categoryA._id,
      name: "A-Series",
      imageUrl: "series/a-series.png",
      isActive: true,
    });
    await Series.create({
      categoryId: categoryB._id,
      name: "B-Series",
      imageUrl: "series/b-series.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/series?brandId=${brandA._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    const names = res.body.data.series.map((series) => series.name);
    expect(names).toContain("A-Series");
    expect(names).not.toContain("B-Series");
  });

  it("GET /api/series should support pagination", async () => {
    const { category } = await seedCategory();

    await Series.create({
      categoryId: category._id,
      name: "Series-1",
      imageUrl: "series/1.png",
      isActive: true,
    });
    await Series.create({
      categoryId: category._id,
      name: "Series-2",
      imageUrl: "series/2.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/series?page=1&limit=1")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.series.length).toBe(1);
  });

  it("GET /api/series/:id should return 404 for inactive series when accessed by public", async () => {
    const { category } = await seedCategory();

    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/series/${series._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/series/:id should return 404 when category is inactive for public", async () => {
    const { category } = await seedCategory({ categoryActive: false });

    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/series/${series._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/series/:id should return 404 when brand is inactive for public", async () => {
    const { category } = await seedCategory({ brandActive: false });

    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/series/${series._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/series/:id should return inactive series for admin", async () => {
    const { category } = await seedCategory();

    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/series/${series._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Galaxy");
  });

  it("GET /api/series/:id should return series even if category and brand are inactive for admin", async () => {
    const { category } = await seedCategory({
      brandActive: false,
      categoryActive: false,
    });

    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/series/${series._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Galaxy");
  });

  it("GET /api/series/:id should return 404 when series does not exist", async () => {
    const seriesId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/series/${seriesId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
  });

  it("PATCH /api/series/:id should return 404 when series does not exist", async () => {
    const seriesId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/series/${seriesId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated");

    expect(res.status).toBe(404);
  });

  it("PATCH /api/series/:id should return 404 if updating to non-existing category", async () => {
    const { category } = await seedCategory();
    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const categoryId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/series/${series._id}`)
      .set("x-user-role", "admin")
      .field("categoryId", categoryId)
      .field("name", "Updated");

    expect(res.status).toBe(404);
  });

  it("PATCH /api/series/:id should return 409 when updating to duplicate name under same category", async () => {
    const { category } = await seedCategory();

    const seriesA = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    await Series.create({
      categoryId: category._id,
      name: "Ultra",
      imageUrl: "series/ultra.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/series/${seriesA._id}`)
      .set("x-user-role", "admin")
      .field("name", "Ultra");

    expect(res.status).toBe(409);
  });

  it("PATCH /api/series/:id should allow duplicate name under different category", async () => {
    const { category: categoryA } = await seedCategory({
      brandName: "Apple",
      categoryName: "Phones",
    });

    const { category: categoryB } = await seedCategory({
      brandName: "Samsung",
      categoryName: "Tablets",
    });

    const series = await Series.create({
      categoryId: categoryA._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    await Series.create({
      categoryId: categoryB._id,
      name: "Ultra",
      imageUrl: "series/ultra.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/series/${series._id}`)
      .set("x-user-role", "admin")
      .field("categoryId", categoryB._id.toString())
      .field("name", "Galaxy");

    expect(res.status).toBe(200);
  });

  it("PATCH /api/series/:id should trim name before update and persist", async () => {
    const { category } = await seedCategory();
    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/series/${series._id}`)
      .set("x-user-role", "admin")
      .field("name", " Note ");

    expect(res.status).toBe(200);
    const updated = await Series.findById(series._id);
    expect(updated.name).toBe("Note");
  });

  it("PATCH /api/series/:id/status should persist toggle active -> inactive -> active", async () => {
    const { category } = await seedCategory();
    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const off = await request(app)
      .patch(`/api/series/${series._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(off.status).toBe(200);

    let db = await Series.findById(series._id);
    expect(db.isActive).toBe(false);

    const on = await request(app)
      .patch(`/api/series/${series._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: true });

    expect(on.status).toBe(200);

    db = await Series.findById(series._id);
    expect(db.isActive).toBe(true);
  });

  it("PATCH /api/series/:id/status should return 404 when series does not exist", async () => {
    const seriesId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/series/${seriesId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(404);
  });

  it("DELETE /api/series/:id should delete series and not affect category or brand", async () => {
    const { brand, category } = await seedCategory();
    const series = await Series.create({
      categoryId: category._id,
      name: "Galaxy",
      imageUrl: "series/galaxy.png",
      isActive: true,
    });

    const del = await request(app)
      .delete(`/api/series/${series._id}`)
      .set("x-user-role", "admin");

    expect(del.status).toBe(200);

    const deleted = await Series.findById(series._id);
    const stillCategory = await Category.findById(category._id);
    const stillBrand = await Brand.findById(brand._id);

    expect(deleted).toBeNull();
    expect(stillCategory).not.toBeNull();
    expect(stillBrand).not.toBeNull();
  });

  it("DELETE /api/series/:id should return 404 when series does not exist", async () => {
    const seriesId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/series/${seriesId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
  });
});
