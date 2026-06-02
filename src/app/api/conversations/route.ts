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
      `SELECT c.*, l.name as lead_name, l.email as lead_email
       FROM conversations c LEFT JOIN leads l ON c.lead_id = l.id
       WHERE c.user_id = $1 ORDER BY c.last_message_at DESC LIMIT 50`,
      [userId]
    );
    return NextResponse.json({ conversations: result.rows });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
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

    // Create a new conversation (optionally linked to a lead)
    const { leadId, channel } = body;
    const result = await query(
      `INSERT INTO conversations (user_id, lead_id, channel, messages, status, last_message_at)
       VALUES ($1, $2, $3, '[]', 'active', NOW()) RETURNING *`,
      [userId, leadId || null, channel || "ai_chat"]
    );
    return NextResponse.json({ conversation: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}