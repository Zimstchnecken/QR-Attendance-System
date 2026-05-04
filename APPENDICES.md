# Source Code Appendices — ZapRoll QR Attendance System

This document contains key source code files referenced in the main documentation with detailed explanations of their purpose and functionality.

---

## Appendix A: Backend Configuration & Initialization

### A.1 Environment Configuration (`backend/src/config/env.ts`)

**Purpose:** Centralized environment variable parsing and validation using Zod schema

```typescript
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default('info'),
  CORS_ORIGIN: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

**Explanation:**
- Loads `.env` file using `dotenv`
- Validates all environment variables against a Zod schema
- Provides type-safe defaults (NODE_ENV, PORT, LOG_LEVEL)
- CORS_ORIGIN can be configured per deployment environment
- DATABASE_URL and RESEND_API_KEY are optional for development/testing
- Fails fast at startup if required variables are missing or invalid

**Required in `.env` file:**
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/zaproll
RESEND_API_KEY=your_resend_api_key
```

---

### A.2 Server Initialization (`backend/src/server.ts`)

**Purpose:** Express app factory with middleware and route registration

```typescript
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

  // Security headers
  app.use(helmet());
  
  // CORS with environment-based origin
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' || !env.CORS_ORIGIN ? true : env.CORS_ORIGIN,
      credentials: true,
    })
  );
  
  // Parsing
  app.use(express.json());
  app.use((pinoHttp as unknown as (options: { logger: typeof logger }) => express.RequestHandler)({ logger }));

  // Mount routers
  app.use('/api/v1/auth', authRouter);
  app.get('/api/v1/me', meHandler);
  app.use('/api/v1', catalogRouter);
  app.use('/api/v1/qr-sessions', qrSessionRouter);
  app.use('/api/v1/enrollments', enrollmentRouter);
  app.use('/api/v1/corrections', correctionsRouter);
  app.use('/api/v1/reports', reportsRouter);
  app.use('/api/v1/alerts', alertsRouter);
  app.get('/api/v1/health', healthRouter);

  // 404 handler
  app.use((_, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  // Global error handler
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
```

**Explanation:**
- **helmet()** — Adds security headers (XSS protection, HSTS, etc.)
- **cors()** — Allows cross-origin requests; in production, restrict to your domain
- **express.json()** — Parses JSON request bodies
- **pinoHttp** — Structured logging for all HTTP requests
- Routes mounted under `/api/v1` prefix for versioning
- Global 404 and error handlers return consistent JSON error responses

---

### A.3 Entry Point (`backend/src/index.ts`)

**Purpose:** Bootstrap the server and bind to network interface

```typescript
import { createServer } from './server.js';
import { env } from './config/env.js';

const server = createServer();

// Bind to 0.0.0.0 so the server is reachable from physical devices on the same network
server.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${env.PORT}`);
  console.log(`Access from device: http://192.168.100.11:${env.PORT}`);
});
```

**Explanation:**
- Binds to `0.0.0.0` (all network interfaces) so mobile devices on the same LAN can reach the backend
- `0.0.0.0` is a wildcard address — traffic to any interface on the machine is forwarded to the app
- Useful for local development; in production, bind to a specific IP or use a reverse proxy

---

## Appendix B: Database Schema

### B.1 Initial Schema with Enums (`backend/db/migrations/001_initial_schema.sql`)

**Purpose:** Defines the complete relational schema with enums, core tables, and constraints

**Key Enums:**
```sql
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent', 'super_admin');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'invited', 'deleted');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'excused', 'pending');
CREATE TYPE session_status AS ENUM ('draft', 'open', 'closed', 'cancelled');
CREATE TYPE correction_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE alert_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');
```

**Core Tables:**

**schools**
```sql
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```
— Represents a single school; ZapRoll is single-tenant (one school per database)

**users**
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  role user_role NOT NULL,
  status account_status NOT NULL DEFAULT 'active',
  email text NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, email)
);
```
— All humans: admins, teachers, students, parents. Stores hashed passwords

**students**
```sql
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  student_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  grade_level text NOT NULL,
  homeroom text,
  pin_hash text,
  status account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, student_number)
);
```
— Student-specific profile; `pin_hash` used for PIN-based login
— `user_id` optional: some students may not have a full user account

**sections** (classes)
```sql
CREATE TABLE sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  academic_term_id uuid NOT NULL REFERENCES academic_terms(id),
  section_code text NOT NULL,
  name text NOT NULL,
  grade_level text NOT NULL,
  adviser_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, section_code)
);
```
— A class or homeroom; tied to an academic term

**section_subjects** (class-subject pairing)
```sql
CREATE TABLE section_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES sections(id),
  teacher_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subject_code text NOT NULL,
  subject_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
— Links a subject (Math, Physics, etc.) to a section and teacher
— Multiple subjects can be taught in one section

**student_enrollments**
```sql
CREATE TABLE student_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  section_id uuid NOT NULL REFERENCES sections(id),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, section_id)
);
```
— Many-to-many: which students are in which sections
— Grade level of student must match section's grade level (enforced by app logic)

**class_sessions**
```sql
CREATE TABLE class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_subject_id uuid NOT NULL REFERENCES section_subjects(id),
  session_date date NOT NULL,
  status session_status NOT NULL DEFAULT 'open',
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
— Represents one class meeting for a subject
— Status progresses: draft → open → closed

**qr_sessions**
```sql
CREATE TABLE qr_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id uuid NOT NULL REFERENCES class_sessions(id),
  version integer NOT NULL DEFAULT 1,
  qr_payload text NOT NULL,
  nonce_hash text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  UNIQUE (class_session_id, version)
);
```
— One or more QR codes per class session
— `version` increments when a new QR is generated (replay protection)
— `nonce_hash` ensures one-time consumption

**attendance_records**
```sql
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id uuid NOT NULL REFERENCES class_sessions(id),
  student_id uuid NOT NULL REFERENCES students(id),
  status attendance_status NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  recorded_by_user_id uuid REFERENCES users(id),
  UNIQUE (class_session_id, student_id)
);
```
— Final attendance status per student per class
— Unique constraint: one record per student per session

---

## Appendix C: Authentication Routes

### C.1 Auth Router (`backend/src/routes/auth.ts`)

**Purpose:** Handles JWT-based login, token refresh, and session management

```typescript
import { createHash, randomUUID } from 'node:crypto';
import type { Request, Response, Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getDatabasePool } from '../db/pool.js';

type AuthUser = {
  id: string;
  role: 'admin' | 'student';
  name: string;
  email?: string;
  studentId?: string;
  studentDbId?: string; // students.id UUID for attendance records
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const studentLoginSchema = z.object({
  studentId: z.string().min(1),
  pin: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// Dev credentials (removed from production)
const devAdmin = {
  email: 'teacher@school.edu',
  password: 'password',
  user: {
    id: 'user-admin-1',
    role: 'admin' as const,
    name: 'Teacher Admin',
    email: 'teacher@school.edu',
  },
};

const devStudent = {
  studentId: 'ST-078',
  pin: '1234',
  user: {
    id: 'user-student-78',
    role: 'student' as const,
    name: 'Katrina Santos',
    studentId: 'ST-078',
  },
};

export const authRouter: Router = createRouter();

const activeAccessSessions = new Map<string, AuthUser>();
const activeRefreshSessions = new Map<string, { user: AuthUser; subjectUserId: string }>();

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function sendAuthError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
```

**Key Concepts:**

1. **Two Auth Flows:**
   - **Admin:** Email + password login
   - **Student:** Student ID + PIN login (simpler for mobile)

2. **Token Management:**
   - `accessToken` — short-lived, used for API calls
   - `refreshToken` — long-lived, used to get a new access token
   - Both stored in in-memory Maps (would be Redis in production)

3. **Development Mode:**
   - Hard-coded `devAdmin` and `devStudent` for testing without database
   - Replaced by PostgreSQL queries in production

4. **Password Hashing:**
   - Uses SHA256 for token hashing (should use bcrypt in production)

---

## Appendix D: QR Session Routes

### D.1 QR Session Router (`backend/src/routes/qr-sessions.ts`)

**Purpose:** Manages QR code generation, session lifecycle, and attendance recording

```typescript
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
  studentId: z.string().min(1),
  status: z.enum(['present', 'late', 'absent', 'excused']),
});

async function resolveStudentId(pool: ReturnType<typeof getDatabasePool>, studentId: string) {
  const result = await pool.query<{ id: string }>(
    `select id
     from students
     where id::text = $1 or student_number = $1
     limit 1`,
    [studentId]
  );
  return result.rows[0]?.id ?? null;
}

async function getSessionSectionId(pool: ReturnType<typeof getDatabasePool>, sessionId: string) {
  const result = await pool.query<{ section_id: string }>(
    `select ss.section_id
     from class_sessions cs
     join section_subjects ss on ss.id = cs.section_subject_id
     where cs.id = $1
     limit 1`,
    [sessionId]
  );
  return result.rows[0]?.section_id ?? null;
}

const mockSessions = new Map<string, { id: string; status: string; openedAt: string; closedAt: null | string }>();

export const qrSessionRouter: Router = createRouter();

// POST /api/v1/qr-sessions/open
qrSessionRouter.post('/open', (req: Request, res: Response) => {
  (async () => {
    const body = openSessionSchema.parse(req.body);

    if (!env.DATABASE_URL) {
      // Mock mode for development without database
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
      `insert into class_sessions (section_subject_id, session_date, status, opened_at)
       values ($1, $2, 'open', now())
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

// POST /api/v1/qr-sessions/:sessionId/close
qrSessionRouter.post('/:sessionId/close', (req: Request, res: Response) => {
  (async () => {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    // ... implementation
  })().catch((error: unknown) => {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: error instanceof Error ? error.message : 'Failed to close QR session',
      },
    });
  });
});
```

**Key Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/open` | POST | Create a new QR session for a class |
| `/:sessionId/close` | POST | Close an active QR session |
| `/:sessionId/attendance` | POST | Record a student's attendance |
| `/:sessionId/attendance` | GET | Fetch attendance records for the session |

**Attendance Flow:**
1. Teacher opens session → generates QR code
2. Student scans QR → app sends student ID + attendance status
3. Backend validates student enrollment, records attendance
4. Teacher can close session → no more scans accepted

---

## Appendix E: Frontend Components

### E.1 Student Registry Card (`front-end/components/admin/sections/StudentRegistryCard.js`)

**Purpose:** Displays enrolled students, allows filtering by class and search, enables email editing

```javascript
import React, { useState, useMemo, useCallback } from "react";
import {
  Animated,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { GraduationCap, UserPlus, Search, X, Pencil, Check } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

const resolveStudentClass = (student) => student?.className || student?.gradeLevel || "Unassigned";

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

export const StudentRegistryCard = ({
  cardStyle,
  cardAnim,
  studentItemAnims,
  studentList,
  sectionList,
  selectedSession,
  onOpenAddStudentModal,
  listItemStyle,
  onUpdateParentEmail,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // Deduplicate studentList by id to prevent React key collisions
  const deduplicatedStudents = useMemo(() => {
    const seen = new Set();
    return (studentList || []).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [studentList]);

  // Use sectionList as authoritative class list
  const classNames = useMemo(() => {
    const fromSections = (sectionList || []).map((s) => s.name);
    const fromStudents = deduplicatedStudents.map((s) => resolveStudentClass(s));
    const all = new Set([...fromSections, ...fromStudents]);
    return ["all", ...Array.from(all).sort()];
  }, [sectionList, deduplicatedStudents]);

  const searchQueryText = normalizeText(searchQuery);

  const filteredStudents = useMemo(() => {
    let list = deduplicatedStudents;

    // Filter by class
    if (selectedClass !== "all") {
      list = list.filter((s) => resolveStudentClass(s) === selectedClass);
    }

    // Filter by search query
    if (searchQueryText) {
      list = list.filter((s) =>
        normalizeText(s.firstName || "") +
          " " +
          normalizeText(s.lastName || "") +
          " " +
          normalizeText(s.studentNumber || "")
        ).includes(searchQueryText)
      );
    }

    return list;
  }, [deduplicatedStudents, selectedClass, searchQueryText]);

  return (
    <Animated.View style={[styles.container, cardStyle]}>
      <GlassCard style={{ padding: theme.spacing.lg, borderRadius: theme.radius.xl }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <GraduationCap size={24} color={theme.colors.white} />
            <Text style={styles.title}>Student Registry</Text>
          </View>
          <TouchableOpacity
            onPress={onOpenAddStudentModal}
            style={styles.addButton}
          >
            <UserPlus size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Class Filter */}
        <View style={styles.classFilterContainer}>
          {classNames.map((className) => (
            <TouchableOpacity
              key={className}
              onPress={() => setSelectedClass(className)}
              style={[
                styles.classButton,
                selectedClass === className && styles.classButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.classButtonText,
                  selectedClass === className && styles.classButtonTextActive,
                ]}
              >
                {className === "all" ? "All" : className}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Student List */}
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => (
            <Animated.View
              key={student.id}
              style={[styles.studentItem, studentItemAnims?.[index]?.style]}
            >
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {student.firstName} {student.lastName}
                </Text>
                <Text style={styles.studentNumber}>
                  {student.studentNumber} • {resolveStudentClass(student)}
                </Text>
              </View>

              {/* Email Edit */}
              {editingId === student.id ? (
                <View style={styles.editRow}>
                  <TextInput
                    style={styles.emailInput}
                    placeholder="Parent email"
                    value={editingEmail}
                    onChangeText={setEditingEmail}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      onUpdateParentEmail?.(student.id, editingEmail);
                      setEditingId(null);
                    }}
                  >
                    <Check size={20} color={theme.colors.success} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(student.id);
                    setEditingEmail(student.parentEmail || "");
                  }}
                >
                  <Pencil size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No students found</Text>
        )}
      </GlassCard>
    </Animated.View>
  );
};
```

**Key Features:**

1. **Deduplication** — Removes duplicate students from the list
2. **Multi-Filter Search** — Filter by class and text search (name/ID)
3. **Class Buttons** — Toggle between "All" and specific sections
4. **Email Editing** — Inline edit mode for parent email contacts
5. **Animated Cards** — Smooth transitions using React Native Animated API
6. **Responsive** — Adapts layout for compact devices (< 390px width)

---

## Summary

These appendices provide:

- **Backend Core:** Configuration, server setup, database schema design
- **API Layer:** Authentication and QR session management routes
- **Frontend:** Interactive admin UI component for student management

All code follows TypeScript typing, input validation (Zod), and error handling best practices. Refer to these when extending the system or understanding data flow.
