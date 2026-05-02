import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';

import { env } from '../config/env.js';
import { getDatabasePool } from '../db/pool.js';

const availableStudentsSchema = z.object({
  sectionId: z.string().min(1),
});

const enrollStudentSchema = z.object({
  studentId: z.string().min(1),
  sectionId: z.string().min(1),
});

// Mock enrollments for dev mode
const mockEnrollments = new Map<string, { id: string; studentId: string; sectionId: string; enrolledAt: string }>();

export const enrollmentRouter: Router = createRouter();

enrollmentRouter.get('/available', (req: Request, res: Response) => {
  (async () => {
    const query = availableStudentsSchema.parse(req.query);

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: [
          { id: '11111110-1111-1111-1111-111111111111', name: 'Alyssa Cruz', studentNumber: 'ST-021', gradeLevel: 'Grade 10' },
          { id: '11111111-1111-1111-1111-111111111110', name: 'Joshua Lim', studentNumber: 'ST-034', gradeLevel: 'Grade 10' },
          { id: '11111111-1111-1111-1111-111111111112', name: 'Maria Garcia', studentNumber: 'ST-045', gradeLevel: 'Grade 10' },
        ],
      });
    }

    const pool = getDatabasePool();
    
    // Get section info first
    const sectionResult = await pool.query<{ grade_level: string }>(
      'select grade_level from sections where id = $1',
      [query.sectionId]
    );

    if (sectionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Section not found' },
      });
    }

    const gradeLevel = sectionResult.rows[0].grade_level;

    // Get students not already enrolled in this section
    const result = await pool.query<{ id: string; first_name: string; last_name: string; student_number: string; grade_level: string }>(
      `select s.id, s.first_name, s.last_name, s.student_number, s.grade_level
       from students s
       where s.grade_level = $1 and s.status = 'active'
       and s.id not in (
         select student_id from student_enrollments where section_id = $2
       )
       order by s.first_name asc`,
      [gradeLevel, query.sectionId]
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`,
        studentNumber: row.student_number,
        gradeLevel: row.grade_level,
      })),
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'ENROLLMENT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch available students',
      },
    });
  });
});

enrollmentRouter.post('/enroll', (req: Request, res: Response) => {
  (async () => {
    const body = enrollStudentSchema.parse(req.body);

    if (!env.DATABASE_URL) {
      const enrollmentId = `enroll-${Date.now()}`;
      mockEnrollments.set(enrollmentId, {
        id: enrollmentId,
        studentId: body.studentId,
        sectionId: body.sectionId,
        enrolledAt: new Date().toISOString(),
      });
      return res.status(200).json({
        success: true,
        data: {
          enrollmentId,
          studentId: body.studentId,
          sectionId: body.sectionId,
          enrolledAt: new Date().toISOString(),
        },
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ id: string; student_id: string; section_id: string; created_at: string }>(
      `insert into student_enrollments (student_id, section_id)
       values ($1, $2)
       returning id, student_id, section_id, created_at`,
      [body.studentId, body.sectionId]
    );

    const enrollment = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        enrollmentId: enrollment.id,
        studentId: enrollment.student_id,
        sectionId: enrollment.section_id,
        enrolledAt: enrollment.created_at,
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to enroll student',
      },
    });
  });
});

enrollmentRouter.get('/section/:sectionId', (req: Request, res: Response) => {
  (async () => {
    const sectionId = Array.isArray(req.params.sectionId) ? req.params.sectionId[0] : req.params.sectionId;

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: [
          { studentId: 'ST-021', name: 'Alyssa Cruz', studentNumber: 'ST-021' },
          { studentId: 'ST-034', name: 'Joshua Lim', studentNumber: 'ST-034' },
        ],
      });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{ student_id: string; first_name: string; last_name: string; student_number: string }>(
      `select se.student_id, s.first_name, s.last_name, s.student_number
       from student_enrollments se
       join students s on s.id = se.student_id
       where se.section_id = $1
       order by s.first_name asc`,
      [sectionId]
    );

    res.status(200).json({
      success: true,
      data: result.rows.map((row) => ({
        studentId: row.student_id,
        name: `${row.first_name} ${row.last_name}`,
        studentNumber: row.student_number,
      })),
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'ENROLLMENT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch section students',
      },
    });
  });
});
