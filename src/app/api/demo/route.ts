import { NextRequest, NextResponse } from "next/server";
import { createDemoBooking, initDb } from "@/lib/models";
import { sendEmail, demoBookingTemplate } from "@/lib/email";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await initDb();

    const body = await request.json();
    const { name, email, company, phone, industry, message, preferred_time } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
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

    const booking = await createDemoBooking({
      name,
      email,
      company,
      phone,
      industry,
      message,
      preferred_time,
    });

    // 📧 Auto-send demo confirmation email
    // Find the first user with Gmail connected to send from
    try {
      const adminResult = await query(
        `SELECT u.id, u.name FROM users u
         JOIN user_integrations ui ON u.id = ui.user_id
         WHERE ui.integration_key = 'gmail' AND ui.status = 'connected'
         LIMIT 1`
      );
      if (adminResult.rows.length > 0) {
        const admin = adminResult.rows[0];
        const template = demoBookingTemplate(name, preferred_time || "", admin.name, company || "");
        const emailResult = await sendEmail(admin.id, email, template.subject, template.html);
        if (emailResult.success) {
          console.log(`Demo confirmation email sent to ${email}`);
        } else {
          console.warn(`Demo confirmation email failed: ${emailResult.error}`);
        }
      }
    } catch (emailErr) {
      console.warn("Demo email send error:", emailErr);
    }

    return NextResponse.json(
      {
        message: "Demo request submitted successfully! We'll contact you within 24 hours.",
        booking: {
          id: booking.id,
          name: booking.name,
          email: booking.email,
          status: booking.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Demo booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}