import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAppointmentsByUserId, getUpcomingAppointments,
  createAppointment, updateAppointment, deleteAppointment, initDb,
} from "@/lib/models";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";

    if (upcoming) {
      const appointments = await getUpcomingAppointments(userId, 20);
      return NextResponse.json({ appointments });
    }

    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const appointments = await getAppointmentsByUserId(userId, limit, offset);
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
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
    const { leadId, title, description, meetingType, meetingLink, scheduledAt, durationMinutes } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Title and scheduled time are required" }, { status: 400 });
    }

    const appointment = await createAppointment({
      userId, leadId, title, description, meetingType, meetingLink,
      scheduledAt, durationMinutes,
    });

    // Create notification for the new meeting
    const meetingTime = new Date(scheduledAt).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
    });
    await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, 'meeting', $2, $3, '/dashboard/calendar')`,
      [userId, "Meeting booked ✅", `"${title}" scheduled for ${meetingTime}${meetingType === "video" ? " via video call" : meetingType === "phone" ? " via phone" : " in-person"}.`]
    );

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
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
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    const appointment = await updateAppointment(id, userId, data);
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
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
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    const deleted = await deleteAppointment(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}