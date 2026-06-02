import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

// GET — list user's connected integrations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const result = await query(
      "SELECT integration_key, status, connected_at, settings FROM user_integrations WHERE user_id = $1",
      [userId]
    );

    return NextResponse.json({ connections: result.rows });
  } catch (error) {
    console.error("Get integrations error:", error);
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}

// POST — connect or update an integration
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const body = await req.json();
    const { integrationKey, settings } = body;

    if (!integrationKey) {
      return NextResponse.json({ error: "integrationKey is required" }, { status: 400 });
    }

    // Merge settings — keep existing + update with new
    const existing = await query(
      "SELECT settings FROM user_integrations WHERE user_id = $1 AND integration_key = $2",
      [userId, integrationKey]
    );

    const existingSettings = existing.rows[0]?.settings || {};
    const mergedSettings = { ...existingSettings, ...settings };

    const result = await query(
      `INSERT INTO user_integrations (user_id, integration_key, status, connected_at, settings)
       VALUES ($1, $2, 'connected', NOW(), $3)
       ON CONFLICT (user_id, integration_key)
       DO UPDATE SET status = 'connected', connected_at = NOW(), settings = $3, updated_at = NOW()
       RETURNING *`,
      [userId, integrationKey, JSON.stringify(mergedSettings)]
    );

    return NextResponse.json({ connection: result.rows[0] });
  } catch (error) {
    console.error("Connect integration error:", error);
    return NextResponse.json({ error: "Failed to connect integration" }, { status: 500 });
  }
}

// DELETE — disconnect an integration (reads key from JSON body)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const body = await req.json();
    const { integrationKey } = body;

    if (!integrationKey) {
      return NextResponse.json({ error: "integrationKey is required" }, { status: 400 });
    }

    await query(
      "DELETE FROM user_integrations WHERE user_id = $1 AND integration_key = $2",
      [userId, integrationKey]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect integration error:", error);
    return NextResponse.json({ error: "Failed to disconnect integration" }, { status: 500 });
  }
}