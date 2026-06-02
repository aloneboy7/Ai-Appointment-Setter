import { NextRequest, NextResponse } from "next/server";
import { createContactMessage, initDb } from "@/lib/models";
import { sendEmail, contactAckTemplate } from "@/lib/email";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await initDb();

    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const contact = await createContactMessage(name, email, message);

    // 📧 Auto-send acknowledgment email
    try {
      const adminResult = await query(
        `SELECT u.id, u.name FROM users u
         JOIN user_integrations ui ON u.id = ui.user_id
         WHERE ui.integration_key = 'gmail' AND ui.status = 'connected'
         LIMIT 1`
      );
      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        const template = contactAckTemplate(name, admin.name);
        const emailResult = await sendEmail(admin.id, email, template.subject, template.html);
        if (emailResult.success) {
          console.log(`Contact acknowledgment email sent to ${email}`);
        } else {
          console.warn(`Contact acknowledgment email failed: ${emailResult.error}`);
        }
      }
    } catch (emailErr) {
      console.warn("Contact email send error:", emailErr);
    }

    return NextResponse.json(
      {
        message: "Thank you for your message! We'll get back to you soon.",
        id: contact.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}