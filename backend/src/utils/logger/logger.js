const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs/promises");

const { NODE_ENV } = require("../../config/envConfig");

const { combine, timestamp, errors, printf, json, splat, metadata } = format;

const LOG_DIR = path.join(__dirname, "../../../logs");
const DEFAULT_LEVEL = NODE_ENV === "dev" ? "debug" : "info";

async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (err) {}
}

function buildFormat() {
  // JSON format for production (ideal for log aggregation systems like ELK, Datadog, etc.)
  if (NODE_ENV === "prod") {
    return combine(
      timestamp(),
      errors({ stack: true }),
      splat(),
      metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
      json(),
    );
  }
  const devPrintf = printf(({ timestamp, level, message, stack, ...meta }) => {
    const m = Object.keys(meta).length ? JSON.stringify(meta) : "";
    return `${timestamp} ${level}: ${message}${
      stack ? `\n${stack}` : ""
    } ${m}`.trim();
  });
  return combine(timestamp(), errors({ stack: true }), splat(), devPrintf);
}

async function initLogger(serviceName = "backend") {
  await ensureLogDir();

  const logger = createLogger({
    level: DEFAULT_LEVEL,
    defaultMeta: { service: serviceName, env: NODE_ENV },
    format: buildFormat(),

    transports: [
      // Console output for both dev and prod environments
      new transports.Console(),

      // Daily rotating file (main structured logs)
      new DailyRotateFile({
        dirname: LOG_DIR,
        filename: `${serviceName}-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d", // retain logs for 14 days
        level: "info",
      }),
    ],

    // Dedicated exception handler for unexpected errors
    exceptionHandlers: [
      new DailyRotateFile({
        dirname: LOG_DIR,
        filename: `${serviceName}-exceptions-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
      }),
      new transports.Console(),
    ],

    // Handle unhandled promise rejections
    rejectionHandlers: [
      new DailyRotateFile({
        dirname: LOG_DIR,
        filename: `${serviceName}-rejections-%DATE%.log`,
        datePattern: "YYYY-MM-DD",
        maxFiles: "30d",
      }),
      new transports.Console(),
    ],

    // Don’t crash process on unhandled exceptions — allow process manager to restart
    exitOnError: false,
  });
  return logger;
}

module.exports = { initLogger };
