# ZapRoll — QR Attendance System

ZapRoll is a QR-based school attendance system built for single-school deployments. Teachers open a live QR session from the admin app; students scan the code with their phones to mark themselves present. All records are stored in PostgreSQL and parents can receive automated email notifications.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Prerequisites](#3-prerequisites)
4. [Backend Setup](#4-backend-setup)
5. [Frontend Setup](#5-frontend-setup)
6. [Default Credentials](#6-default-credentials)
7. [API Endpoints](#7-api-endpoints)
8. [Database Schema](#8-database-schema)
9. [Admin Dashboard Features](#9-admin-dashboard-features)
10. [Student App Features](#10-student-app-features)
11. [Email Automation](#11-email-automation)
12. [Troubleshooting](#12-troubleshooting)
13. [Running Both Servers](#13-running-both-servers)

---

## 1. Project Overview

ZapRoll replaces paper sign-in sheets with a real-time QR scanning workflow:

- A teacher opens a session → a QR code is generated and displayed on their device.
- Students scan the code with the Expo Go app → attendance is recorded instantly.
- Admins can view live counts, browse historical logs, manage the student registry, and trigger email alerts to parents.

**Tech stack**

| Layer | Technology |
|---|---|
| Backend | Node.js 18 + TypeScript + Express |
| Database | PostgreSQL 12+ |
| Transactional email | Resend |
| Frontend | React Native + Expo (JavaScript) |
| Styling | NativeWind (Tailwind for RN) |

The system is intentionally single-tenant — one database, one school.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Mobile App (Expo)                  │
│   Admin views: dashboard, QR, registry, logs, email │
│   Student views: home, scanner, history             │
└────────────────────┬────────────────────────────────┘
                     │ HTTP REST  (same WiFi / LAN)
┌────────────────────▼────────────────────────────────┐
│           Backend  (Express + TypeScript)           │
│           Modular monolith · REST API /api/v1       │
│           JWT auth · Resend email service           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              PostgreSQL database                    │
│              20+ tables · migration-managed         │
└─────────────────────────────────────────────────────┘
```

- **Backend** — modular monolith with one Express router file per domain (auth, students, sections, qr-sessions, reports, alerts, …). All routes are mounted under `/api/v1`.
- **Frontend** — a single Expo project that serves both the admin and student experiences via separate screen files (`app/admin.js`, `app/student.js`).
- **Database** — schema is managed through numbered SQL migration files in `backend/db/migrations/`. Running `npm run db:migrate` applies them in order.
- **Email** — Resend handles all outbound email. A valid `RESEND_API_KEY` is required for alert features to work.

---

## 3. Prerequisites

Install the following before starting:

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **PostgreSQL 12+** — [postgresql.org](https://www.postgresql.org/download/)
- **npm** — bundled with Node.js
- **Expo CLI**
  ```bash
  npm install -g expo-cli
  ```
- **Expo Go** — install on your physical mobile device from the App Store or Google Play (used for testing on a real device)

---

## 4. Backend Setup

```bash
# 1. Enter the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
```

Open `backend/.env` and set it to exactly this (replace the DB password and IP with yours):

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
CORS_ORIGIN=*
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/qr_attendance
RESEND_API_KEY=your_resend_api_key
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3001
```

**Example with real values (this project's current config):**

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=info
CORS_ORIGIN=*
DATABASE_URL=postgresql://postgres:136652100043@localhost:5432/qr_attendance
RESEND_API_KEY=re_fSgWy5eH_N2jexNaXPzCsaouWvwPFYWRr
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.11:3001
```

> `192.168.100.11` is the machine's local WiFi IP. Run `ipconfig` on Windows to find yours — look for **IPv4 Address** under your WiFi adapter. Update this every time your IP changes.

```bash
# 4. Create the PostgreSQL database
# Option A — using psql CLI:
psql -U postgres -c "CREATE DATABASE qr_attendance;"

# Option B — using pgAdmin:
# Right-click Databases → Create → Database → name it qr_attendance

# 5. Run all migrations (creates tables + seeds default data)
npm run db:migrate

# 6. Start the development server
npm run dev
```

**Verify it's running** — open your browser and visit:

```
http://localhost:3001/api/v1/health
```

You should see `{ "status": "ok" }`.

> **Port already in use?** Run `npx kill-port 3001` then `npm run dev` again.

---

## 5. Frontend Setup

```bash
# 1. Enter the frontend directory
cd front-end

# 2. Install dependencies
npm install
```

**Find your machine's local IP address**

The mobile app talks to the backend over your local WiFi — it cannot use `localhost` because that only works on the same machine.

- **Windows**: Run `ipconfig` → look for **IPv4 Address** under your active WiFi adapter
- **macOS/Linux**: Run `ifconfig` or check System Preferences → Network

**Create `front-end/.env.local`** with your IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3001
```

**Example with real values (this project's current config):**

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.11:3001
```

> Update this whenever your IP changes (e.g. after reconnecting to WiFi).

```bash
# 3. Start the Expo development server
npm start
```

**Running on a device or emulator**

| Method | How |
|---|---|
| Physical device | Scan the QR code shown in the terminal with the **Expo Go** app. Phone must be on the **same WiFi** as your computer. |
| Android emulator | Press `a` in the Expo terminal |
| iOS simulator | Press `i` in the Expo terminal (macOS only) |

---

## 5a. Student Login Setup

The student app uses a **Student ID + PIN** to log in (not email/password).

Default student credentials seeded by migrations:

| Student ID | PIN | Name |
|---|---|---|
| `ST-078` | `1234` | Katrina Santos |

**How student login works:**
1. On the login screen, tap **Switch to Student** (or open the student login screen directly)
2. Enter the Student ID (e.g. `ST-078`) and PIN (e.g. `1234`)
3. The app fetches the student's attendance history from the backend on login

**To add more students with PINs**, run this SQL against your database (replace values as needed):

```sql
-- Set a PIN for an existing student
UPDATE students
SET pin_hash = crypt('1234', gen_salt('bf'))
WHERE student_number = 'ST-021';
```

Or add a new student with a PIN via the Admin → Registry → Add Student flow.

---

## 6. Default Credentials

These are seeded by the migration scripts and are for local development only.

| Role | Username / ID | Password |
|---|---|---|
| Admin (teacher) | `teacher@school.edu` | `password` |
| Student | `ST-078` | `1234` |

---

## 7. API Endpoints

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Log in, returns access + refresh tokens |
| POST | `/auth/refresh` | Exchange refresh token for new access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/me` | Get current authenticated user |

### Catalog

| Method | Path | Description |
|---|---|---|
| GET | `/schools/current` | Get the school record |
| GET | `/terms/active` | Get the currently active academic term |
| GET | `/students` | List all students |
| GET | `/sections` | List all sections |
| GET | `/sections/:sectionId/subjects` | List subjects for a section |
| GET | `/class-sessions` | List class sessions |

### QR Sessions

| Method | Path | Description |
|---|---|---|
| POST | `/qr-sessions/open` | Open a new QR attendance session |
| POST | `/qr-sessions/:sessionId/close` | Close an active session |
| GET | `/qr-sessions/:sessionId` | Get session details and current QR code |
| POST | `/qr-sessions/:sessionId/attendance` | Submit attendance (student scan) |
| GET | `/qr-sessions/:sessionId/attendance` | Get attendance records for a session |

### Enrollments

| Method | Path | Description |
|---|---|---|
| GET | `/enrollments/available?sectionId=` | List students available to enroll in a section |
| POST | `/enrollments/enroll` | Enroll a student in a section |
| GET | `/enrollments/section/:sectionId` | List enrollments for a section |

### Reports

| Method | Path | Description |
|---|---|---|
| GET | `/reports/attendance-summary` | School-wide attendance summary |
| GET | `/reports/student-attendance/:studentId` | Attendance history for a student |
| GET | `/reports/section-analytics/:sectionId` | Analytics for a section |

### Alerts / Email

| Method | Path | Description |
|---|---|---|
| POST | `/alerts/send-alert` | Send a custom alert email |
| POST | `/alerts/send-attendance-summary` | Send an attendance summary email |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Returns `{ "status": "ok" }` — use to verify the server is up |

---

## 8. Database Schema

The schema is defined in `backend/db/migrations/`. Key tables:

| Table | Purpose |
|---|---|
| `schools` | Single school record (name, logo, contact info) |
| `users` | Admin/teacher accounts with hashed passwords |
| `students` | Student profiles (ID, name, section) |
| `parents` | Parent/guardian contact records |
| `parent_student_links` | Many-to-many: parents ↔ students |
| `academic_terms` | School year terms with start/end dates |
| `sections` | Class sections (e.g., Grade 10 — Section A) |
| `section_subjects` | Subjects offered within a section |
| `student_enrollments` | Which students are enrolled in which sections |
| `class_sessions` | Scheduled class meetings |
| `qr_sessions` | Live QR attendance sessions (open/closed state, rotating token) |
| `attendance_records` | One record per student per session |
| `attendance_events` | Raw scan events (timestamp, QR token used) |
| `attendance_corrections` | Manual overrides with reason and auditor |
| `alerts` | Log of sent alert emails |
| `notifications` | In-app notification records |
| `refresh_tokens` | JWT refresh token store |
| `audit_logs` | Immutable log of all data-changing actions |

---

## 9. Admin Dashboard Features

The admin app is accessible after logging in with a teacher account.

- **Dashboard** — summary cards (total students, sessions today, attendance rate) and analytics charts showing trends over time.
- **Sessions** — list of today's class sessions with live attendance counts. Tap a session to view details.
- **Live QR** — select a class, open a session, and a QR code is generated. The code rotates automatically to prevent sharing. Close the session when class ends.
- **Registry** — full student list grouped by class. Edit parent email addresses directly from this view. Add new students with the + button.
- **Logs** — attendance records grouped by class and date. Add or remove students from a session manually. Export records as CSV or PDF.

---

## 10. Student App Features

The student app is accessible after logging in with a student ID and PIN.

- **Home** — shows the student's latest attendance status and any pending notifications.
- **Scanner** — activates the device camera to scan a teacher's QR code. A "Simulate Scan" button is available for testing without a physical QR code.
- **History** — full attendance history pulled from the database, showing present/absent/late status per session.

---

## 11. Email Automation

Email features are found in the **Email** tab of the admin dashboard.

### Template types

| Template | Trigger |
|---|---|
| **Email** | Generic custom message to parents |
| **Emergency Alert** | Sends an attendance summary immediately |
| **Teacher Absent** | Notifies parents that the teacher is absent and class is cancelled |
| **Class Ended** | Notifies parents that class has finished for the day |

### Sending alerts

1. Tap the template you want to use.
2. Review or edit the pre-filled message.
3. Tap **Send** — the email is dispatched via Resend.

### Production note

Currently all outbound emails are sent to a test address (`andresmcgradyameer@gmail.com`). Before going live, update the recipient logic in:

```
backend/src/routes/alerts.ts
```

Replace the hardcoded test address with the parent email addresses from the `parents` table.

---

## 12. Troubleshooting

**`EADDRINUSE: address already in use :::3001`**
Another process is using port 3001. Kill it and restart:
```bash
npx kill-port 3001
npm run dev
```

**`Network request failed` on the mobile app**
- The backend is not running, or the IP in `.env.local` is wrong.
- Confirm the backend is up: visit `http://localhost:3001/api/v1/health` in your browser.
- Re-run `ipconfig` (Windows) or `ifconfig` (macOS/Linux) to get your current IP — it can change when you reconnect to WiFi.
- Update `EXPO_PUBLIC_API_BASE_URL` in `front-end/.env.local` and restart Expo.

**`Failed to load dashboard`**
- The backend is unreachable from the phone.
- Make sure your phone and computer are on the **same WiFi network**.
- Check that no firewall is blocking port 3001.

**`Section not found` or missing data**
- Seed data has not been applied. Run:
  ```bash
  cd backend
  npm run db:migrate
  ```

**Duplicate sections appearing**
- A known issue where the backend returns duplicate section entries after a fresh migration. Restart the backend server:
  ```bash
  # Stop the running server (Ctrl+C), then:
  npm run dev
  ```

---

## 13. Running Both Servers

You need two separate terminal windows open at the same time.

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd front-end
npm start
```

Once both are running, scan the Expo QR code with your phone (Expo Go app) or press `a` / `i` to open an emulator. The app will connect to the backend over your local network.
