import nodemailer from "nodemailer";
import { query } from "./db";

/* ── Types ── */
interface GmailConfig {
  sender_email: string;
  sender_name: string;
  app_password: string;
  reply_to?: string;
}

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/* ── Fetch active Gmail config for a user ── */
export async function getGmailConfig(userId: number): Promise<GmailConfig | null> {
  try {
    const result = await query(
      `SELECT settings FROM user_integrations
       WHERE user_id = $1 AND integration_key = 'gmail' AND status = 'connected'`,
      [userId]
    );
    if (result.rows.length === 0) return null;

    const s = result.rows[0].settings;
    if (!s?.sender_email || !s?.app_password) return null;

    return {
      sender_email: String(s.sender_email),
      sender_name: String(s.sender_name || "AI Appointment Setter"),
      app_password: String(s.app_password),
      reply_to: s.reply_to ? String(s.reply_to) : undefined,
    };
  } catch (err) {
    console.error("getGmailConfig error:", err);
    return null;
  }
}

/* ── Log email to database ── */
async function logEmail(
  userId: number,
  to: string,
  subject: string,
  body: string,
  status: "sent" | "failed",
  provider: string,
  error?: string
) {
  try {
    await query(
      `INSERT INTO email_logs (user_id, recipient, subject, body, status, provider, error, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [userId, to, subject, body, status, provider, error || null]
    );
  } catch (logErr) {
    console.error("Email log error:", logErr);
  }
}

/* ── Send email via Gmail SMTP ── */
export async function sendEmail(
  userId: number,
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<SendResult> {
  const config = await getGmailConfig(userId);

  if (!config) {
    return { success: false, error: "Gmail not connected — connect Gmail in Integrations to enable email automation" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: config.sender_email,
        pass: config.app_password,
      },
    });

    const info = await transporter.sendMail({
      from: `"${config.sender_name}" <${config.sender_email}>`,
      to,
      subject,
      html,
      replyTo: replyTo || config.reply_to || config.sender_email,
    });

    await logEmail(userId, to, subject, html.substring(0, 500), "sent", "gmail-smtp");
    transporter.close();
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gmail SMTP send error:", msg);
    await logEmail(userId, to, subject, html.substring(0, 500), "failed", "gmail-smtp", msg);
    return { success: false, error: msg };
  }
}

/* ─────────────────────────────────
   EMAIL TEMPLATES
   ───────────────────────── */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

function emailShell(heading: string, subheading: string, body: string, senderName: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:24px;">
  <tr>
    <td style="background:linear-gradient(135deg,#6C63FF 0%,#4B44D6 100%);padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${heading}</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${subheading}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px;">
      ${body}
    </td>
  </tr>
  <tr>
    <td style="padding:20px 40px;background:#f8f9fa;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#888;">
        Sent by ${senderName} via AI Appointment Setter · <a href="${BASE_URL}" style="color:#6C63FF;">AI Appointment Setter</a>
      </p>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr><td style="background:#6C63FF;border-radius:8px;text-align:center;padding:14px;">
      <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">${text}</a>
    </td></tr>
  </table>`;
}

/* ── New Lead Welcome ── */
export function newLeadWelcomeTemplate(leadName: string, senderName: string, senderCompany: string) {
  const firstName = leadName.split(" ")[0];
  return {
    subject: `Thanks for reaching out, ${firstName}! Let's get you booked`,
    html: emailShell(
      "AI Appointment Setter",
      "Automated Lead Follow-up",
      `
      <p style="font-size:16px;color:#1a1a2e;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 16px;">
        Thanks for your interest! I'm the AI assistant at <strong>${senderCompany || senderName}'s</strong> team.
        I'd love to learn more about your needs and help you get started.
      </p>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 24px;">Here's what happens next:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:8px 0;">
          <span style="display:inline-block;background:#6C63FF;color:#fff;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;font-size:12px;font-weight:600;margin-right:12px;">1</span>
          <span style="font-size:14px;color:#1a1a2e;">I'll review your inquiry details</span>
        </td></tr>
        <tr><td style="padding:8px 0;">
          <span style="display:inline-block;background:#6C63FF;color:#fff;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;font-size:12px;font-weight:600;margin-right:12px;">2</span>
          <span style="font-size:14px;color:#1a1a2e;">We'll match you with the best time slot</span>
        </td></tr>
        <tr><td style="padding:8px 0;">
          <span style="display:inline-block;background:#6C63FF;color:#fff;border-radius:50%;width:24px;height:24px;text-align:center;line-height:24px;font-size:12px;font-weight:600;margin-right:12px;">3</span>
          <span style="font-size:14px;color:#1a1a2e;">You'll get a calendar invite with all the details</span>
        </td></tr>
      </table>
      ${ctaButton("Book a Meeting Now →", `${BASE_URL}/book-demo`)}
      <p style="font-size:13px;color:#888;margin:16px 0 0;line-height:1.5;">
        If you have any questions in the meantime, just reply to this email — I'm here 24/7!
      </p>`,
      senderName
    ),
  };
}

/* ── Demo Booking Confirmation ── */
export function demoBookingTemplate(leadName: string, preferredTime: string, senderName: string, senderCompany: string) {
  const firstName = leadName.split(" ")[0];
  return {
    subject: `Demo Confirmed — ${preferredTime || "We'll confirm your time soon"}`,
    html: emailShell(
      "✅ Demo Booked!",
      "AI Appointment Setter",
      `
      <p style="font-size:16px;color:#1a1a2e;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 20px;">
        Great news — your demo has been booked! Here are the details:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;border-radius:8px;margin-bottom:24px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:14px;color:#6C63FF;font-weight:600;">📅 Meeting Details</p>
          <p style="margin:0;font-size:15px;color:#1a1a2e;">
            <strong>Time:</strong> ${preferredTime || "We'll confirm the exact time shortly"}<br>
            <strong>With:</strong> ${senderName}${senderCompany ? `, ${senderCompany}` : ""}<br>
            <strong>Duration:</strong> 30 minutes<br>
            <strong>Format:</strong> Video call (link will be sent separately)
          </p>
        </td></tr>
      </table>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 16px;">During the demo, we'll cover:</p>
      <ul style="font-size:14px;color:#4a4a6a;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>How AI automates your lead follow-up</li>
        <li>Live walkthrough of the dashboard</li>
        <li>Integration setup with your existing tools</li>
        <li>Custom workflow recommendations</li>
      </ul>
      <p style="font-size:13px;color:#888;margin:0;line-height:1.5;">
        Need to reschedule? Just reply to this email — no problem!
      </p>`,
      senderName
    ),
  };
}

/* ── Contact Form Acknowledgment ── */
export function contactAckTemplate(leadName: string, senderName: string) {
  const firstName = leadName.split(" ")[0];
  return {
    subject: `We received your message, ${firstName}!`,
    html: emailShell(
      "📩 Message Received",
      "AI Appointment Setter",
      `
      <p style="font-size:16px;color:#1a1a2e;margin:0 0 16px;">Hi ${firstName},</p>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 16px;">
        Thank you for reaching out! We've received your message and our team (and AI) is already on it.
      </p>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 24px;">
        You can expect a personalized response within <strong>2 hours</strong> during business hours.
      </p>
      ${ctaButton("Book a Free Demo →", `${BASE_URL}/book-demo`)}
      <p style="font-size:13px;color:#888;margin:16px 0 0;line-height:1.5;">
        Just reply to this email if you have additional questions!
      </p>`,
      senderName
    ),
  };
}

/* ── AI Follow-Up ── */
export function aiFollowUpTemplate(leadName: string, messageContent: string, senderName: string) {
  const firstName = leadName.split(" ")[0];
  return {
    subject: `Following up — ${senderName}'s AI Assistant`,
    html: emailShell(
      "💬 New Message",
      `${senderName}'s AI Assistant`,
      `
      <p style="font-size:16px;color:#1a1a2e;margin:0 0 16px;">Hi ${firstName},</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0eeff;border-radius:8px;margin-bottom:20px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.6;">
            ${messageContent.replace(/\n/g, "<br>")}
          </p>
        </td></tr>
      </table>
      <p style="font-size:15px;color:#4a4a6a;line-height:1.6;margin:0 0 24px;">
        Just reply to this email to continue the conversation, or click below to book a meeting:
      </p>
      ${ctaButton("Book a Meeting →", `${BASE_URL}/book-demo`)}`,
      senderName
    ),
  };
}