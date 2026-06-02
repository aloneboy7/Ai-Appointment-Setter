import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initDb } from "@/lib/models";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const result = await query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    const unreadResult = await query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false",
      [userId]
    );
    return NextResponse.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadResult.rows[0]?.count || "0"),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
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
    const { type, title, message, actionUrl } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type || "info", title, message, actionUrl || null]
    );
    return NextResponse.json({ notification: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
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
    const { markAllRead, id } = body;

    if (markAllRead) {
      await query(
        "UPDATE notifications SET read = true WHERE user_id = $1 AND read = false",
        [userId]
      );
      return NextResponse.json({ success: true });
    }

    if (id) {
      await query(
        "UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}