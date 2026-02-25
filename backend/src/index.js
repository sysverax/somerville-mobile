const { initLogger } = require("./utils/logger/logger");
const { PORT } = require("./config/envConfig");
const connectDB = require("./config/db");
const { createApp } = require("./app");

const server = async () => {
  const logger = await initLogger("backend");

  // Connect to the database
  await connectDB(logger);

  const app = createApp(logger);

  app.listen(PORT, () => logger.info(`Server started on ${PORT}`));
};

// Start the server
server();
