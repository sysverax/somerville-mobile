const appFactory = require("../src/app");
const connectDB = require("../src/config/db");
const { initLogger } = require("../src/utils/logger/logger");

let loggerPromise;
let dbPromise;
let appInstance;

module.exports = async (req, res) => {
  try {
    if (!loggerPromise) {
      loggerPromise = initLogger("backend");
    }

    const logger = await loggerPromise;

    if (!dbPromise) {
      dbPromise = connectDB(logger);
    }
    await dbPromise;

    if (!appInstance) {
      appInstance = appFactory(logger);
    }

    return appInstance(req, res);
  } catch (err) {
    console.error("Vercel function bootstrap failed", err);
    return res.status(500).json({
      status: "error",
      message: "Server initialization failed",
    });
  }
};
