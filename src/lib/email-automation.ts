import { ImapFlow } from "imapflow";
import { simpleParser, ParsedMail } from "mailparser";
import { query } from "./db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

/* ── Types ── */
interface GmailCreds {
  email: string;
  appPassword: string;
  senderName: string;
  replyTo?: string;
  userId: number;
}

interface ProcessedEmail {
  from: string;
  fromName: string;
  subject: string;
  text: string;
  html: string;
  messageId: string;
  inReplyTo?: string;
}

/* ── User email automation settings ── */
interface EmailSettings {
  auto_reply_enabled: boolean;
  reply_mode: string;
  skip_marketing: boolean;
  skip_newsletters: boolean;
  skip_social: boolean;
  skip_transactional: boolean;
  skip_job_alerts: boolean;
  custom_skip_domains: string[];
  custom_allow_emails: string[];
  reply_tone: string;
  reply_language: string;
  max_replies_per_day: number;
  custom_instructions: string | null;
}

async function getUserSettings(userId: number): Promise<EmailSettings> {
  const defaults: EmailSettings = {
    auto_reply_enabled: true,
    reply_mode: "replies_and_inquiries",
    skip_marketing: true,
    skip_newsletters: true,
    skip_social: true,
    skip_transactional: true,
    skip_job_alerts: true,
    custom_skip_domains: [],
    custom_allow_emails: [],
    reply_tone: "professional",
    reply_language: "en",
    max_replies_per_day: 50,
    custom_instructions: null,
  };
  try {
    const result = await query(
      "SELECT * FROM email_automation_settings WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length > 0) {
      return { ...defaults, ...result.rows[0] };
    }
  } catch (err) {
    console.error("[email-automation] getUserSettings error:", err);
  }
  return defaults;
}

/* ── Check daily reply limit ── */
async function hasExceededDailyLimit(userId: number, maxReplies: number): Promise<boolean> {
  const result = await query(
    "SELECT COUNT(*) as count FROM email_logs WHERE user_id = $1 AND provider = 'auto-reply' AND status = 'sent' AND created_at > NOW() - INTERVAL '24 hours'",
    [userId]
  );
  return parseInt(result.rows[0].count) >= maxReplies;
}

/* ── Fetch all Gmail credentials for active users ── */
async function getActiveGmailAccounts(): Promise<GmailCreds[]> {
  try {
    const result = await query(
      `SELECT u.id as user_id, u.name,
              ui.settings->>'sender_email' as email,
              ui.settings->>'app_password' as app_password,
              ui.settings->>'sender_name' as sender_name,
              ui.settings->>'reply_to' as reply_to
       FROM user_integrations ui
       JOIN users u ON u.id = ui.user_id
       WHERE ui.integration_key = 'gmail' AND ui.status = 'connected'
         AND ui.settings->>'app_password' IS NOT NULL
         AND ui.settings->>'sender_email' IS NOT NULL`
    );
    return result.rows.map((r) => ({
      userId: r.user_id,
      email: r.email,
      appPassword: r.app_password,
      senderName: r.sender_name || r.name || "AI Appointment Setter",
      replyTo: r.reply_to,
    }));
  } catch (err) {
    console.error("[email-automation] getActiveGmailAccounts error:", err);
    return [];
  }
}

/* ── Check if we already processed this message ── */
async function isAlreadyProcessed(messageId: string): Promise<boolean> {
  const result = await query(
    "SELECT 1 FROM email_logs WHERE provider = 'imap-inbound' AND error = $1",
    [`msgid:${messageId}`]
  );
  return result.rows.length > 0;
}

/* ── Mark message as processed (used BEFORE sending to prevent duplicates) ── */
async function markProcessed(userId: number, messageId: string, from: string, subject: string) {
  await query(
    `INSERT INTO email_logs (user_id, recipient, subject, body, status, provider, error, created_at)
     VALUES ($1, $2, $3, $4, 'received', 'imap-inbound', $5, NOW())`,
    [userId, from, subject, "", `msgid:${messageId}`]
  );
}

/* ── Check if we already REPLIED to this sender+subject (extra dedup guard) ── */
async function hasAlreadyRepliedTo(userId: number, fromAddress: string, subject: string): Promise<boolean> {
  const cleanSubject = subject.replace(/^Re:\s*/i, "").trim();
  const result = await query(
    `SELECT 1 FROM email_logs 
     WHERE user_id = $1 
       AND provider = 'auto-reply' 
       AND status = 'sent' 
       AND recipient = $2
       AND created_at > NOW() - INTERVAL '2 hours'
       AND (
         subject ILIKE $3 
         OR subject ILIKE 'Re: ' || $3
       )
     LIMIT 1`,
    [userId, fromAddress, `%${cleanSubject}%`]
  );
  return result.rows.length > 0;
}

/* ── Generate AI reply using LLM ── */
async function generateAIReply(
  senderName: string,
  senderEmail: string,
  emailSubject: string,
  emailBody: string,
  userName: string,
  tone: string = "professional",
  customInstructions: string | null = null
): Promise<string> {
  const baseUrl = process.env.OPENAI_BASE_URL || "https://llm.drytis.ai";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getFallbackReply(senderName, emailSubject);
  }

  const toneGuide: Record<string, string> = {
    professional: "Write in a professional, business-appropriate tone.",
    friendly: "Write in a warm, friendly, and approachable tone.",
    casual: "Write in a casual, conversational tone.",
    formal: "Write in a formal, corporate tone suitable for B2B communications.",
  };

  const firstName = senderName.split(" ")[0] || "there";

  const systemPrompt = `You are the AI assistant for ${userName}'s business, powered by AI Appointment Setter. You just received an email inquiry from a potential lead named ${firstName}.

${toneGuide[tone] || toneGuide.professional}

${customInstructions ? `Additional instructions from the user:\n${customInstructions}\n` : ""}

CRITICAL RULES:
- DO NOT start with a greeting like "Hi", "Hello", "Dear", etc. The email template already adds "Hi ${firstName}," before your content.
- Start your response directly with the substance of your reply.
- DO NOT include a sign-off like "Best regards" or "Sincerely" — the template handles the footer.

Write a reply that:
1. Answers their question or addresses their inquiry directly
2. Mentions relevant features of AI Appointment Setter if appropriate (lead automation, meeting booking, CRM integration, AI follow-ups)
3. Invites them to book a demo at ${BASE_URL}/book-demo
4. Keeps it concise (under 150 words)
5. Sounds natural and helpful`;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "drytis/kimi-k2.5",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `From: ${senderName} <${senderEmail}>\nSubject: ${emailSubject}\n\n${emailBody.substring(0, 1000)}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (reply) {
      // Strip any greeting the LLM might still add (belt + suspenders)
      return reply
        .replace(/^(Hi\s+\w+[,\s]*\n?)/i, "")
        .replace(/^(Hello\s+\w+[,\s]*\n?)/i, "")
        .replace(/^(Dear\s+\w+[,\s]*\n?)/i, "")
        .replace(/^(Hey\s+\w+[,\s]*\n?)/i, "")
        .trim();
    }
  } catch (err) {
    console.error("[email-automation] LLM error:", err);
  }

  return getFallbackReply(senderName, emailSubject);
}

function getFallbackReply(senderName: string, subject: string): string {
  return `Thank you for your email! I'm the AI assistant and I wanted to let you know we received your message.

I'd love to help you learn more about our AI-powered appointment setting and lead automation platform. Here are some quick highlights:

• AI automatically qualifies and responds to leads 24/7
• One-click integration with Gmail, Google Calendar, Slack, and more
• Smart meeting scheduling with zero back-and-forth
• Real-time analytics and ROI tracking

Would you like to see it in action? Book a free 30-minute demo:
	${BASE_URL}/book-demo

Looking forward to connecting!`;
}

/* ── Send auto-reply email ── */
async function sendAutoReply(
  creds: GmailCreds,
  to: string,
  toName: string,
  originalSubject: string,
  replyContent: string,
  inReplyTo?: string
): Promise<boolean> {
  const nodemailer = await import("nodemailer");

  try {
    const transporter = nodemailer.default.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: creds.email, pass: creds.appPassword },
    });

    const subject = originalSubject.toLowerCase().startsWith("re:")
      ? originalSubject
      : `Re: ${originalSubject}`;

    // Strip any greeting the LLM might have added (extra safety)
    const cleanedReply = replyContent
      .replace(/^(Hi\s+\w+[,\s]*\n?)/i, "")
      .replace(/^(Hello\s+\w+[,\s]*\n?)/i, "")
      .replace(/^(Dear\s+\w+[,\s]*\n?)/i, "")
      .replace(/^(Hey\s+\w+[,\s]*\n?)/i, "")
      .trim();

    const firstName = toName.split(" ")[0] || "there";
    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:24px;">
  <tr>
    <td style="background:linear-gradient(135deg,#6C63FF 0%,#4B44D6 100%);padding:24px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td><h2 style="margin:0;color:#fff;font-size:18px;font-weight:600;">AI Appointment Setter</h2></td>
          <td align="right"><span style="background:rgba(255,255,255,0.2);color:#fff;padding:4px 10px;border-radius:12px;font-size:11px;">AI Auto-Reply</span></td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:28px 32px;">
      <p style="font-size:15px;color:#1a1a2e;margin:0 0 16px;">Hi ${firstName},</p>
      <div style="font-size:14px;color:#4a4a6a;line-height:1.7;">
        ${cleanedReply.replace(/\n/g, "<br>")}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background:#6C63FF;border-radius:8px;text-align:center;padding:14px;">
            <a href="${BASE_URL}/book-demo" style="color:#fff;text-decoration:none;font-size:14px;font-weight:600;">Book a Free Demo →</a>
          </td>
          <td width="12"></td>
          <td style="background:#f0f0f5;border-radius:8px;text-align:center;padding:14px;">
            <a href="${BASE_URL}/pricing" style="color:#6C63FF;text-decoration:none;font-size:14px;font-weight:600;">View Pricing</a>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#999;margin:12px 0 0;border-top:1px solid #f0f0f0;padding-top:12px;">This is an automated reply from ${creds.senderName}'s AI Assistant. Reply to this email to continue the conversation.</p>
    </td>
  </tr>
</table>
</body></html>`;

    const info = await transporter.sendMail({
      from: `"${creds.senderName}'s AI Assistant" <${creds.email}>`,
      to: `"${toName}" <${to}>`,
      subject,
      html,
      replyTo: creds.replyTo || creds.email,
      inReplyTo,
      references: inReplyTo,
    });

    // Log the auto-reply
    await query(
      `INSERT INTO email_logs (user_id, recipient, subject, body, status, provider, created_at)
       VALUES ($1, $2, $3, $4, 'sent', 'auto-reply', NOW())`,
      [creds.userId, to, subject, replyContent.substring(0, 500)]
    );

    transporter.close();
    console.log(`[email-automation] Auto-reply sent to ${to} (msgId: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`[email-automation] Auto-reply failed for ${to}:`, err);
    await query(
      `INSERT INTO email_logs (user_id, recipient, subject, body, status, provider, error, created_at)
       VALUES ($1, $2, $3, '', 'failed', 'auto-reply', $4, NOW())`,
      [creds.userId, to, `Re: ${originalSubject}`, String(err)]
    );
    return false;
  }
}

/* ── Auto-create lead from email ── */
async function autoCreateLead(userId: number, fromEmail: string, fromName: string, subject: string) {
  try {
    const existing = await query(
      "SELECT id FROM leads WHERE email = $1 AND user_id = $2",
      [fromEmail, userId]
    );
    if (existing.rows.length > 0) {
      await query(
        "UPDATE leads SET notes = COALESCE(notes, '') || $1 WHERE id = $2",
        [`\n[Email received: ${new Date().toISOString()}] Re: ${subject}`, existing.rows[0].id]
      );
      return existing.rows[0].id;
    }

    const result = await query(
      `INSERT INTO leads (user_id, name, email, source, status, notes, created_at)
       VALUES ($1, $2, $3, 'email', 'new', $4, NOW())
       RETURNING id`,
      [userId, fromName, fromEmail, `Auto-created from email inquiry: Re: ${subject}`]
    );

    await query(
      `INSERT INTO notifications (user_id, type, title, message, link, created_at)
       VALUES ($1, 'lead', 'New lead from email', $2, '/dashboard/leads', NOW())`,
      [userId, `${fromName} (${fromEmail}) sent an email inquiry: ${subject}`]
    );

    console.log(`[email-automation] Auto-created lead: ${fromName} <${fromEmail}>`);
    return result.rows[0].id;
  } catch (err) {
    console.error("[email-automation] Auto-create lead error:", err);
    return null;
  }
}

/* ── Category-based domain lists ── */
const MARKETING_DOMAINS = [
  "amazon.", "amazon.in", "amazon.com",
  "hubspot.com", "mailchimp.com", "sendgrid.",
  "salesforce.com", "zendesk.com",
  "beehiiv.com", "mail.beehiiv.com",
  "projectpro.io", "unstop.news", "unstop.",
  "dare2compete.", "analyticsvidhya.com",
  "mail.beehiiv.com", "mailer.", "newsletter.", "newsletters.",
  "promo.", "offers.", "deals.",
];
const NEWSLETTER_DOMAINS = [
  "stackoverflow.email", "stackoverflow.com",
  "kaggle.com", "educative.io", "replit.com",
  "brainhq.com", "glassdoor.com",
  "medium.com", "substack.com",
];
const SOCIAL_DOMAINS = [
  "linkedin.com", "facebook.com", "facebookmail.com",
  "twitter.com", "x.com", "instagram.com",
  "youtube.com", "tiktok.com",
];
const TRANSACTIONAL_DOMAINS = [
  "stripe.com", "paypal.com",
  "google.com", "googlemail.com",
  "cloud.google", "aws.amazon",
  "statuspage.io", "mailer-daemon",
  "drytis.dev",
];
const JOB_ALERT_DOMAINS = [
  "indeed.com", "match.indeed.com",
  "angelbroking", "angelone", "angel.co",
  "glassdoor.com", "naukri.com",
];
const ALWAYS_SKIP_DOMAINS = [
  "noreply", "no-reply", "notification", "mailer", "postmaster",
  "mailer-daemon", "donotreply", "do-not-reply",
];

/* ── Process a single email through all filters and send reply ── */
async function processOneEmail(
  parsed: ParsedMail,
  creds: GmailCreds,
  settings: EmailSettings,
  result: { emailsProcessed: number; repliesSent: number; errors: string[] }
): Promise<void> {
  const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase() || "";
  const fromName = parsed.from?.value?.[0]?.name || "";
  const messageId = parsed.messageId || "";
  const subject = parsed.subject || "(no subject)";

  // ── Basic skips ──
  if (!fromAddress) return;
  if (fromAddress === creds.email.toLowerCase()) return;
  if (fromAddress === (creds.replyTo || "").toLowerCase()) return;
  if (subject.includes("AI Auto-Reply") || subject.includes("AI Assistant")) return;

  // Skip auto-generated sender addresses
  if (ALWAYS_SKIP_DOMAINS.some(d => fromAddress.startsWith(d + "@"))) {
    if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: auto-generated] ${subject}`);
    return;
  }

  // ── Duplicate check #1: already processed this exact message ──
  if (messageId && await isAlreadyProcessed(messageId)) return;

  // ── Duplicate check #2: already sent a reply to this sender+subject in last 2 hours ──
  if (await hasAlreadyRepliedTo(creds.userId, fromAddress, subject)) {
    console.log(`[email-automation] Already replied to ${fromAddress} about "${subject}" — skipping`);
    if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: duplicate reply] ${subject}`);
    return;
  }

  // ── Allowlist check ──
  if (!(settings.custom_allow_emails.length > 0 && settings.custom_allow_emails.includes(fromAddress))) {
    // ── Category-based filtering ──
    if (settings.skip_marketing && MARKETING_DOMAINS.some(d => fromAddress.includes(d))) {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: marketing] ${subject}`);
      return;
    }
    if (settings.skip_newsletters && NEWSLETTER_DOMAINS.some(d => fromAddress.includes(d))) {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: newsletter] ${subject}`);
      return;
    }
    if (settings.skip_social && SOCIAL_DOMAINS.some(d => fromAddress.includes(d))) {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: social] ${subject}`);
      return;
    }
    if (settings.skip_transactional && TRANSACTIONAL_DOMAINS.some(d => fromAddress.includes(d))) {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: transactional] ${subject}`);
      return;
    }
    if (settings.skip_job_alerts && JOB_ALERT_DOMAINS.some(d => fromAddress.includes(d))) {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: job alerts] ${subject}`);
      return;
    }
    if (settings.custom_skip_domains.length > 0 && settings.custom_skip_domains.some(d => fromAddress.includes(d))) {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: custom domain] ${subject}`);
      return;
    }

    // ── Reply mode filtering ──
    const bodyText = typeof parsed.text === "string" ? parsed.text : "";
    const htmlText = typeof parsed.html === "string" ? parsed.html : "";
    const combinedText = `${bodyText} ${subject}`;
    const isReplyToUs = !!parsed.inReplyTo;
    const isDirectReply = subject.toLowerCase().startsWith("re:") && isReplyToUs;
    const inquiryKeywords = /interested|pricing|demo|meeting|appointment|book|schedule|consult|service|product|details|question|help|availability|quote|proposal|want to know|tell me|more about/i;
    const looksLikeInquiry = inquiryKeywords.test(combinedText);

    if (settings.reply_mode === "replies_only") {
      if (!isDirectReply) {
        if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: not a direct reply] ${subject}`);
        return;
      }
    } else if (settings.reply_mode === "replies_and_inquiries") {
      if (!isDirectReply && !looksLikeInquiry) {
        if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: not an inquiry/reply] ${subject}`);
        return;
      }
      if (subject.toLowerCase().startsWith("re:") && !isReplyToUs) {
        if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: reply not to us] ${subject}`);
        return;
      }
    } else if (settings.reply_mode === "allowlist_only") {
      if (messageId) await markProcessed(creds.userId, messageId, fromAddress, `[SKIPPED: not in allowlist] ${subject}`);
      return;
    }
  }

  console.log(`[email-automation] Processing email from ${fromName} <${fromAddress}>: ${subject}`);

  // Mark as processed FIRST to prevent any duplicate processing
  if (messageId) {
    await markProcessed(creds.userId, messageId, fromAddress, subject);
  }

  result.emailsProcessed++;

  // Auto-create or update lead
  await autoCreateLead(creds.userId, fromAddress, fromName, subject);

  // Generate AI reply
  const replyContent = await generateAIReply(
    fromName,
    fromAddress,
    subject,
    typeof parsed.text === "string" ? parsed.text : (typeof parsed.html === "string" ? parsed.html : ""),
    creds.senderName,
    settings.reply_tone,
    settings.custom_instructions
  );

  // Send auto-reply
  const sent = await sendAutoReply(
    creds,
    fromAddress,
    fromName,
    subject,
    replyContent,
    messageId
  );

  if (sent) result.repliesSent++;
}

/* ── Process inbox: fetch recent emails and process each one ── */
async function processInbox(creds: GmailCreds, result: { emailsProcessed: number; repliesSent: number; errors: string[] }) {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: creds.email,
      pass: creds.appPassword,
    },
  });

  const MAX_EMAILS_PER_POLL = 10;

  const settings = await getUserSettings(creds.userId);

  if (!settings.auto_reply_enabled) {
    console.log(`[email-automation] ${creds.email}: auto-reply disabled by user`);
    return;
  }

  if (await hasExceededDailyLimit(creds.userId, settings.max_replies_per_day)) {
    console.log(`[email-automation] ${creds.email}: daily reply limit reached (${settings.max_replies_per_day})`);
    return;
  }

  try {
    await client.connect();

    const lock = await client.getMailboxLock("INBOX");
    try {
      const recentWindow = new Date();
      recentWindow.setHours(recentWindow.getHours() - 6);

      const searchResult = await client.search({ since: recentWindow });
      const allUids = Array.isArray(searchResult) ? searchResult : [];
      console.log(`[email-automation] ${creds.email}: ${allUids.length} emails in last 6 hours`);

      if (allUids.length === 0) return;

      const uidsToProcess = allUids.slice(-MAX_EMAILS_PER_POLL);
      console.log(`[email-automation] ${creds.email}: Processing ${uidsToProcess.length} most recent`);

      const messages = client.fetch(
        { uid: uidsToProcess.join(",") },
        { source: true, flags: true }
      );

      for await (const msg of messages) {
        if (result.emailsProcessed >= MAX_EMAILS_PER_POLL) break;
        try {
          const parsed = await simpleParser(msg.source as Buffer);
          await processOneEmail(parsed, creds, settings, result);
        } catch (msgErr) {
          console.error("[email-automation] Error processing message:", msgErr);
          result.errors.push(String(msgErr));
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

/* ── Main: Poll inbox and auto-reply ── */
export async function pollInboxesAndReply(): Promise<{
  accountsChecked: number;
  emailsProcessed: number;
  repliesSent: number;
  errors: string[];
}> {
  const result = {
    accountsChecked: 0,
    emailsProcessed: 0,
    repliesSent: 0,
    errors: [] as string[],
  };

  const accounts = await getActiveGmailAccounts();
  result.accountsChecked = accounts.length;

  for (const creds of accounts) {
    try {
      await processInbox(creds, result);
    } catch (err) {
      const msg = `Account ${creds.email}: ${err}`;
      result.errors.push(msg);
      console.error(`[email-automation] ${msg}`);
    }
  }

  if (result.emailsProcessed > 0 || result.errors.length > 0) {
    console.log(`[email-automation] Poll complete: ${result.accountsChecked} accounts, ${result.emailsProcessed} emails, ${result.repliesSent} replies, ${result.errors.length} errors`);
  }

  return result;
}

/* ═══════════════════════════════════════════════════
   INSTANT MODE: IMAP IDLE for real-time push
   Holds connection open, gets notified within seconds
   ═══════════════════════════════════════════════════ */
let idleClients: ImapFlow[] = [];
let idleRunning = false;

export async function startIdleListener(): Promise<void> {
  if (idleRunning) {
    console.log("[email-automation] IDLE listener already running");
    return;
  }
  idleRunning = true;

  const accounts = await getActiveGmailAccounts();
  console.log(`[email-automation] Starting IMAP IDLE for ${accounts.length} accounts`);

  for (const creds of accounts) {
    const settings = await getUserSettings(creds.userId);
    if (!settings.auto_reply_enabled) continue;

    startIdleForAccount(creds, settings);
  }
}

async function startIdleForAccount(creds: GmailCreds, settings: EmailSettings): Promise<void> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: creds.email,
      pass: creds.appPassword,
    },
    emitLogs: false,
  });

  try {
    await client.connect();
    console.log(`[email-idle] Connected for ${creds.email}`);

    // Get initial mailbox info
    let lock = await client.getMailboxLock("INBOX");
    let lastUid = await getHighestUid(client);
    lock.release();

    // Store client for cleanup
    idleClients.push(client);

    // Main IDLE loop
    while (idleRunning) {
      try {
        // Wait for new mail notification (blocks until something arrives)
        const idleResult = await client.idle();
        console.log(`[email-idle] ${creds.email}: New mail notification received!`);

        // Process new emails
        const result = { emailsProcessed: 0, repliesSent: 0, errors: [] as string[] };

        lock = await client.getMailboxLock("INBOX");
        try {
          // Search for UIDs higher than our last seen
          const searchResult = await client.search({ since: new Date(Date.now() - 600000) }); // last 10 min
          const allUids = Array.isArray(searchResult) ? searchResult : [];

          if (allUids.length > 0) {
            // Only process new UIDs (higher than lastUid)
            const newUids = lastUid > 0 ? allUids.filter((u: number) => u > lastUid) : allUids.slice(-5);
            console.log(`[email-idle] ${creds.email}: ${newUids.length} new emails since last check`);

            if (newUids.length > 0) {
              const messages = client.fetch(
                { uid: newUids.join(",") },
                { source: true, flags: true }
              );

              for await (const msg of messages) {
                try {
                  const parsed = await simpleParser(msg.source as Buffer);
                  await processOneEmail(parsed, creds, settings, result);
                  // Update last seen UID
                  if (msg.uid && msg.uid > lastUid) lastUid = msg.uid;
                } catch (msgErr) {
                  console.error(`[email-idle] Error processing message:`, msgErr);
                  result.errors.push(String(msgErr));
                }
              }
            }
          }
        } finally {
          lock.release();
        }

        if (result.emailsProcessed > 0 || result.errors.length > 0) {
          console.log(`[email-idle] ${creds.email}: ${result.emailsProcessed} processed, ${result.repliesSent} replies, ${result.errors.length} errors`);
        }

        // Update lastUid after processing
        lock = await client.getMailboxLock("INBOX");
        const newHighest = await getHighestUid(client);
        if (newHighest > lastUid) lastUid = newHighest;
        lock.release();
      } catch (idleErr) {
        console.error(`[email-idle] ${creds.email}: IDLE error:`, idleErr);
        // Reconnect after error
        try { await client.logout(); } catch {}
        await new Promise(r => setTimeout(r, 5000)); // wait 5s before reconnect
        try {
          await client.connect();
          console.log(`[email-idle] ${creds.email}: Reconnected`);
        } catch (connectErr) {
          console.error(`[email-idle] ${creds.email}: Reconnect failed:`, connectErr);
          break; // exit loop, will be restarted by poll script
        }
      }
    }
  } catch (err) {
    console.error(`[email-idle] ${creds.email}: Connection error:`, err);
  }
}

async function getHighestUid(client: ImapFlow): Promise<number> {
  try {
    const searchResult = await client.search({ all: true });
    const uids = Array.isArray(searchResult) ? searchResult : [];
    return uids.length > 0 ? uids[uids.length - 1] : 0;
  } catch {
    return 0;
  }
}

export function stopIdleListeners(): void {
  idleRunning = false;
  for (const client of idleClients) {
    try { client.logout(); } catch {}
  }
  idleClients = [];
}