import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const isDev = process.env.NODE_ENV !== 'production';

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      level: process.env.LOG_LEVEL || 'info',
      options: {
        destination: path.join(logDir, 'app.log'),
        mkdir: true,
      },
    },
    ...(isDev
      ? [{
          target: 'pino/file',
          level: 'debug',
          options: { destination: 1 },
        }]
      : []),
  ],
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  },
  transport,
);
