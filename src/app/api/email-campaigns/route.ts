import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

// GET /api/email-campaigns — list all campaigns
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const result = await query(
      `SELECT c.*, t.name as template_name, t.subject as template_subject
       FROM email_campaigns c
       LEFT JOIN email_templates t ON c.template_id = t.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ campaigns: result.rows });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST /api/email-campaigns — create and optionally send a campaign
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const body = await req.json();
    const { templateId, name, contacts, variableOverrides, sendNow } = body;

    if (!templateId || !name || !contacts || contacts.length === 0) {
      return NextResponse.json({ error: "Template, name, and contacts are required" }, { status: 400 });
    }

    // Get template
    const templateResult = await query("SELECT * FROM email_templates WHERE id = $1 AND user_id = $2", [templateId, userId]);
    if (templateResult.rows.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    const template = templateResult.rows[0];

    // Get Gmail credentials
    const gmailResult = await query(
      "SELECT settings FROM user_integrations WHERE user_id = $1 AND integration_key = 'gmail' AND status = 'connected'",
      [userId]
    );
    if (gmailResult.rows.length === 0) {
      return NextResponse.json({ error: "Gmail not connected. Please connect Gmail first." }, { status: 400 });
    }
    const gmailSettings = gmailResult.rows[0].settings;
    const senderEmail = gmailSettings.sender_email;
    const senderName = gmailSettings.sender_name || "AI Appointment Setter";
    const appPassword = gmailSettings.app_password;
    const replyTo = gmailSettings.reply_to || senderEmail;

    if (!appPassword) {
      return NextResponse.json({ error: "Gmail app password not configured" }, { status: 400 });
    }

    // Create campaign
    const campaignResult = await query(
      `INSERT INTO email_campaigns (user_id, template_id, name, status, total_recipients, contacts, variable_overrides, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        templateId,
        name,
        sendNow ? "sending" : "draft",
        contacts.length,
        JSON.stringify(contacts),
        JSON.stringify(variableOverrides || {}),
        sendNow ? new Date() : null,
      ]
    );
    const campaign = campaignResult.rows[0];

    if (!sendNow) {
      return NextResponse.json({ campaign, message: "Campaign saved as draft" }, { status: 201 });
    }

    // Send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword,
      },
    });

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        // Replace variables in subject and body
        const replaceVars = (text: string) => {
          return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            // Check overrides first, then contact fields, then defaults
            const overrides = variableOverrides || {};
            if (overrides[varName] !== undefined) return overrides[varName];
            if (contact[varName] !== undefined) return contact[varName];
            // Common defaults
            if (varName === "sender_name") return senderName;
            if (varName === "sender_email") return senderEmail;
            if (varName === "book_demo_url") return `${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/book-demo`;
            return match; // leave unreplaced
          });
        };

        const personalizedSubject = replaceVars(template.subject);
        const personalizedBody = replaceVars(template.body);

        await transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: contact.email,
          replyTo,
          subject: personalizedSubject,
          text: personalizedBody,
          html: personalizedBody.replace(/\n/g, "<br>"),
        });

        sentCount++;

        // Log each sent email
        await query(
          `INSERT INTO email_logs (user_id, recipient, subject, body, status, provider) VALUES ($1, $2, $3, $4, 'sent', 'campaign')`,
          [userId, contact.email, personalizedSubject, personalizedBody]
        );

        // Auto-create lead if not exists
        const existingLead = await query("SELECT id FROM leads WHERE email = $1 AND user_id = $2", [contact.email, userId]);
        if (existingLead.rows.length === 0) {
          await query(
            `INSERT INTO leads (user_id, name, email, phone, company, source, status) VALUES ($1, $2, $3, $4, $5, 'campaign', 'contacted')`,
            [userId, contact.name || "there", contact.email, contact.phone || null, contact.company || null]
          );
        }
      } catch (sendErr) {
        failedCount++;
        errors.push(`${contact.email}: ${String(sendErr)}`);
        console.error(`[campaign] Failed to send to ${contact.email}:`, sendErr);
      }

      // Small delay between sends to avoid Gmail rate limits (1 per second)
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Update campaign status
    await query(
      `UPDATE email_campaigns SET status = 'completed', sent_count = $1, failed_count = $2, completed_at = NOW() WHERE id = $3`,
      [sentCount, failedCount, campaign.id]
    );

    return NextResponse.json({
      campaign: { ...campaign, sent_count: sentCount, failed_count: failedCount, status: "completed" },
      sent: sentCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Campaign error:", error);
    return NextResponse.json({ error: "Failed to create/send campaign: " + String(error) }, { status: 500 });
  }
}

// PUT /api/email-campaigns — send a draft campaign
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    // Re-send by creating a new POST-like request internally
    // For simplicity, we just mark the draft as ready to send
    // The actual sending should be done via POST with the same data
    return NextResponse.json({ error: "Use POST to create and send campaigns" }, { status: 400 });
  } catch (error) {
    console.error("Campaign update error:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}