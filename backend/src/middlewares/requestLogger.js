const { v4: uuidv4 } = require("uuid");
const morgan = require("morgan");

function requestContextMiddleware(logger) {
  morgan.token("id", (req) => req.id || "-");

  const stream = {
    write: (message) => logger.info(message.trim()), // Morgan already includes newlines
  };

  const morganMiddleware = morgan(
    ":id :method :url :status :response-time ms - :res[content-length]",
    { stream }
  );

  return [
    // Middleware #1: Inject requestId and a child logger
    (req, res, next) => {
      req.id = req.headers["x-request-id"] || uuidv4();
      // Create a child logger that includes requestId
      req.logger = logger.child({ requestId: req.id });

      // Include requestId in response headers for client tracing
      res.setHeader("x-request-id", req.id);
      next();
    },

    // Middleware #2: Morgan HTTP request logger (piped to Winston)
    morganMiddleware,
  ];
}

module.exports = { requestContextMiddleware };
