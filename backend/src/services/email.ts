import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key not configured',
    };
  }

  try {
    const response = await resend.emails.send({
      from: options.from || 'onboarding@resend.dev',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

export function generateAlertTemplate(
  studentName: string,
  alertType: string,
  details: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0F766E; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .alert-type { font-weight: bold; color: #dc2626; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>ZapRoll Attendance Alert</h2>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>An alert has been triggered for <strong>${studentName}</strong>:</p>
      <p>
        <span class="alert-type">${alertType}</span><br>
        ${details}
      </p>
      <p>Please review and take appropriate action if necessary.</p>
      <div class="footer">
        <p>© 2026 ZapRoll. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateAttendanceTemplate(
  teacherName: string,
  sessionName: string,
  stats: { present: number; absent: number; late: number }
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0F766E; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat { flex: 1; background: white; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #0F766E; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Attendance Summary Report</h2>
    </div>
    <div class="content">
      <p>Hello ${teacherName},</p>
      <p>Here's your attendance summary for <strong>${sessionName}</strong>:</p>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${stats.present}</div>
          <div class="stat-label">Present</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.absent}</div>
          <div class="stat-label">Absent</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.late}</div>
          <div class="stat-label">Late</div>
        </div>
      </div>
      <p>Log in to the ZapRoll system to view detailed reports.</p>
      <div class="footer">
        <p>© 2026 ZapRoll. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
