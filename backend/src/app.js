const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { ALLOWED_ORIGINS } = require("./config/envConfig");
const { requestContextMiddleware } = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");
const appError = require("./utils/errors/errors");

const authRoutes = require("./routes/auth.route");
const brandRoutes = require("./routes/brand.route");
const categoryRoutes = require("./routes/category.route");
const seriesRoutes = require("./routes/series.route");
const productRoutes = require("./routes/product.route");
const serviceRoutes = require("./routes/service.route");

const testLogger = {
  info: () => {},
  error: () => {},
  child() {
    return this;
  },
};

const invalidJsonHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    req.logger.error("Malformed JSON received in request body");
    throw new appError.BadRequestError(
      "Malformed JSON",
      "Invalid JSON format in request body",
      "Ensure your request body is valid JSON format.",
    );
  }
  next(err);
};

const app = (logger = testLogger) => {
  const expressApp = express();

  expressApp.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.trim().replace(/\/$/, "");

        if (ALLOWED_ORIGINS.includes(normalizedOrigin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );

  const [contextMw, morganMw] = requestContextMiddleware(logger);
  expressApp.use(contextMw);
  expressApp.use(morganMw);
  expressApp.use(express.json());
  expressApp.use(cookieParser());

  expressApp.get("/", (req, res) => {
    res.send("Hello");
  });

  expressApp.get("/ping", (req, res) => {
    res.send("pong");
  });

  expressApp.use("/api/auth", authRoutes);
  expressApp.use("/api/brands", brandRoutes);
  expressApp.use("/api/categories", categoryRoutes);
  expressApp.use("/api/series", seriesRoutes);
  expressApp.use("/api/products", productRoutes);
  expressApp.use("/api/services", serviceRoutes);

  expressApp.use(invalidJsonHandler);
  expressApp.use(errorHandler);

  return expressApp;
};

export default app;
