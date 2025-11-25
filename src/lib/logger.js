// === FILE: src/lib/logger.js ===
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, json } = format;


const myFormat = printf(({ level, message, timestamp }) => {
return `${timestamp} [${level}]: ${message}`;
});


const logger = createLogger({
level: process.env.LOG_LEVEL || 'info',
format: combine(timestamp(), json()),
transports: [
new transports.Console({ format: combine(timestamp(), myFormat) }),
new transports.File({ filename: 'logs/error.log', level: 'error' }),
new transports.File({ filename: 'logs/combined.log' })
]
});


// create a stream for morgan
const stream = {
write: (message) => logger.info(message.trim())
};


module.exports = { logger, stream };

