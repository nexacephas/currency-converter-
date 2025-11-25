const morgan = require("morgan");
const winston = require("../logging/logger");

// Custom morgan format for structured logging
morgan.token("clientId", (req) => (req.user ? req.user.clientId : "-"));

const morganMiddleware = morgan(
  ':remote-addr :clientId ":method :url" :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => winston.info(message.trim()),
    },
  }
);

module.exports = morganMiddleware;
