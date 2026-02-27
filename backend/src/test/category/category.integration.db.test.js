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

describe("Category DB integration tests", () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp();
  });

  beforeEach(async () => {
    await Category.deleteMany({});
    await Brand.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("POST /api/categories should create category linked to valid active brand", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", brand._id.toString())
      .field("name", "Phones")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Phones");
  });

  it("POST /api/categories should trim name before saving", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", brand._id.toString())
      .field("name", " Phones ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Phones");
  });

  it("POST /api/categories should return 409 for case-insensitive duplicate under same brand", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", brand._id.toString())
      .field("name", "phones")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
  });

  it("POST /api/categories should allow same name under different brands", async () => {
    const brandA = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const brandB = await Brand.create({
      name: "Samsung",
      iconImageUrl: "brands/samsung/icon.png",
      bannerImageUrl: "brands/samsung/banner.png",
      isActive: true,
    });

    await Category.create({
      brandId: brandA._id,
      name: "Phones",
      imageUrl: "categories/a.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/categories")
      .set("x-user-role", "admin")
      .field("brandId", brandB._id.toString())
      .field("name", "Phones")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
  });

  it("GET /api/categories should hide inactive category for public", async () => {
    const activeBrand = await Brand.create({
      name: "ActiveBrand",
      iconImageUrl: "brands/active/icon.png",
      bannerImageUrl: "brands/active/banner.png",
      isActive: true,
    });
    const inactiveBrand = await Brand.create({
      name: "InactiveBrand",
      iconImageUrl: "brands/inactive/icon.png",
      bannerImageUrl: "brands/inactive/banner.png",
      isActive: false,
    });

    await Category.create({
      brandId: activeBrand._id,
      name: "Visible",
      imageUrl: "categories/visible.png",
      isActive: true,
    });
    await Category.create({
      brandId: activeBrand._id,
      name: "Hidden1",
      imageUrl: "categories/h1.png",
      isActive: false,
    });
    await Category.create({
      brandId: inactiveBrand._id,
      name: "Hidden2",
      imageUrl: "categories/h2.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/categories")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.data.categories.map((c) => c.name)).toContain("Visible");
    expect(res.body.data.categories.map((c) => c.name)).not.toContain(
      "Hidden1",
    );
  });

  it("GET /api/categories should hide inactive brand for public", async () => {
    const activeBrand = await Brand.create({
      name: "ActiveBrand",
      iconImageUrl: "brands/active/icon.png",
      bannerImageUrl: "brands/active/banner.png",
      isActive: true,
    });
    const inactiveBrand = await Brand.create({
      name: "InactiveBrand",
      iconImageUrl: "brands/inactive/icon.png",
      bannerImageUrl: "brands/inactive/banner.png",
      isActive: false,
    });

    await Category.create({
      brandId: activeBrand._id,
      name: "Visible",
      imageUrl: "categories/visible.png",
      isActive: true,
    });
    await Category.create({
      brandId: activeBrand._id,
      name: "Hidden1",
      imageUrl: "categories/h1.png",
      isActive: false,
    });
    await Category.create({
      brandId: inactiveBrand._id,
      name: "Hidden2",
      imageUrl: "categories/h2.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/categories")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.data.categories.map((c) => c.name)).toContain("Visible");
    expect(res.body.data.categories.map((c) => c.name)).not.toContain(
      "Hidden2",
    );
  });

  it("GET /api/categories should return active + inactive for admin", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: false,
    });

    await Category.create({
      brandId: brand._id,
      name: "A",
      imageUrl: "categories/a.png",
      isActive: true,
    });
    await Category.create({
      brandId: brand._id,
      name: "B",
      imageUrl: "categories/b.png",
      isActive: false,
    });

    const res = await request(app)
      .get("/api/categories")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.categories.length).toBe(2);
  });

  it("GET /api/categories/:id should return 404 for inactive category when accessed by public", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/categories/${category._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/categories/:id should return 404 when brand is inactive for public", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: false,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/categories/${category._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/categories/:id should return inactive category for admin", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/categories/${category._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Phones");
  });

  it("GET /api/categories/:id should return category even if brand is inactive for admin", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: false,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/categories/${category._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Phones");
  });


  it("PATCH /api/categories/:id should trim name before update", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/categories/${category._id}`)
      .set("x-user-role", "admin")
      .field("name", " Tablets ");

    expect(res.status).toBe(200);

    const updated = await Category.findById(category._id);
    expect(updated.name).toBe("Tablets");
  });

  it("PATCH /api/categories/:id/status should persist toggle active -> inactive -> active", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: true,
    });

    const off = await request(app)
      .patch(`/api/categories/${category._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(off.status).toBe(200);

    let db = await Category.findById(category._id);
    expect(db.isActive).toBe(false);

    const on = await request(app)
      .patch(`/api/categories/${category._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: true });

    expect(on.status).toBe(200);

    db = await Category.findById(category._id);
    expect(db.isActive).toBe(true);
  });

  it("DELETE /api/categories/:id should delete category and not affect brand", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const category = await Category.create({
      brandId: brand._id,
      name: "Phones",
      imageUrl: "categories/phones.png",
      isActive: true,
    });

    const del = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set("x-user-role", "admin");

    expect(del.status).toBe(200);

    const deleted = await Category.findById(category._id);
    const stillBrand = await Brand.findById(brand._id);

    expect(deleted).toBeNull();
    expect(stillBrand).not.toBeNull();
  });
});
