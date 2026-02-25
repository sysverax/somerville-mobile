const request = require("supertest");

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
const authService = require("../services/auth.service");

const validId = "507f1f77bcf86cd799439011";

describe("Auth API tests", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /ping should return pong", async () => {
    const res = await request(app).get("/ping");

    expect(res.status).toBe(200);
    expect(res.text).toBe("pong");
  });

  it("POST /api/auth/admin/register should create admin successfully", async () => {
    authService.adminRegisterService.mockResolvedValueOnce({
      accessToken: "token-123",
      user: { id: validId, name: "Admin", email: "admin@test.com" },
    });

    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "Admin@123",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Admin registered successfully");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(authService.adminRegisterService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/auth/admin/register should fail validation for invalid email", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "invalid-email",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email format");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail validation when name is missing", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      email: "admin@test.com",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Name is required");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail validation when name is empty", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "",
      email: "admin@test.com",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Name is required");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail validation when name is only spaces", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "   ",
      email: "admin@test.com",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Name is required");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail validation when name is not a string", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: 5,
      email: "admin@test.com",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid name format");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail validation when email is missing", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail when password is empty", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is required");
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail when password is missing special character", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "Admin123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail when password is missing uppercase", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail when password is missing lowercase", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "ADMIN@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/register should fail when password is missing number", async () => {
    const res = await request(app).post("/api/auth/admin/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "Admin@abc",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminRegisterService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should login successfully", async () => {
    authService.adminLoginService.mockResolvedValueOnce({
      accessToken: "token-123",
      user: { id: validId, name: "Admin", email: "admin@test.com" },
    });

    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "Admin@123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Admin login successful");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(authService.adminLoginService).toHaveBeenCalledTimes(1);
  });

  it("POST /api/auth/admin/login should fail validation when email is missing", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email is required");
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail validation for invalid email format", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "invalid-email",
      password: "Admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid email format");
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail when password is empty", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is required");
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail when password is missing special character", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "Admin123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail when password is missing uppercase", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "admin@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail when password is missing lowercase", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "ADMIN@123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail when password is missing number", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "Admin@abc",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login should fail validation for invalid password format", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain(
      "Password must contain at least 8 characters",
    );
    expect(authService.adminLoginService).not.toHaveBeenCalled();
  });

  it("POST /api/auth/admin/login with malformed JSON should return 400", async () => {
    const res = await request(app)
      .post("/api/auth/admin/login")
      .set("Content-Type", "application/json")
      .send('{"email":"admin@test.com",');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Malformed JSON");
  });
});
