const app = require("../app");
const { initLogger } = require("../utils/logger/logger");

const logger = initLogger("backend").catch((err) => {
  console.error("Failed to initialize logger:", err);
  process.exit(1);
});
const appInstance = app(logger);

module.exports = appInstance;
