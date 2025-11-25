const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,                 // limit each IP to 30 requests per window
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
