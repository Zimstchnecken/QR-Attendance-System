import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';

import { env } from '../config/env.js';
import { getDatabasePool } from '../db/pool.js';

const currentSchool = {
  id: 'school-1',
  name: 'ZapRoll Academy',
  code: 'ZP-001',
};

const activeTerm = {
  id: 'term-2026-1',
  name: 'SY 2025-2026 - Term 2',
  isActive: true,
};

const students = [
  { id: 'ST-021', name: 'Alyssa Cruz', parent: 'alyssa.parent@mail.com' },
  { id: 'ST-034', name: 'Joshua Lim', parent: 'lim.family@mail.com' },
  { id: 'ST-078', name: 'Katrina Santos', parent: 'k.santos@mail.com' },
];

const sections = [
  { id: 'SEC-10A', name: 'Grade 10 - Newton', subject: 'Mathematics' },
  { id: 'SEC-11B', name: 'Grade 11 - Einstein', subject: 'Physics' },
  { id: 'SEC-12S', name: 'Grade 12 - STEM A', subject: 'Capstone' },
];

const classSessions = [
  { id: 'S1', className: 'Grade 10 - Newton', present: 37, total: 41, status: 'Active', isLastPeriod: false },
  { id: 'S2', className: 'Grade 11 - Einstein', present: 32, total: 39, status: 'Inactive', isLastPeriod: false },
  { id: 'S3', className: 'Grade 12 - STEM A', present: 28, total: 30, status: 'Active', isLastPeriod: true },
];

export const catalogRouter: Router = createRouter();

async function getSchools() {
  if (!env.DATABASE_URL) {
    return [currentSchool];
  }

  const pool = getDatabasePool();
  const result = await pool.query<{ id: string; code: string; name: string }>(
    'select id, code, name from schools order by created_at asc limit 1'
  );

  if (result.rows.length === 0) {
    return [currentSchool];
  }

  return result.rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
  }));
}

async function getActiveTerms(schoolId: string) {
  if (!env.DATABASE_URL) {
    return [activeTerm];
  }

  const pool = getDatabasePool();
  const result = await pool.query<{ id: string; name: string; is_active: boolean }>(
    `select id, name, is_active
     from academic_terms
     where school_id = $1 and is_active = true
     order by starts_on desc
     limit 1`,
    [schoolId]
  );

  if (result.rows.length === 0) {
    return [activeTerm];
  }

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    isActive: row.is_active,
  }));
}

async function getStudents(schoolId: string) {
  if (!env.DATABASE_URL) {
    return students;
  }

  const pool = getDatabasePool();
  // Use DISTINCT ON to avoid duplicate rows when a student has multiple enrollments
  const result = await pool.query<{
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
    grade_level: string;
    section_name: string | null;
    section_id: string | null;
    email: string | null;
  }>(
    `select distinct on (s.id)
            s.id, s.first_name, s.last_name, s.student_number, s.grade_level,
            sec.name as section_name, sec.id as section_id,
            p.email
     from students s
     left join student_enrollments se on se.student_id = s.id
     left join sections sec on sec.id = se.section_id
     left join parent_student_links psl on psl.student_id = s.id
     left join parents p on p.id = psl.parent_id
     where s.school_id = $1 and s.status = 'active'
     order by s.id, sec.name asc nulls last`,
    [schoolId]
  );

  if (result.rows.length === 0) {
    return students;
  }

  return result.rows.map((row) => ({
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    studentNumber: row.student_number,
    gradeLevel: row.grade_level,
    className: row.section_name ?? row.grade_level,
    sectionId: row.section_id ?? null,
    parent: row.email ?? undefined,
  }));
}

async function getSections(schoolId: string, termId: string) {
  if (!env.DATABASE_URL) {
    return sections;
  }

  const pool = getDatabasePool();
  // DISTINCT ON ensures one row per section even if it has multiple subjects
  const result = await pool.query<{ id: string; name: string }>(
    `select distinct on (sec.id) sec.id, sec.name
     from sections sec
     where sec.school_id = $1 and sec.academic_term_id = $2 and sec.is_active = true
     order by sec.id, sec.name asc`,
    [schoolId, termId]
  );

  if (result.rows.length === 0) {
    return sections;
  }

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

async function getClassSessions(schoolId: string) {
  if (!env.DATABASE_URL) {
    return classSessions;
  }

  const pool = getDatabasePool();
  const result = await pool.query<{
    id: string;
    name: string;
    present: number;
    total: number;
    status: string;
  }>(
    `select cs.id, sec.name,
            count(case when ar.status = 'present' then 1 end)::int as present,
            count(ar.id)::int as total,
            cs.status
     from class_sessions cs
     join section_subjects ss on ss.id = cs.section_subject_id
     join sections sec on sec.id = ss.section_id
     left join attendance_records ar on ar.class_session_id = cs.id
     where sec.school_id = $1
     group by cs.id, sec.name, cs.status
     order by cs.created_at desc`,
    [schoolId]
  );

  if (result.rows.length === 0) {
    return classSessions;
  }

  return result.rows.map((row) => ({
    id: row.id,
    className: row.name,
    present: row.present,
    total: row.total,
    status: row.status === 'open' ? 'Active' : 'Inactive',
    isLastPeriod: false,
  }));
}

catalogRouter.get('/schools/current', (_req: Request, res: Response) => {
  (async () => {
    const schools = await getSchools();
    res.status(200).json({ success: true, data: schools[0] });
  })().catch((error: unknown) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: error instanceof Error ? error.message : 'Catalog lookup failed',
      },
    });
  });
});

catalogRouter.get('/terms/active', (_req: Request, res: Response) => {
  (async () => {
    const schools = await getSchools();
    const schoolId = schools[0]?.id ?? 'school-1';
    const terms = await getActiveTerms(schoolId);
    res.status(200).json({ success: true, data: terms[0] });
  })().catch((error: unknown) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: error instanceof Error ? error.message : 'Catalog lookup failed',
      },
    });
  });
});

catalogRouter.get('/students', (_req: Request, res: Response) => {
  (async () => {
    const schools = await getSchools();
    const schoolId = schools[0]?.id ?? 'school-1';
    const studentList = await getStudents(schoolId);
    res.status(200).json({ success: true, data: studentList });
  })().catch((error: unknown) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: error instanceof Error ? error.message : 'Catalog lookup failed',
      },
    });
  });
});

catalogRouter.get('/sections', (_req: Request, res: Response) => {
  (async () => {
    const schools = await getSchools();
    const schoolId = schools[0]?.id ?? 'school-1';
    const termsResult = await getActiveTerms(schoolId);
    const termId = termsResult[0]?.id ?? 'term-2026-1';
    const sectionList = await getSections(schoolId, termId);
    res.status(200).json({ success: true, data: sectionList });
  })().catch((error: unknown) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: error instanceof Error ? error.message : 'Catalog lookup failed',
      },
    });
  });
});

catalogRouter.get('/class-sessions', (_req: Request, res: Response) => {
  (async () => {
    const schools = await getSchools();
    const schoolId = schools[0]?.id ?? 'school-1';
    const sessionList = await getClassSessions(schoolId);
    res.status(200).json({ success: true, data: sessionList });
  })().catch((error: unknown) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: error instanceof Error ? error.message : 'Catalog lookup failed',
      },
    });
  });
});

// Mock fallback for section subjects
const mockSectionSubjects = [
  {
    id: '99999999-9999-9999-9999-999999999999',
    subjectCode: 'MATH10',
    subjectName: 'Mathematics',
    meetingDays: ['Monday', 'Wednesday', 'Friday'],
  },
];

catalogRouter.get('/sections/:sectionId/subjects', (req: Request, res: Response) => {
  (async () => {
    const sectionId = Array.isArray(req.params.sectionId) ? req.params.sectionId[0] : req.params.sectionId;

    if (!env.DATABASE_URL) {
      return res.status(200).json({ success: true, data: mockSectionSubjects });
    }

    const pool = getDatabasePool();
    const result = await pool.query<{
      id: string;
      subject_code: string;
      subject_name: string;
      meeting_days: string[] | null;
    }>(
      `select ss.id, ss.subject_code, ss.subject_name, ss.meeting_days
       from section_subjects ss
       where ss.section_id = $1
       order by ss.subject_name asc`,
      [sectionId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, data: mockSectionSubjects });
    }

    return res.status(200).json({
      success: true,
      data: result.rows.map((row) => ({
        id: row.id,
        subjectCode: row.subject_code,
        subjectName: row.subject_name,
        meetingDays: row.meeting_days ?? [],
      })),
    });
  })().catch((error: unknown) => {
    res.status(500).json({
      success: false,
      error: {
        code: 'CATALOG_ERROR',
        message: error instanceof Error ? error.message : 'Catalog lookup failed',
      },
    });
  });
});

// ── Bulk Import ─────────────────────────────────────────────────────────────
const bulkStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  studentNumber: z.string().optional(),
  gradeLevel: z.string().min(1),
  parentEmail: z.string().email().optional(),
  sectionName: z.string().optional(),
});

const bulkImportSchema = z.object({
  students: z.array(bulkStudentSchema),
});

catalogRouter.post('/students/bulk', (req: Request, res: Response) => {
  (async () => {
    const { students: importList } = bulkImportSchema.parse(req.body);
    
    if (!env.DATABASE_URL) {
      return res.status(200).json({ 
        success: true, 
        data: { imported: importList.length, total: importList.length } 
      });
    }

    const pool = getDatabasePool();
    const resultSchools = await pool.query<{ id: string }>('select id from schools limit 1');
    const schoolId = resultSchools.rows[0]?.id;

    if (!schoolId) {
      throw new Error('No school found to associate students with.');
    }

    let importedCount = 0;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const std of importList) {
        const studentResult = await client.query<{ id: string }>(
          `insert into students (school_id, first_name, last_name, student_number, grade_level)
           values ($1, $2, $3, $4, $5)
           returning id`,
          [schoolId, std.firstName, std.lastName, std.studentNumber || null, std.gradeLevel]
        );
        const studentId = studentResult.rows[0].id;

        if (std.parentEmail) {
          let parentResult = await client.query<{ id: string }>(
            'select id from parents where email = $1',
            [std.parentEmail.toLowerCase()]
          );
          
          let parentId;
          if (parentResult.rows.length === 0) {
            parentResult = await client.query<{ id: string }>(
              'insert into parents (first_name, last_name, email) values ($1, $2, $3) returning id',
              ['Parent', std.lastName, std.parentEmail.toLowerCase()]
            );
          }
          parentId = parentResult.rows[0].id;

          await client.query(
            'insert into parent_student_links (parent_id, student_id, relationship) values ($1, $2, $3)',
            [parentId, studentId, 'Parent']
          );
        }

        if (std.sectionName) {
          const sectionResult = await client.query<{ id: string }>(
            'select id from sections where school_id = $1 and name = $2',
            [schoolId, std.sectionName]
          );
          
          if (sectionResult.rows.length > 0) {
            await client.query(
              'insert into student_enrollments (student_id, section_id) values ($1, $2)',
              [studentId, sectionResult.rows[0].id]
            );
          }
        }
        
        importedCount++;
      }
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.status(200).json({ 
      success: true, 
      data: { imported: importedCount, total: importList.length } 
    });
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'IMPORT_ERROR',
        message: error instanceof Error ? error.message : 'Bulk import failed',
      },
    });
  });
});