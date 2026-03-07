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
const Product = require("../../models/product");

describe("Product DB integration tests", () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createApp();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
    await Series.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  /**
   * Helper to seed a full hierarchy: Brand -> Category -> Series
   */
  const seedSeries = async ({
    brandName = "Apple",
    brandActive = true,
    categoryName = "Phones",
    categoryActive = true,
    seriesName = "iPhone",
    seriesActive = true,
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
    const series = await Series.create({
      categoryId: category._id,
      name: seriesName,
      imageUrl: `series/${seriesName.toLowerCase()}.png`,
      isActive: seriesActive,
    });
    return { brand, category, series };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /api/products
  // ─────────────────────────────────────────────────────────────────────────────

  it("POST /api/products should create product under valid series", async () => {
    const { series } = await seedSeries();

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", series._id.toString())
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("iPhone 15");
  });

  it("POST /api/products should return 404 when series does not exist", async () => {
    const fakeSeriesId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", fakeSeriesId)
      .field("name", "iPhone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Series not found");
  });

  it("POST /api/products should trim name before saving", async () => {
    const { series } = await seedSeries();

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", series._id.toString())
      .field("name", " iPhone 15 ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("iPhone 15");
  });

  it("POST /api/products should return 409 for case-insensitive duplicate under same series", async () => {
    const { series } = await seedSeries();

    await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", series._id.toString())
      .field("name", "iphone 15")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Product already exists");
  });

  it("POST /api/products should allow same product name under different series", async () => {
    const { series: series1 } = await seedSeries({ seriesName: "iPhone" });
    const { series: series2 } = await seedSeries({
      brandName: "Samsung",
      categoryName: "Galaxy",
      seriesName: "Galaxy S",
    });

    await Product.create({
      seriesId: series1._id,
      name: "Pro Max",
      imageUrl: "products/promax.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/products")
      .set("x-user-role", "admin")
      .field("seriesId", series2._id.toString())
      .field("name", "Pro Max")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Pro Max");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/products
  // ─────────────────────────────────────────────────────────────────────────────

  it("GET /api/products should hide inactive product for public user", async () => {
    const { series } = await seedSeries();
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15 Active",
      imageUrl: "products/active.png",
      isActive: true,
    });
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15 Inactive",
      imageUrl: "products/inactive.png",
      isActive: false,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe("iPhone 15 Active");
  });

  it("GET /api/products should hide product under inactive series for public user", async () => {
    const { series } = await seedSeries({ seriesActive: false });
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(0);
  });

  it("GET /api/products should hide product under inactive category for public user", async () => {
    const { series } = await seedSeries({ categoryActive: false });
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(0);
  });

  it("GET /api/products should hide product under inactive brand for public user", async () => {
    const { series } = await seedSeries({ brandActive: false });
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(0);
  });

  it("GET /api/products should return active + inactive products for admin user", async () => {
    const { series } = await seedSeries();
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15 Active",
      imageUrl: "products/active.png",
      isActive: true,
    });
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15 Inactive",
      imageUrl: "products/inactive.png",
      isActive: false,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(2);
  });

  it("GET /api/products should filter by seriesId correctly", async () => {
    const { series: series1 } = await seedSeries({ seriesName: "iPhone" });
    const { series: series2 } = await seedSeries({
      brandName: "Samsung",
      categoryName: "Galaxy",
      seriesName: "Galaxy S",
    });

    await Product.create({
      seriesId: series1._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });
    await Product.create({
      seriesId: series2._id,
      name: "Galaxy S24",
      imageUrl: "products/s24.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ seriesId: series1._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe("iPhone 15");
  });

  it("GET /api/products should filter by categoryId correctly", async () => {
    const { series: series1, category: cat1 } = await seedSeries({
      seriesName: "iPhone",
    });
    const { series: series2 } = await seedSeries({
      brandName: "Samsung",
      categoryName: "Galaxy",
      seriesName: "Galaxy S",
    });

    await Product.create({
      seriesId: series1._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });
    await Product.create({
      seriesId: series2._id,
      name: "Galaxy S24",
      imageUrl: "products/s24.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ categoryId: cat1._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe("iPhone 15");
  });

  it("GET /api/products should filter by brandId correctly", async () => {
    const { series: series1, brand: brand1 } = await seedSeries({
      seriesName: "iPhone",
    });
    const { series: series2 } = await seedSeries({
      brandName: "Samsung",
      categoryName: "Galaxy",
      seriesName: "Galaxy S",
    });

    await Product.create({
      seriesId: series1._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });
    await Product.create({
      seriesId: series2._id,
      name: "Galaxy S24",
      imageUrl: "products/s24.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ brandId: brand1._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].name).toBe("iPhone 15");
  });

  it("GET /api/products should support pagination", async () => {
    const { series } = await seedSeries();
    for (let i = 1; i <= 15; i++) {
      await Product.create({
        seriesId: series._id,
        name: `Product ${i}`,
        imageUrl: `products/product${i}.png`,
        isActive: true,
      });
    }

    const res = await request(app)
      .get("/api/products")
      .set("x-user-role", "admin")
      .query({ page: 2, limit: 10 });

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(5);
    expect(res.body.data.totalProducts).toBe(15);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /api/products/:id
  // ─────────────────────────────────────────────────────────────────────────────

  it("GET /api/products/:id should return 404 for inactive product when accessed by public", async () => {
    const { series } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/products/:id should return 404 when series is inactive for public", async () => {
    const { series } = await seedSeries({ seriesActive: false });
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/products/:id should return 404 when category is inactive for public", async () => {
    const { series } = await seedSeries({ categoryActive: false });
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/products/:id should return 404 when brand is inactive for public", async () => {
    const { series } = await seedSeries({ brandActive: false });
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/products/:id should return inactive product for admin", async () => {
    const { series } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("iPhone 15");
  });

  it("GET /api/products/:id should return product for admin even when series/category/brand are inactive", async () => {
    const { series } = await seedSeries({
      brandActive: false,
      categoryActive: false,
      seriesActive: false,
    });
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .get(`/api/products/${product._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("iPhone 15");
  });

  it("GET /api/products/:id should return 404 when product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/products/${fakeId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /api/products/:id
  // ─────────────────────────────────────────────────────────────────────────────

  it("PATCH /api/products/:id should return 404 when product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${fakeId}`)
      .set("x-user-role", "admin")
      .field("name", "New Name");

    expect(res.status).toBe(404);
  });

  it("PATCH /api/products/:id should return 404 when updating to non-existing series", async () => {
    const { series } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });
    const fakeSeriesId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${product._id}`)
      .set("x-user-role", "admin")
      .field("seriesId", fakeSeriesId);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Series not found");
  });

  it("PATCH /api/products/:id should return 409 when updating to duplicate name under same series", async () => {
    const { series } = await seedSeries();
    await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });
    const product2 = await Product.create({
      seriesId: series._id,
      name: "iPhone 14",
      imageUrl: "products/iphone14.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/products/${product2._id}`)
      .set("x-user-role", "admin")
      .field("name", "iPhone 15");

    expect(res.status).toBe(409);
  });

  it("PATCH /api/products/:id should allow duplicate name under different series", async () => {
    const { series: series1 } = await seedSeries({ seriesName: "iPhone" });
    const { series: series2 } = await seedSeries({
      brandName: "Samsung",
      categoryName: "Galaxy",
      seriesName: "Galaxy S",
    });

    await Product.create({
      seriesId: series1._id,
      name: "Pro Max",
      imageUrl: "products/promax.png",
      isActive: true,
    });
    const product2 = await Product.create({
      seriesId: series2._id,
      name: "Galaxy S24",
      imageUrl: "products/s24.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/products/${product2._id}`)
      .set("x-user-role", "admin")
      .field("name", "Pro Max");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Pro Max");
  });

  it("PATCH /api/products/:id should trim name before update and persist", async () => {
    const { series } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/products/${product._id}`)
      .set("x-user-role", "admin")
      .field("name", "  iPhone 15 Pro  ");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("iPhone 15 Pro");

    const updated = await Product.findById(product._id);
    expect(updated.name).toBe("iPhone 15 Pro");
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /api/products/:id/status
  // ─────────────────────────────────────────────────────────────────────────────

  it("PATCH /api/products/:id/status should persist toggle active -> inactive -> active", async () => {
    const { series } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    // active -> inactive
    let res = await request(app)
      .patch(`/api/products/${product._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    let dbProduct = await Product.findById(product._id);
    expect(dbProduct.isActive).toBe(false);

    // inactive -> active
    res = await request(app)
      .patch(`/api/products/${product._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: true });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);

    dbProduct = await Product.findById(product._id);
    expect(dbProduct.isActive).toBe(true);
  });

  it("PATCH /api/products/:id/status should return 404 when product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${fakeId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(404);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /api/products/:id
  // ─────────────────────────────────────────────────────────────────────────────

  it("DELETE /api/products/:id should delete product successfully", async () => {
    const { series } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product deleted successfully");

    const deleted = await Product.findById(product._id);
    expect(deleted).toBeNull();
  });

  it("DELETE /api/products/:id should return 404 when product does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${fakeId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
  });

  it("DELETE /api/products/:id should not affect series/category/brand", async () => {
    const { series, category, brand } = await seedSeries();
    const product = await Product.create({
      seriesId: series._id,
      name: "iPhone 15",
      imageUrl: "products/iphone15.png",
      isActive: true,
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);

    const existingSeries = await Series.findById(series._id);
    const existingCategory = await Category.findById(category._id);
    const existingBrand = await Brand.findById(brand._id);

    expect(existingSeries).not.toBeNull();
    expect(existingCategory).not.toBeNull();
    expect(existingBrand).not.toBeNull();
  });
});
