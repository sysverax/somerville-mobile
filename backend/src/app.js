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

const createApp = (logger = testLogger) => {
  const app = express();

  app.use(
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
  app.use(contextMw);
  app.use(morganMw);
  app.use(express.json());
  app.use(cookieParser());

  app.get("/ping", (req, res) => {
    res.send("pong");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/brands", brandRoutes);
  app.use("/api/categories", categoryRoutes);

  app.use(invalidJsonHandler);
  app.use(errorHandler);

  return app;
};

module.exports = {
  createApp,
};
