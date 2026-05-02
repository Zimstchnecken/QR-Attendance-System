import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';

import { env } from '../config/env.js';
import { getDatabasePool } from '../db/pool.js';

const createCorrectionSchema = z.object({
  attendanceRecordId: z.string(),
  reason: z.string().min(10),
});

const approveCorrectionSchema = z.object({
  approved: z.boolean(),
  reviewerNotes: z.string().optional(),
});

const dummyAdminId = '22222222-2222-2222-2222-222222222222'; // Teacher Admin from seed

// Mock corrections for dev mode
const mockCorrections = new Map<string, { id: string; status: string; createdAt: string; approvedAt: null | string }>();

export const correctionsRouter: Router = createRouter();

correctionsRouter.post('/', (req: Request, res: Response) => {
  (async () => {
    const body = createCorrectionSchema.parse(req.body);

    if (!env.DATABASE_URL) {
      const correctionId = `corr-${Date.now()}`;
      mockCorrections.set(correctionId, {
        id: correctionId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        approvedAt: null,
      });
      return res.status(200).json({
        success: true,
        data: {
          correctionId,
          recordId: body.attendanceRecordId,
          reason: body.reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; created_at: string }>(
      `insert into attendance_corrections (attendance_record_id, requested_by_user_id, reason)
       values ($1, $2, $3)
       returning id, status, created_at`,
      [body.attendanceRecordId, dummyAdminId, body.reason]
    );

    const correction = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        correctionId: correction.id,
        recordId: body.attendanceRecordId,
        reason: body.reason,
        status: correction.status,
        createdAt: correction.created_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to create correction request',
      },
    });
  });
});

correctionsRouter.get('/:correctionId', (req: Request, res: Response) => {
  (async () => {
    const correctionId = Array.isArray(req.params.correctionId) ? req.params.correctionId[0] : req.params.correctionId;

    if (!env.DATABASE_URL) {
      const correction = mockCorrections.get(correctionId);
      if (!correction) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Correction not found' },
        });
      }
      return res.status(200).json({
        success: true,
        data: correction,
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; created_at: string; reviewed_at: string | null }>(
      `select id, status, created_at, reviewed_at from attendance_corrections where id = $1`,
      [correctionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Correction not found' },
      });
    }

    const correction = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        id: correction.id,
        status: correction.status,
        createdAt: correction.created_at,
        reviewedAt: correction.reviewed_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'CORRECTION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch correction',
      },
    });
  });
});

correctionsRouter.post('/:correctionId/approve', (req: Request, res: Response) => {
  (async () => {
    const correctionId = Array.isArray(req.params.correctionId) ? req.params.correctionId[0] : req.params.correctionId;
    const body = approveCorrectionSchema.parse(req.body);

    if (!env.DATABASE_URL) {
      const correction = mockCorrections.get(correctionId);
      if (!correction) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Correction not found' },
        });
      }
      correction.status = body.approved ? 'approved' : 'rejected';
      correction.approvedAt = new Date().toISOString();
      return res.status(200).json({
        success: true,
        data: {
          correctionId,
          status: correction.status,
          approvedAt: correction.approvedAt,
        },
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; reviewed_at: string }>(  
      `update attendance_corrections
       set status = $1, reviewed_at = now(), reviewed_by_user_id = $2
       where id = $3
       returning id, status, reviewed_at`,
      [body.approved ? 'approved' : 'rejected', dummyAdminId, correctionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Correction not found' },
      });
    }

    const correction = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        correctionId: correction.id,
        status: correction.status,
        reviewedAt: correction.reviewed_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to review correction',
      },
    });
  });
});

correctionsRouter.get('/pending/list', (_req: Request, res: Response) => {
  (async () => {
    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: Array.from(mockCorrections.values()).filter((c) => c.status === 'pending'),
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; created_at: string }>(  
      `select id, status, created_at from attendance_corrections
       where status = 'pending'
       order by created_at desc`
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((row) => ({
        correctionId: row.id,
        status: row.status,
        createdAt: row.created_at,
      })),
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'CORRECTION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch pending corrections',
      },
    });
  });
});
