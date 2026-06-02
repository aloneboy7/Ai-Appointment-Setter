import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

// GET /api/email-templates — list all templates for the current user
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
      "SELECT * FROM email_templates WHERE user_id = $1 ORDER BY is_default DESC, updated_at DESC",
      [userId]
    );

    return NextResponse.json({ templates: result.rows });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST /api/email-templates — create a new template
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
    const { name, subject, body: templateBody, variables, isDefault, category } = body;

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: "Name, subject, and body are required" }, { status: 400 });
    }

    // Extract variables from template body ({{variable_name}} pattern)
    const varRegex = /\{\{(\w+)\}\}/g;
    const bodyMatches = [...templateBody.matchAll(varRegex)].map((m) => m[1]);
    const subjMatches = [...subject.matchAll(varRegex)].map((m) => m[1]);
    const extractedVars = [...new Set([...bodyMatches, ...subjMatches])];

    // If setting as default, unset other defaults
    if (isDefault) {
      await query("UPDATE email_templates SET is_default = false WHERE user_id = $1", [userId]);
    }

    const result = await query(
      `INSERT INTO email_templates (user_id, name, subject, body, variables, is_default, category)
       VALUES ($1, $2, $3, $4, $5::text[], $6, $7)
       RETURNING *`,
      [userId, name, subject, templateBody, extractedVars, isDefault || false, category || "general"]
    );

    return NextResponse.json({ template: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// PUT /api/email-templates — update a template
export async function PUT(req: NextRequest) {
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
    const { id, name, subject, body: templateBody, isDefault, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await query("SELECT user_id FROM email_templates WHERE id = $1", [id]);
    if (existing.rows.length === 0 || existing.rows[0].user_id !== userId) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Extract variables from updated body
    const varRegex = /\{\{(\w+)\}\}/g;
    const bodyMatches = [...templateBody.matchAll(varRegex)].map((m) => m[1]);
    const subjMatches = [...subject.matchAll(varRegex)].map((m) => m[1]);
    const extractedVars = [...new Set([...bodyMatches, ...subjMatches])];

    // If setting as default, unset other defaults
    if (isDefault) {
      await query("UPDATE email_templates SET is_default = false WHERE user_id = $1", [userId]);
    }

    const result = await query(
      `UPDATE email_templates
       SET name = $1, subject = $2, body = $3, variables = $4::text[], is_default = $5, category = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [name, subject, templateBody, extractedVars, isDefault || false, category || "general", id, userId]
    );

    return NextResponse.json({ template: result.rows[0] });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE /api/email-templates?id=X
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    await query("DELETE FROM email_templates WHERE id = $1 AND user_id = $2", [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}