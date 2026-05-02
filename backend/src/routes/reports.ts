import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';

import { env } from '../config/env.js';
import { getDatabasePool } from '../db/pool.js';

const dateRangeSchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  sectionId: z.string().optional(),
});

export const reportsRouter: Router = createRouter();

reportsRouter.get('/attendance-summary', (req: Request, res: Response) => {
  (async () => {
    const query = dateRangeSchema.parse(req.query);

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: {
          totalSessions: 42,
          totalStudents: 312,
          averageAttendanceRate: 0.87,
          byStatus: {
            present: 272,
            late: 25,
            absent: 12,
            excused: 3,
          },
          bySection: [
            { sectionId: 'SEC-10A', name: 'Grade 10 - Newton', attendanceRate: 0.89 },
            { sectionId: 'SEC-11B', name: 'Grade 11 - Einstein', attendanceRate: 0.86 },
            { sectionId: 'SEC-12S', name: 'Grade 12 - STEM A', attendanceRate: 0.85 },
          ],
        },
      });
    }

    const pool = getDatabasePool();

    let whereClause = '';
    const params: (string | null)[] = [];

    if (query.startDate) {
      whereClause += ' and cs.session_date >= $' + (params.length + 1);
      params.push(query.startDate);
    }
    if (query.endDate) {
      whereClause += ' and cs.session_date <= $' + (params.length + 1);
      params.push(query.endDate);
    }
    if (query.sectionId) {
      whereClause += ' and sec.id = $' + (params.length + 1);
      params.push(query.sectionId);
    }

    const result = await pool.query<{
      total_sessions: number;
      total_students: number;
      present_count: number;
      late_count: number;
      absent_count: number;
      excused_count: number;
    }>(
      `select count(distinct cs.id) as total_sessions,
              count(distinct se.student_id) as total_students,
              count(case when ar.status = 'present' then 1 end) as present_count,
              count(case when ar.status = 'late' then 1 end) as late_count,
              count(case when ar.status = 'absent' then 1 end) as absent_count,
              count(case when ar.status = 'excused' then 1 end) as excused_count
       from class_sessions cs
       join section_subjects ss on ss.id = cs.section_subject_id
       join sections sec on sec.id = ss.section_id
       join student_enrollments se on se.section_id = sec.id
       left join attendance_records ar on ar.class_session_id = cs.id and ar.student_id = se.student_id
       where 1=1 ${whereClause}`,
      params.length > 0 ? params : undefined
    );

    const summary = result.rows[0];
    const totalRecords = summary.present_count + summary.late_count + summary.absent_count + summary.excused_count;
    const attendanceRate = totalRecords > 0 ? (summary.present_count + summary.late_count) / totalRecords : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSessions: summary.total_sessions,
        totalStudents: summary.total_students,
        averageAttendanceRate: parseFloat(attendanceRate.toFixed(2)),
        byStatus: {
          present: summary.present_count,
          late: summary.late_count,
          absent: summary.absent_count,
          excused: summary.excused_count,
        },
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate attendance summary',
      },
    });
  });
});

reportsRouter.get('/student-attendance/:studentId', (req: Request, res: Response) => {
  (async () => {
    const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
    const query = dateRangeSchema.parse(req.query);

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: {
          studentId,
          totalSessions: 42,
          attendanceBreakdown: {
            present: 35,
            late: 4,
            absent: 2,
            excused: 1,
          },
          attendanceRate: 0.93,
          recentRecords: [
            {
              sessionId: 'S1',
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              status: 'present',
            },
            {
              sessionId: 'S2',
              date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
              status: 'late',
            },
          ],
        },
      });
    }

    const pool = getDatabasePool();

    let whereClause = 'ar.student_id = $1';
    const params: (string | null)[] = [studentId];

    if (query.startDate) {
      whereClause += ' and cs.session_date >= $' + (params.length + 1);
      params.push(query.startDate);
    }
    if (query.endDate) {
      whereClause += ' and cs.session_date <= $' + (params.length + 1);
      params.push(query.endDate);
    }

    const result = await pool.query<{
      total_sessions: number;
      present_count: number;
      late_count: number;
      absent_count: number;
      excused_count: number;
    }>(
      `select count(distinct cs.id) as total_sessions,
              count(case when ar.status = 'present' then 1 end) as present_count,
              count(case when ar.status = 'late' then 1 end) as late_count,
              count(case when ar.status = 'absent' then 1 end) as absent_count,
              count(case when ar.status = 'excused' then 1 end) as excused_count
       from attendance_records ar
       join class_sessions cs on cs.id = ar.class_session_id
       where ${whereClause}`,
      params
    );

    const summary = result.rows[0] || { total_sessions: 0, present_count: 0, late_count: 0, absent_count: 0, excused_count: 0 };
    const totalRecords = summary.present_count + summary.late_count + summary.absent_count + summary.excused_count;
    const attendanceRate = totalRecords > 0 ? (summary.present_count + summary.late_count) / totalRecords : 0;

    const recentResult = await pool.query<{ session_id: string; session_date: string; status: string; section_name: string; scanned_at: string | null }>(
      `select cs.id as session_id, cs.session_date, ar.status, sec.name as section_name, ar.scanned_at
       from attendance_records ar
       join class_sessions cs on cs.id = ar.class_session_id
       join section_subjects ss on ss.id = cs.section_subject_id
       join sections sec on sec.id = ss.section_id
       where ar.student_id = $1
       order by cs.session_date desc
       limit 20`,
      [studentId]
    );

    res.status(200).json({
      success: true,
      data: {
        studentId,
        totalSessions: summary.total_sessions,
        attendanceBreakdown: {
          present: summary.present_count,
          late: summary.late_count,
          absent: summary.absent_count,
          excused: summary.excused_count,
        },
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        recentRecords: recentResult.rows.map((row) => ({
          sessionId: row.session_id,
          date: row.session_date,
          status: row.status,
          className: row.section_name,
          scannedAt: row.scanned_at,
        })),
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate student attendance report',
      },
    });
  });
});

reportsRouter.get('/section-analytics/:sectionId', (req: Request, res: Response) => {
  (async () => {
    const sectionId = Array.isArray(req.params.sectionId) ? req.params.sectionId[0] : req.params.sectionId;

    if (!env.DATABASE_URL) {
      return res.status(200).json({
        success: true,
        data: {
          sectionId,
          sectionName: 'Grade 10 - Newton',
          totalStudents: 41,
          sessionsHeld: 42,
          attendanceRate: 0.87,
          topAttendees: [
            { studentId: 'ST-021', name: 'Alyssa Cruz', rate: 0.98 },
            { studentId: 'ST-034', name: 'Joshua Lim', rate: 0.95 },
          ],
          needsAttention: [
            { studentId: 'ST-056', name: 'Marco Santos', rate: 0.62, absences: 16 },
          ],
        },
      });
    }

    const pool = getDatabasePool();

    const result = await pool.query<{
      section_name: string;
      total_students: number;
      total_sessions: number;
      present_count: number;
      total_records: number;
    }>(
      `select sec.name as section_name,
              count(distinct se.student_id) as total_students,
              count(distinct cs.id) as total_sessions,
              count(case when ar.status = 'present' then 1 end) as present_count,
              count(ar.id) as total_records
       from sections sec
       join student_enrollments se on se.section_id = sec.id
       left join class_sessions cs on cs.section_subject_id in (
         select ss.id from section_subjects ss where ss.section_id = sec.id
       )
       left join attendance_records ar on ar.class_session_id = cs.id and ar.student_id = se.student_id
       where sec.id = $1
       group by sec.name`,
      [sectionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Section not found' },
      });
    }

    const analytics = result.rows[0];
    const attendanceRate = analytics.total_records > 0 ? analytics.present_count / analytics.total_records : 0;

    res.status(200).json({
      success: true,
      data: {
        sectionId,
        sectionName: analytics.section_name,
        totalStudents: analytics.total_students,
        sessionsHeld: analytics.total_sessions,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      },
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'REPORT_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate section analytics',
      },
    });
  });
});
