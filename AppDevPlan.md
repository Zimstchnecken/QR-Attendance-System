 # School QR Attendance Monitor - Product and Technical Specification (PRD)

## 1. System Design (Target Architecture)

### 1.1 Client Apps
- Student mobile app (Expo React Native)
- Admin/Teacher mobile app (Expo React Native)
- Optional parent portal (phase 2)

### 1.2 Backend Services
- REST API (Node.js + TypeScript, modular monolith first)
- Auth module (JWT access + refresh, optional MFA)
- Attendance module (session lifecycle, QR rotation, validation, corrections)
- Notification module (push/email/SMS)
- Reporting module (exports, trends, anomalies)
- Integration module (OneRoster/LMS sync)

### 1.3 Data and Infrastructure
- PostgreSQL (source of truth)
- Redis (rate-limit, short-lived QR state, background jobs)
- Object storage (CSV/PDF export files)
- Queue worker (notifications, integrations, nightly analytics)
- Observability (structured logs, metrics, error tracking, audit trail)

### 1.4 Security Model
- Short-lived rotating signed QR payloads
- Replay protection via nonce hash + one-time consumption controls
- Role-based access with deny-by-default
- Per-request authorization checks
- Device and geo context captured for risk scoring
- Immutable audit log for critical actions

## 2. Exact Database Schema (PostgreSQL)

Use this schema as the initial migration baseline (v1):
- Enums:
  - user_role
  - account_status
  - attendance_status
  - session_status
  - correction_status
  - alert_severity
  - notification_channel
- Core tables:
  - schools
  - users
  - user_devices
  - staff_profiles
  - students
  - parents
  - parent_student_links
  - academic_terms
  - sections
  - section_subjects
  - student_enrollments
  - class_sessions
  - qr_sessions
  - attendance_records
  - attendance_events
  - attendance_corrections
  - alerts
  - notification_templates
  - notifications
  - refresh_tokens
  - audit_logs
  - integration_connections
  - integration_sync_runs
- Required constraints:
  - unique student per class session attendance
  - qr session version uniqueness
  - nonce hash uniqueness
  - date/time window check constraints
- Required indexes:
  - users(school_id, role)
  - students(school_id, grade_level)
  - class_sessions(section_subject_id, session_date)
  - attendance_records(class_session_id, status)
  - attendance_events(class_session_id, student_id)
  - alerts(school_id, is_acknowledged, created_at)
  - audit_logs(school_id, created_at)

## 3. API Endpoint Catalog (v1)

Base path: /api/v1

### 3.1 Auth
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/mfa/verify
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /me

### 3.2 School/Term
- GET /schools/current
- GET /terms/active

### 3.3 Roster
- GET /students
- POST /students
- GET /students/:id
- PATCH /students/:id
- GET /sections
- POST /sections
- GET /sections/:id
- POST /sections/:id/enrollments:bulk
- GET /subjects
- POST /subjects

### 3.4 Session and QR
- POST /class-sessions
- GET /class-sessions
- GET /class-sessions/:id
- PATCH /class-sessions/:id/open
- PATCH /class-sessions/:id/close
- POST /class-sessions/:id/qr/rotate
- GET /class-sessions/:id/qr/active

### 3.5 Attendance
- POST /attendance/scan
- POST /attendance/manual
- GET /attendance
- GET /attendance/my
- GET /attendance/summary/class/:id

### 3.6 Corrections
- POST /attendance/corrections
- GET /attendance/corrections
- PATCH /attendance/corrections/:id/approve
- PATCH /attendance/corrections/:id/reject

### 3.7 Alerts/Reports
- GET /alerts
- PATCH /alerts/:id/ack
- GET /reports/daily
- GET /reports/student/:id
- POST /reports/export

### 3.8 Notifications/Audit/Integrations
- GET /notifications
- POST /notifications/test
- GET /audit-logs
- GET /integrations
- POST /integrations/oneroster/sync
- GET /health

## 4. Page-by-Page Wireframe Checklist

### 4.1 P0
- Splash + School Code Select
- Admin Login
- Student Login
- Password Reset
- Student Home
- Student QR Scanner
- Student Attendance History
- Admin Dashboard
- Session Management
- Live QR Control
- Student Registry
- Attendance Logs

### 4.2 P1
- Student Session Detail
- Correction Request Form
- Enrollment Management
- Correction Review Queue
- Alerts Center
- Reports and Analytics
- Audit Log Viewer
- Profile and Device Security

### 4.3 P2
- Notification Templates
- Integrations Settings

Each page must define:
- Core UI blocks
- Required fields and actions
- API dependencies
- Acceptance criteria

## 5. Unique Differentiators

1. Rotating cryptographically signed QR every 20-40 seconds with anti-replay nonce checks.
2. Confidence scoring per attendance record using geo/device/time signals.
3. Real-time anomaly detection for duplicate scans, impossible travel, and mass absence spikes.
4. Policy engine per school/class (late thresholds, geo radius, correction SLA).
5. Parent visibility and correction tracking workflow.
6. Offline-first student scan queue with secure retry and conflict resolution.

## 6. 12-Week Delivery Timeline

- Week 1: Foundation setup (backend, CI, DB migrations, env config)
- Week 2: Auth and RBAC
- Week 3: Core masters (schools/terms/sections/students)
- Week 4: Session lifecycle
- Week 5: QR security engine
- Week 6: Student scan flow
- Week 7: Attendance operations and corrections
- Week 8: Alerts and risk scoring
- Week 9: Reports and exports
- Week 10: Notifications
- Week 11: Hardening and QA
- Week 12: UAT and rollout

## 7. MVP Done Criteria

1. Teacher can open a class session and generate rotating QR.
2. Student can scan and receive immediate attendance confirmation.
3. Admin can view logs, export reports, and handle corrections.
4. Replay and duplicate attempts are blocked and logged.
5. Audit logs exist for sensitive actions.
6. Basic parent notification for late/absence is functional.

## 8. Backend Build Plan

### 8.1 Recommended Stack
- Node.js + TypeScript
- Express or Fastify for the API layer
- PostgreSQL as the system of record
- Prisma or Drizzle for schema and migrations
- Redis for short-lived QR session state, rate limiting, and queue support
- JWT access tokens plus refresh tokens
- Zod for request validation

### 8.2 Project Structure
- `apps/api` for the backend service
- `packages/shared` for shared types, enums, and validation schemas
- `packages/db` for database client and migrations
- `packages/config` for env and runtime configuration
- `apps/worker` for background jobs such as notifications and exports

### 8.3 Build Order
1. Initialize the backend workspace, env loading, logging, and health check.
2. Create the PostgreSQL schema and first migration from the PRD tables.
3. Implement auth with login, refresh, logout, and `GET /me`.
4. Add school, term, roster, section, and enrollment endpoints.
5. Build class session lifecycle endpoints.
6. Add QR session generation, rotation, validation, and anti-replay rules.
7. Add attendance scan and manual attendance endpoints.
8. Add corrections, alerts, reports, and export jobs.
9. Add audit logging and rate limiting.
10. Wire the frontend to the API and replace mock data.

### 8.4 Backend Milestones
- Milestone 1: Backend scaffold, database connection, and auth foundation.
- Milestone 2: Roster and session APIs working end to end.
- Milestone 3: QR scan flow with replay protection.
- Milestone 4: Attendance records, corrections, and audit logs.
- Milestone 5: Reports, notifications, and export jobs.
- Milestone 6: Frontend integration and deployment readiness.

### 8.5 First Endpoints To Ship
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `GET /api/v1/health`
- `GET /api/v1/schools/current`
- `GET /api/v1/terms/active`

### 8.6 Immediate Implementation Notes
- Keep QR payloads short-lived and versioned.
- Store used QR nonces to prevent replay.
- Treat attendance writes as idempotent per student per class session.
- Require server-side authorization on every protected endpoint.
- Start with a modular monolith so the system stays simple while the app is still small.

## 9. Locked Backend Decisions (April 27, 2026)

### 9.1 Stack
- Node.js + TypeScript
- Express or Fastify (implementation can start with Express for faster team familiarity)
- PostgreSQL
- Redis
- JWT access and refresh tokens
- Resend for email delivery

### 9.2 Product Scope
- One school deployment (single-tenant)
- High school context
- Mock seed data for initial development
- Branding stays as ZapRoll

### 9.3 Roles and Access
- Admin: managed in database and full management permissions
- Teacher: teacher-facing view and class/session operations
- Student: student-facing view and attendance actions
- Parent: notification recipient only (no interactive portal in MVP)

### 9.4 Authentication and Password Rules
- Admin provides credentials for teachers and students
- Password reset available through email (Gmail inbox via Resend delivery)
- Parent account login not required in MVP

### 9.5 Attendance and QR Rules
- QR validity window is 24 hours
- Student can scan multiple times, but only first valid attendance is counted
- Duplicate scans are accepted as attempts but marked non-counting
- Late scan logic is not required for this school process
- If a student is offline, they may use a classmate device to sign in and scan

### 9.6 MVP Priority
- Must-have first: auth, roster, class sessions, QR flow, attendance recording, and email notifications
- Later phases: advanced reports, correction workflow expansion, and deeper integrations

### 9.7 Recommended Cloud Choice
- Platform recommendation: Railway
- Why: fastest path for student/capstone deployment with managed Node service, PostgreSQL, Redis, environment variables, and simple CI hookup
- Supporting services: Resend for transactional email, optional Cloudflare for custom domain and TLS management

### 9.8 UX Direction
- Current mobile UI can be iterated during integration
- Backend work is not blocked by UI refresh; API-first delivery remains priority
