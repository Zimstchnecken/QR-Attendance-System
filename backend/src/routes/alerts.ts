import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getDatabasePool } from '../db/pool.js';
import { sendEmail, generateAlertTemplate, generateAttendanceTemplate } from '../services/email.js';

export const alertsRouter = express.Router();

const sendAlertSchema = z.object({
  studentId: z.string().uuid(),
  alertType: z.enum(['attendance', 'behavior', 'academic', 'health']),
  details: z.string(),
});

const sendAttendanceSummarySchema = z.object({
  teacherEmail: z.string().email(),
  teacherName: z.string(),
  sessionName: z.string(),
  templateBody: z.string().optional(),
  stats: z.object({
    present: z.number(),
    absent: z.number(),
    late: z.number(),
  }),
});

// POST /api/v1/alerts/send-alert - Send alert email for a student
alertsRouter.post('/send-alert', async (req: Request, res: Response) => {
  try {
    const { studentId, alertType, details } = sendAlertSchema.parse(req.body);

    // Fetch student info
    const pool = getDatabasePool();
    const studentResult = await pool.query(
      'SELECT first_name, last_name FROM students WHERE id = $1',
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student not found' },
      });
    }

    const student = studentResult.rows[0];
    const studentName = `${student.first_name} ${student.last_name}`;

    // For testing with Resend, use the registered email address
    // In production, fetch from student/parent record
    const testEmail = 'andresmcgradyameer@gmail.com';

    const html = generateAlertTemplate(studentName, alertType, details);
    const result = await sendEmail({
      to: testEmail,
      subject: `ZapRoll Alert: ${alertType} - ${studentName}`,
      html,
    });

    res.status(200).json({
      success: result.success,
      data: result.success
        ? { messageId: result.messageId, status: 'sent' }
        : { error: result.error },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0].message },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send alert',
      },
    });
  }
});

// POST /api/v1/alerts/send-attendance-summary - Send attendance summary email
alertsRouter.post('/send-attendance-summary', async (req: Request, res: Response) => {
  try {
    const { teacherEmail, teacherName, sessionName, templateBody, stats } =
      sendAttendanceSummarySchema.parse(req.body);

    // For testing with Resend, override to verified email
    const emailTo = 'andresmcgradyameer@gmail.com';

    // Use custom template body if provided, otherwise use the default generated template
    let html: string;
    if (templateBody) {
      // Replace placeholders in the custom template
      const bodyWithValues = templateBody
        .replace(/\{class\}/g, sessionName)
        .replace(/\{teacher\}/g, teacherName)
        .replace(/\{present\}/g, String(stats.present))
        .replace(/\{absent\}/g, String(stats.absent))
        .replace(/\{late\}/g, String(stats.late));
      html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;padding:20px;"><pre style="white-space:pre-wrap;font-family:inherit;">${bodyWithValues}</pre></body></html>`;
    } else {
      html = generateAttendanceTemplate(teacherName, sessionName, stats);
    }
    const result = await sendEmail({
      to: emailTo,
      subject: `Attendance Summary: ${sessionName}`,
      html,
    });

    res.status(200).json({
      success: result.success,
      data: result.success
        ? { messageId: result.messageId, status: 'sent' }
        : { error: result.error },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0].message },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Failed to send summary',
      },
    });
  }
});
