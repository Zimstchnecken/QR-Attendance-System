import type { Request, Response } from 'express';

import { env } from '../config/env.js';

export function healthRouter(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'qr-attendance-backend',
      databaseConfigured: Boolean(env.DATABASE_URL),
      timestamp: new Date().toISOString(),
    },
  });
}
