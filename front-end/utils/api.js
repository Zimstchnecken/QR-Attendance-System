const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message ?? "Request failed.";
    throw new Error(message);
  }

  return payload;
}

export async function loginAdmin({ email, password }) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function loginStudent({ studentId, pin }) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { studentId, pin },
  });
}

export async function logoutUser({ token, refreshToken }) {
  return request("/api/v1/auth/logout", {
    method: "POST",
    token,
    body: refreshToken ? { refreshToken } : undefined,
  });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

// ── Catalog ──────────────────────────────────────────────────────────────────

export async function fetchStudents(token) {
  const payload = await request("/api/v1/students", { token });
  return payload.data ?? [];
}

export async function fetchSections(token) {
  const payload = await request("/api/v1/sections", { token });
  return payload.data ?? [];
}

export async function fetchClassSessions(token) {
  const payload = await request("/api/v1/class-sessions", { token });
  return payload.data ?? [];
}

export async function fetchSectionSubjects(sectionId, token) {
  const payload = await request(`/api/v1/sections/${encodeURIComponent(sectionId)}/subjects`, { token });
  return payload.data ?? [];
}

// ── QR Sessions ───────────────────────────────────────────────────────────────

export async function openClassSession(sectionSubjectId, sessionDate, token) {
  const payload = await request("/api/v1/qr-sessions/open", {
    method: "POST",
    body: { sectionSubjectId, sessionDate },
    token,
  });
  return payload.data;
}

export async function closeClassSession(sessionId, token) {
  const payload = await request(`/api/v1/qr-sessions/${encodeURIComponent(sessionId)}/close`, {
    method: "POST",
    token,
  });
  return payload.data;
}

export async function recordAttendance(sessionId, studentId, status, token) {
  const payload = await request(`/api/v1/qr-sessions/${encodeURIComponent(sessionId)}/attendance`, {
    method: "POST",
    body: { studentId, status },
    token,
  });
  return payload.data;
}

export async function fetchAttendanceRecords(sessionId, token) {
  const payload = await request(`/api/v1/qr-sessions/${encodeURIComponent(sessionId)}/attendance`, { token });
  return payload.data ?? [];
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export async function sendAttendanceSummaryEmail(payload, token) {
  const result = await request("/api/v1/alerts/send-attendance-summary", {
    method: "POST",
    body: payload,
    token,
  });
  return result.data;
}

// ── Student reports ───────────────────────────────────────────────────────────

export async function fetchStudentAttendanceHistory(studentId, token) {
  const payload = await request(`/api/v1/reports/student-attendance/${encodeURIComponent(studentId)}`, { token });
  return payload.data ?? { recentRecords: [] };
}