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

describe("Brand DB integration tests", () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    app = createApp();
  });

  beforeEach(async () => {
    await Brand.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("POST /api/brands should create a new brand successfully", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
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
    expect(res.body.data.name).toBe("Apple");
    expect(res.body.data.iconImageUrl).toBeDefined();
    expect(res.body.data.bannerImageUrl).toBeDefined();
  });

  it("POST /api/brands should return 409 when duplicate brand name exists in DB", async () => {
    await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "Apple")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Brand with this name already exists");
  });

  it("GET /api/brands should return all brands successfully", async () => {
    await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    await Brand.create({
      name: "Samsung",
      iconImageUrl: "brands/samsung/icon.png",
      bannerImageUrl: "brands/samsung/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .get("/api/brands")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brands fetched successfully");
    expect(res.body.data.brands.length).toBe(2);
    expect(res.body.data.brands[1].name).toBe("Apple");
    expect(res.body.data.brands[0].name).toBe("Samsung");
  });

  it("GET /api/brands should return both active and inactive brands for admin user", async () => {
    await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    await Brand.create({
      name: "OldBrand",
      iconImageUrl: "brands/old/icon.png",
      bannerImageUrl: "brands/old/banner.png",
      isActive: false,
    });

    const res = await request(app)
      .get("/api/brands")
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brands fetched successfully");
    expect(res.body.data.brands.length).toBe(2);
  });

  it("GET /api/brands should return only active brands for public user", async () => {
    await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    await Brand.create({
      name: "OldBrand",
      iconImageUrl: "brands/old/icon.png",
      bannerImageUrl: "brands/old/banner.png",
      isActive: false,
    });

    const res = await request(app)
      .get("/api/brands")
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brands fetched successfully");
    expect(res.body.data.brands.length).toBe(1);
  });

  it("GET /api/brands/:id should return brand details successfully", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const res = await request(app)
      .get(`/api/brands/${brand._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand fetched successfully");
    expect(res.body.data.name).toBe("Apple");
    expect(res.body.data.iconImageUrl).toBe("brands/apple/icon.png");
    expect(res.body.data.bannerImageUrl).toBe("brands/apple/banner.png");
  });

  // admin user should be able to access inactive brand details
  it("GET /api/brands/:id should return inactive brand details for admin user", async () => {
    const brand = await Brand.create({
      name: "OldBrand",
      iconImageUrl: "brands/old/icon.png",
      bannerImageUrl: "brands/old/banner.png",
      isActive: false,
    });
    const res = await request(app)
      .get(`/api/brands/${brand._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand fetched successfully");
    expect(res.body.data.name).toBe("OldBrand");
    expect(res.body.data.iconImageUrl).toBe("brands/old/icon.png");
    expect(res.body.data.bannerImageUrl).toBe("brands/old/banner.png");
  });

  // public user  able to access active brand details
  it("GET /api/brands/:id should return active brand details for public user", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const res = await request(app)
      .get(`/api/brands/${brand._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand fetched successfully");
    expect(res.body.data.name).toBe("Apple");
    expect(res.body.data.iconImageUrl).toBe("brands/apple/icon.png");
    expect(res.body.data.bannerImageUrl).toBe("brands/apple/banner.png");
  });

  it("GET /api/brands/:id should return error when brand is inactive for public user", async () => {
    const inactiveBrand = await Brand.create({
      name: "Legacy",
      iconImageUrl: "brands/legacy/icon.png",
      bannerImageUrl: "brands/legacy/banner.png",
      isActive: false,
    });

    const res = await request(app)
      .get(`/api/brands/${inactiveBrand._id}`)
      .set("x-user-role", "public");

    expect(res.status).toBe(404);
  });

  it("GET /api/brands/:id should return 404 when brand does not exist in DB", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).get(`/api/brands/${nonExistingId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("PATCH /api/brands/:id should update brand successfully", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/brands/${brand._id}`)
      .set("x-user-role", "admin")
      .field("name", "Apple Inc");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand updated successfully");
    expect(res.body.data.name).toBe("Apple Inc");
  });

  it("PATCH /api/brands/:id should return 404 when brand does not exist in DB", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/brands/${nonExistingId}`)
      .set("x-user-role", "admin")
      .field("name", "Updated Name");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("PATCH /api/brands/:id should return 409 when updating to duplicate brand name", async () => {
    const first = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });
    const second = await Brand.create({
      name: "Samsung",
      iconImageUrl: "brands/samsung/icon.png",
      bannerImageUrl: "brands/samsung/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/brands/${second._id}`)
      .set("x-user-role", "admin")
      .field("name", first.name);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Brand with this name already exists");
  });

  it("PATCH /api/brands/:id/status should update brand status successfully", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/brands/${brand._id}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand status updated successfully");
    expect(res.body.data.isActive).toBe(false);
  });

  it("PATCH /api/brands/:id/status should return 404 when brand does not exist in DB", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/brands/${nonExistingId}/status`)
      .set("x-user-role", "admin")
      .send({ isActive: false });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("DELETE /api/brands/:id should delete brand successfully", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .delete(`/api/brands/${brand._id}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Brand deleted successfully");

    const deletedBrand = await Brand.findById(brand._id);
    expect(deletedBrand).toBeNull();
  });
  it("DELETE /api/brands/:id should return 404 when brand does not exist in DB", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/brands/${nonExistingId}`)
      .set("x-user-role", "admin");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Brand not found");
  });

  it("POST /api/brands should trim name before save", async () => {
    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", " Apple ")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Apple");

    const saved = await Brand.findById(res.body.data.id);
    expect(saved.name).toBe("Apple");
  });

  it("PATCH /api/brands/:id should trim name before update", async () => {
    const brand = await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .patch(`/api/brands/${brand._id}`)
      .set("x-user-role", "admin")
      .field("name", " Samsung ");

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Samsung");

    const updated = await Brand.findById(brand._id);
    expect(updated.name).toBe("Samsung");
  });

  it("POST /api/brands should return 409 for case-insensitive duplicate name", async () => {
    await Brand.create({
      name: "Apple",
      iconImageUrl: "brands/apple/icon.png",
      bannerImageUrl: "brands/apple/banner.png",
      isActive: true,
    });

    const res = await request(app)
      .post("/api/brands")
      .set("x-user-role", "admin")
      .field("name", "apple")
      .attach("iconImage", Buffer.from([1, 2, 3]), {
        filename: "icon.png",
        contentType: "image/png",
      })
      .attach("bannerImage", Buffer.from([1, 2, 3]), {
        filename: "banner.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Brand with this name already exists");
  });
});
