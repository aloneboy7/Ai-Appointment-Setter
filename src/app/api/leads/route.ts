import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getLeadsByUserId, getLeadById, createLead, updateLead, deleteLead, initDb,
} from "@/lib/models";
import { query } from "@/lib/db";
import { sendEmail, newLeadWelcomeTemplate } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const leads = await getLeadsByUserId(userId, limit, offset);
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const body = await request.json();
    const { name, email, phone, company, source, notes } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const lead = await createLead({ userId, name, email, phone, company, source, notes });

    // Create notification for the new lead
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'lead', $2, $3, '/dashboard/leads')`,
      [userId, "New lead added", `${name} from ${company || "unknown company"} was added as a lead via ${source || "manual"} entry.`]
    );

    // 📧 Auto-send welcome email to the new lead
    const emailResult = await sendEmail(
      userId,
      email,
      newLeadWelcomeTemplate(name, session.user.name || "AI Appointment Setter", "").subject,
      newLeadWelcomeTemplate(name, session.user.name || "AI Appointment Setter", "").html
    );
    if (emailResult.success) {
      console.log(`Welcome email sent to ${email} (messageId: ${emailResult.messageId})`);
    } else {
      console.warn(`Welcome email failed for ${email}: ${emailResult.error}`);
    }

    return NextResponse.json({
      lead,
      emailSent: emailResult.success,
      emailError: emailResult.success ? undefined : emailResult.error,
    }, { status: 201 });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const lead = await updateLead(id, userId, data);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const deleted = await deleteLead(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}