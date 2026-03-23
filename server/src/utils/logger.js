/**
 * Pino Logger
 * Structured JSON logging with pino-pretty for development
 */

const pino = require('pino');

const level = process.env.LOG_LEVEL || 'info';
const isDev = (process.env.NODE_ENV || 'development') === 'development';

const logger = pino({
  level,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
  // Production: JSON format (default)
  ...(!isDev && {
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      remoteAddress: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

module.exports = logger;
