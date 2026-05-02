import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { authRouter, meHandler } from './routes/auth.js';
import { catalogRouter } from './routes/catalog.js';
import { correctionsRouter } from './routes/corrections.js';
import { enrollmentRouter } from './routes/enrollment.js';
import { healthRouter } from './routes/health.js';
import { qrSessionRouter } from './routes/qr-sessions.js';
import { reportsRouter } from './routes/reports.js';
import { alertsRouter } from './routes/alerts.js';

const logger = pino({ level: env.LOG_LEVEL });

export function createServer() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      // Allow all origins in development; in production set CORS_ORIGIN to your domain
      origin: env.CORS_ORIGIN === '*' || !env.CORS_ORIGIN ? true : env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use((pinoHttp as unknown as (options: { logger: typeof logger }) => express.RequestHandler)({ logger }));

  app.use('/api/v1/auth', authRouter);
  app.get('/api/v1/me', meHandler);
  app.use('/api/v1', catalogRouter);
  app.use('/api/v1/qr-sessions', qrSessionRouter);
  app.use('/api/v1/enrollments', enrollmentRouter);
  app.use('/api/v1/corrections', correctionsRouter);
  app.use('/api/v1/reports', reportsRouter);
  app.use('/api/v1/alerts', alertsRouter);
  app.get('/api/v1/health', healthRouter);

  app.use((_, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ err }, 'Unhandled request error');
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      },
    });
  });

  return app;
}
