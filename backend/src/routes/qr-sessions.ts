import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';

import { env } from '../config/env.js';
import { getDatabasePool } from '../db/pool.js';

const openSessionSchema = z.object({
  sectionSubjectId: z.string().uuid(),
  sessionDate: z.string().date(),
});

const attendanceRecordSchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(['present', 'late', 'absent', 'excused']),
});

// Mock data for dev mode
const mockSessions = new Map<string, { id: string; status: string; openedAt: string; closedAt: null | string }>();

export const qrSessionRouter: Router = createRouter();

qrSessionRouter.post('/open', (req: Request, res: Response) => {
  (async () => {
    const body = openSessionSchema.parse(req.body);

    if (!env.DATABASE_URL) {
      const sessionId = `qr-${Date.now()}`;
      mockSessions.set(sessionId, {
        id: sessionId,
        status: 'open',
        openedAt: new Date().toISOString(),
        closedAt: null,
      });
      return res.status(200).json({
        success: true,
        data: {
          sessionId,
          status: 'open',
          openedAt: new Date().toISOString(),
        },
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; opened_at: string }>(
      `insert into class_sessions (section_subject_id, session_date, status, opened_at, starts_at)
       values ($1, $2, 'open', now(), now())
       returning id, status, opened_at`,
      [body.sectionSubjectId, body.sessionDate]
    );

    const session = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        openedAt: session.opened_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to open QR session',
      },
    });
  });
});

qrSessionRouter.post('/:sessionId/close', (req: Request, res: Response) => {
  (async () => {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    if (!env.DATABASE_URL) {
      const session = mockSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Session not found' },
        });
      }
      session.status = 'closed';
      session.closedAt = new Date().toISOString();
      return res.status(200).json({
        success: true,
        data: {
          sessionId,
          status: 'closed',
          closedAt: session.closedAt,
        },
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; closed_at: string }>(
      `update class_sessions set status = 'closed', closed_at = now()
       where id = $1
       returning id, status, closed_at`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Session not found' },
      });
    }

    const session = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        closedAt: session.closed_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to close session',
      },
    });
  });
});

qrSessionRouter.get('/:sessionId', (req: Request, res: Response) => {
  (async () => {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    if (!env.DATABASE_URL) {
      const session = mockSessions.get(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Session not found' },
        });
      }
      return res.status(200).json({
        success: true,
        data: session,
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; status: string; opened_at: string; closed_at: string | null }>(
      `select id, status, opened_at, closed_at from class_sessions where id = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Session not found' },
      });
    }

    const session = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        id: session.id,
        status: session.status,
        openedAt: session.opened_at,
        closedAt: session.closed_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch session',
      },
    });
  });
});

qrSessionRouter.post('/:sessionId/attendance', (req: Request, res: Response) => {
  (async () => {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    const body = attendanceRecordSchema.parse(req.body);

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: {
          recordId: `rec-${Date.now()}`,
          sessionId,
          studentId: body.studentId,
          status: body.status,
          recordedAt: new Date().toISOString(),
        },
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; student_id: string; status: string; scanned_at: string }>(
      `insert into attendance_records (class_session_id, student_id, status, scanned_at)
       values ($1, $2, $3, now())
       returning id, student_id, status, scanned_at`,
      [sessionId, body.studentId, body.status]
    );

    const record = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        recordId: record.id,
        sessionId,
        studentId: record.student_id,
        status: record.status,
        recordedAt: record.scanned_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to record attendance',
      },
    });
  });
});

qrSessionRouter.get('/:sessionId/attendance', (req: Request, res: Response) => {
  (async () => {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: [
          { studentId: 'ST-021', status: 'present', recordedAt: new Date().toISOString() },
          { studentId: 'ST-034', status: 'late', recordedAt: new Date().toISOString() },
        ],
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ student_id: string; status: string; created_at: string }>(
      `select student_id, status, created_at from attendance_records
       where class_session_id = $1
       order by created_at asc`,
      [sessionId]
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((row) => ({
        studentId: row.student_id,
        status: row.status,
        recordedAt: row.created_at,
      })),
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch attendance records',
      },
    });
  });
});
