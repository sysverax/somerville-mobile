const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { initLogger } = require("./utils/logger/logger");
const { requestContextMiddleware } = require("./middlewares/requestLogger");
const appError = require("./utils/errors/errors");
const errorHandler = require("./middlewares/errorHandler");
const { PORT, ALLOWED_ORIGINS } = require("./config/envConfig");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.route");
const brandRoutes = require("./routes/brand.route");

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

const server = async () => {
  const logger = await initLogger("backend");

  // Connect to the database
  await connectDB(logger);

  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow no-origin (curl, Postman, same-origin)
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

  // example controller usage
  app.get("/ping", (req, res) => {
    res.send("pong");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/brands", brandRoutes);

  app.use(invalidJsonHandler);
  app.use(errorHandler);

  app.listen(PORT, () => logger.info(`Server started on ${PORT}`));
};

// Start the server
server();
