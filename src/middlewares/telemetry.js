const { randomUUID } = require("crypto");

module.exports = function (req, res, next) {
  req.correlationId = randomUUID(); // assign unique ID to each request
  res.setHeader("X-Correlation-ID", req.correlationId);
  next();
};
