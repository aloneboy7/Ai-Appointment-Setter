import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as XLSX from "xlsx";
import { createTransport } from "nodemailer";

// GET — List campaigns
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const result = await query(
      "SELECT c.*, t.name as template_name FROM email_campaigns c LEFT JOIN email_templates t ON c.template_id = t.id WHERE c.user_id = $1 ORDER BY c.created_at DESC",
      [userId]
    );

    return NextResponse.json({ campaigns: result.rows });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST — Create campaign from uploaded file or manual contacts
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const contentType = request.headers.get("content-type") || "";

    // ── File upload (Excel/CSV) ──
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const templateId = formData.get("template_id") as string;
      const campaignName = formData.get("name") as string;

      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      if (!templateId) return NextResponse.json({ error: "Template ID required" }, { status: 400 });

      // Parse Excel/CSV
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(workbook.Sheets[sheetName]);

      if (rows.length === 0) return NextResponse.json({ error: "File is empty" }, { status: 400 });

      // Normalize column names (case-insensitive)
      const contacts = rows.map(row => {
        const normalized: Record<string, string> = {};
        for (const [key, value] of Object.entries(row)) {
          normalized[key.toLowerCase().trim()] = String(value || "").trim();
        }
        return {
          email: normalized["email"] || normalized["e-mail"] || normalized["mail"] || "",
          name: normalized["name"] || normalized["full name"] || normalized["first name"] || "",
          company: normalized["company"] || normalized["organization"] || normalized["org"] || "",
          phone: normalized["phone"] || normalized["mobile"] || normalized["tel"] || "",
          ...normalized, // preserve all columns for variable substitution
        };
      }).filter(c => c.email && c.email.includes("@"));

      if (contacts.length === 0) return NextResponse.json({ error: "No valid email addresses found" }, { status: 400 });

      // Create campaign
      const result = await query(
        `INSERT INTO email_campaigns (user_id, template_id, name, status, total_recipients, contacts)
         VALUES ($1, $2, $3, 'draft', $4, $5) RETURNING *`,
        [userId, parseInt(templateId), campaignName || `Campaign ${Date.now()}`, contacts.length, JSON.stringify(contacts)]
      );

      return NextResponse.json({ campaign: result.rows[0], contactsCount: contacts.length }, { status: 201 });
    }

    // ── JSON body (manual contacts or send command) ──
    const body = await request.json();
    const { action } = body;

    // Send campaign
    if (action === "send") {
      const { campaign_id } = body;
      if (!campaign_id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });

      // Get campaign + template + Gmail creds
      const campaignResult = await query(
        "SELECT * FROM email_campaigns WHERE id = $1 AND user_id = $2",
        [campaign_id, userId]
      );
      const campaign = campaignResult.rows[0];
      if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

      const templateResult = await query("SELECT * FROM email_templates WHERE id = $1", [campaign.template_id]);
      const template = templateResult.rows[0];
      if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

      const gmailResult = await query(
        "SELECT settings FROM user_integrations WHERE user_id = $1 AND integration_key = 'gmail' AND status = 'connected'",
        [userId]
      );
      const gmailSettings = gmailResult.rows[0]?.settings;
      if (!gmailSettings?.sender_email || !gmailSettings?.app_password) {
        return NextResponse.json({ error: "Gmail not connected. Connect Gmail in Integrations first." }, { status: 400 });
      }

      // Mark campaign as sending
      await query(
        "UPDATE email_campaigns SET status = 'sending', started_at = NOW() WHERE id = $1",
        [campaign_id]
      );

      const contacts: Record<string, string>[] = typeof campaign.contacts === "string"
        ? JSON.parse(campaign.contacts) : campaign.contacts;

      const transporter = createTransport({
        service: "gmail",
        auth: { user: gmailSettings.sender_email, pass: gmailSettings.app_password },
      });

      let sent = 0;
      let failed = 0;

      for (const contact of contacts) {
        try {
          // Replace variables in subject and body
          let subject = template.subject;
          let emailBody = template.body;
          const replyTo = gmailSettings.reply_to || gmailSettings.sender_email;
          const senderName = gmailSettings.sender_name || "AI Appointment Setter";

          // Add sender_name to contact data
          const data = { ...contact, sender_name: senderName };

          for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
            subject = subject.replace(regex, value);
            emailBody = emailBody.replace(regex, value);
          }

          await transporter.sendMail({
            from: `"${senderName}" <${gmailSettings.sender_email}>`,
            replyTo,
            to: contact.email,
            subject,
            text: emailBody,
          });

          // Log the sent email
          await query(
            `INSERT INTO email_logs (user_id, recipient, subject, body, status, provider) VALUES ($1, $2, $3, $4, 'sent', 'campaign')`,
            [userId, contact.email, subject, emailBody]
          );

          sent++;
        } catch (err) {
          console.error(`Failed to send to ${contact.email}:`, err);
          failed++;
        }

        // Update progress every 5 emails
        if ((sent + failed) % 5 === 0) {
          await query(
            "UPDATE email_campaigns SET sent_count = $1, failed_count = $2 WHERE id = $3",
            [sent, failed, campaign_id]
          );
        }
      }

      // Final update
      await query(
        "UPDATE email_campaigns SET status = 'completed', sent_count = $1, failed_count = $2, completed_at = NOW() WHERE id = $3",
        [sent, failed, campaign_id]
      );

      return NextResponse.json({ sent, failed, total: contacts.length });
    }

    // Create from manual contacts
    const { name, template_id, contacts } = body;
    if (!template_id || !contacts?.length) {
      return NextResponse.json({ error: "Template and contacts required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO email_campaigns (user_id, template_id, name, status, total_recipients, contacts)
       VALUES ($1, $2, $3, 'draft', $4, $5) RETURNING *`,
      [userId, template_id, name || `Campaign ${Date.now()}`, contacts.length, JSON.stringify(contacts)]
    );

    return NextResponse.json({ campaign: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Campaign error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE — Remove a campaign
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });

    await query("DELETE FROM email_campaigns WHERE id = $1 AND user_id = $2", [id, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}