import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const result = await query(
      "SELECT * FROM email_automation_settings WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default settings
      await query(
        "INSERT INTO email_automation_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
        [userId]
      );
      const newResult = await query(
        "SELECT * FROM email_automation_settings WHERE user_id = $1",
        [userId]
      );
      return NextResponse.json(newResult.rows[0]);
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("[email-settings] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;
    const body = await req.json();

    const {
      auto_reply_enabled,
      reply_mode,
      skip_marketing,
      skip_newsletters,
      skip_social,
      skip_transactional,
      skip_job_alerts,
      custom_skip_domains,
      custom_allow_emails,
      reply_tone,
      reply_language,
      max_replies_per_day,
      custom_instructions,
    } = body;

    const result = await query(
      `INSERT INTO email_automation_settings (
        user_id, auto_reply_enabled, reply_mode,
        skip_marketing, skip_newsletters, skip_social,
        skip_transactional, skip_job_alerts,
        custom_skip_domains, custom_allow_emails,
        reply_tone, reply_language, max_replies_per_day,
        custom_instructions, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        auto_reply_enabled = $2, reply_mode = $3,
        skip_marketing = $4, skip_newsletters = $5, skip_social = $6,
        skip_transactional = $7, skip_job_alerts = $8,
        custom_skip_domains = $9, custom_allow_emails = $10,
        reply_tone = $11, reply_language = $12, max_replies_per_day = $13,
        custom_instructions = $14, updated_at = NOW()
      RETURNING *`,
      [
        userId,
        auto_reply_enabled ?? true,
        reply_mode ?? "replies_and_inquiries",
        skip_marketing ?? true,
        skip_newsletters ?? true,
        skip_social ?? true,
        skip_transactional ?? true,
        skip_job_alerts ?? true,
        custom_skip_domains ?? [],
        custom_allow_emails ?? [],
        reply_tone ?? "professional",
        reply_language ?? "en",
        max_replies_per_day ?? 50,
        custom_instructions ?? null,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("[email-settings] PUT error:", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}