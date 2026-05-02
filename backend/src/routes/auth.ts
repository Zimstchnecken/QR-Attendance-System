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

const devAccessToken = 'dev-access-token';
const devRefreshToken = 'dev-refresh-token';

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

async function createSession(user: AuthUser, subjectUserId: string) {
  const accessToken = randomUUID();
  const refreshToken = randomUUID();

  activeAccessSessions.set(accessToken, user);
  activeRefreshSessions.set(refreshToken, { user, subjectUserId });

  if (env.DATABASE_URL) {
    const databasePool = getDatabasePool();
    await databasePool.query(
      `insert into refresh_tokens (user_id, token_hash, expires_at)
       values ($1, $2, now() + interval '30 days')`,
      [subjectUserId, hashToken(refreshToken)]
    );
  }

  return { accessToken, refreshToken, user };
}

async function authenticateAdmin(email: string, password: string) {
  if (!env.DATABASE_URL) {
    if (email === devAdmin.email && password === devAdmin.password) {
      return { user: devAdmin.user, subjectUserId: devAdmin.user.id };
    }

    return null;
  }

  const databasePool = getDatabasePool();
  const result = await databasePool.query<{ id: string; email: string; full_name: string }>(
    `select id, email, full_name
     from users
     where email = $1
       and role in ('admin', 'teacher', 'super_admin')
       and status = 'active'
       and password_hash = crypt($2, password_hash)
     limit 1`,
    [email, password]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    user: {
      id: row.id,
      role: 'admin' as const,
      name: row.full_name,
      email: row.email,
    },
    subjectUserId: row.id,
  };
}

async function authenticateStudent(studentId: string, pin: string) {
  if (!env.DATABASE_URL) {
    if (studentId === devStudent.studentId && pin === devStudent.pin) {
      return { user: devStudent.user, subjectUserId: devStudent.user.id };
    }

    return null;
  }

  const databasePool = getDatabasePool();
  const result = await databasePool.query<{
    user_id: string | null;
    student_number: string;
    first_name: string;
    last_name: string;
  }>(
    `select user_id, student_number, first_name, last_name
     from students
     where student_number = $1
       and status = 'active'
       and pin_hash is not null
       and pin_hash = crypt($2, pin_hash)
     limit 1`,
    [studentId, pin]
  );

  const row = result.rows[0];
  if (!row || !row.user_id) {
    return null;
  }

  return {
    user: {
      id: row.user_id,
      role: 'student' as const,
      name: `${row.first_name} ${row.last_name}`,
      studentId: row.student_number,
    },
    subjectUserId: row.user_id,
  };
}

async function lookupRefreshSession(refreshToken: string) {
  if (env.DATABASE_URL) {
    const databasePool = getDatabasePool();
    const result = await databasePool.query<{
      user_id: string;
      role: string;
      full_name: string;
      email: string | null;
      student_number: string | null;
    }>(
      `select rt.user_id, u.role, u.full_name, u.email, s.student_number
       from refresh_tokens rt
       join users u on u.id = rt.user_id
       left join students s on s.user_id = u.id
       where rt.token_hash = $1
         and rt.revoked_at is null
         and rt.expires_at > now()
       limit 1`,
      [hashToken(refreshToken)]
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      user: row.role === 'student'
        ? {
            id: row.user_id,
            role: 'student' as const,
            name: row.full_name,
            studentId: row.student_number ?? undefined,
          }
        : {
            id: row.user_id,
            role: 'admin' as const,
            name: row.full_name,
            email: row.email ?? undefined,
          },
      subjectUserId: row.user_id,
    };
  }

  return activeRefreshSessions.get(refreshToken) ?? null;
}

authRouter.post('/login', (req: Request, res: Response<AuthSession | { success: false; error: { code: string; message: string } }>) => {
  (async () => {
    const adminAttempt = adminLoginSchema.safeParse(req.body);
    if (adminAttempt.success) {
      const credentials = adminAttempt.data;
      const authResult = await authenticateAdmin(credentials.email, credentials.password);
      if (authResult) {
        const session = await createSession(authResult.user, authResult.subjectUserId);
        return res.status(200).json(session);
      }
    }

    const studentAttempt = studentLoginSchema.safeParse(req.body);
    if (studentAttempt.success) {
      const credentials = studentAttempt.data;
      const authResult = await authenticateStudent(credentials.studentId, credentials.pin);
      if (authResult) {
        const session = await createSession(authResult.user, authResult.subjectUserId);
        return res.status(200).json(session);
      }
    }

    return sendAuthError(res, 401, 'INVALID_CREDENTIALS', 'The supplied credentials are not valid.');
  })().catch((error: unknown) => {
    return sendAuthError(res, 500, 'AUTH_SERVICE_ERROR', error instanceof Error ? error.message : 'Auth lookup failed.');
  });
});

authRouter.post('/refresh', (req: Request, res: Response<AuthSession | { success: false; error: { code: string; message: string } }>) => {
  (async () => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendAuthError(res, 401, 'INVALID_REFRESH_TOKEN', 'The refresh token is invalid or expired.');
    }

    const session = await lookupRefreshSession(parsed.data.refreshToken);
    if (!session) {
      return sendAuthError(res, 401, 'INVALID_REFRESH_TOKEN', 'The refresh token is invalid or expired.');
    }

    if (env.DATABASE_URL) {
      const databasePool = getDatabasePool();
      await databasePool.query('update refresh_tokens set revoked_at = now() where token_hash = $1 and revoked_at is null', [
        hashToken(parsed.data.refreshToken),
      ]);
    }

    const refreshedSession = await createSession(session.user, session.subjectUserId);
    return res.status(200).json(refreshedSession);
  })().catch((error: unknown) => {
    return sendAuthError(res, 500, 'AUTH_SERVICE_ERROR', error instanceof Error ? error.message : 'Auth refresh failed.');
  });
});

authRouter.post('/logout', (req: Request, res: Response) => {
  (async () => {
    const authorization = req.header('authorization');
    const parsedBody = z.object({ refreshToken: z.string().optional() }).safeParse(req.body);
    const refreshToken = parsedBody.success ? parsedBody.data.refreshToken : undefined;

    if (authorization?.startsWith('Bearer ')) {
      activeAccessSessions.delete(authorization.slice(7));
    }

    if (refreshToken) {
      activeRefreshSessions.delete(refreshToken);

      if (env.DATABASE_URL) {
        const databasePool = getDatabasePool();
        await databasePool.query('update refresh_tokens set revoked_at = now() where token_hash = $1 and revoked_at is null', [
          hashToken(refreshToken),
        ]);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        revokedAt: new Date().toISOString(),
        logoutId: randomUUID(),
      },
    });
  })().catch((error: unknown) => {
    return sendAuthError(res, 500, 'AUTH_SERVICE_ERROR', error instanceof Error ? error.message : 'Logout failed.');
  });
});

export function meHandler(req: Request, res: Response<AuthUser | { success: false; error: { code: string; message: string } }>) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return sendAuthError(res, 401, 'UNAUTHORIZED', 'Authentication is required.');
  }

  const accessToken = authorization.slice(7);
  const user = activeAccessSessions.get(accessToken);

  if (!user) {
    return sendAuthError(res, 401, 'UNAUTHORIZED', 'Authentication is required.');
  }

  return res.status(200).json(user);
}