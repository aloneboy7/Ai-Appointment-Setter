import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET — List all email templates for the current user
export async function GET() {
  try {
    const session = await getServerSession();
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

// POST — Create a new email template
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = userResult.rows[0].id;

    const body = await request.json();
    const { name, subject, body: templateBody, category } = body;

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: "Name, subject, and body are required" }, { status: 400 });
    }

    // Extract variables from {{variable}} patterns
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(`${subject} ${templateBody}`)) !== null) {
      if (!variables.includes(match[1])) variables.push(match[1]);
    }

    const result = await query(
      `INSERT INTO email_templates (user_id, name, subject, body, variables, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, name, subject, templateBody, variables, category || "general"]
    );

    return NextResponse.json({ template: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// PUT — Update an email template
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { id, name, subject, body: templateBody, category } = body;

    if (!id) return NextResponse.json({ error: "Template ID required" }, { status: 400 });

    // Extract variables
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(`${subject || ""} ${templateBody || ""}`)) !== null) {
      if (!variables.includes(match[1])) variables.push(match[1]);
    }

    const result = await query(
      `UPDATE email_templates SET name = $1, subject = $2, body = $3, variables = $4, category = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [name, subject, templateBody, variables, category || "general", id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template: result.rows[0] });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE — Remove an email template
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await query("SELECT id FROM users WHERE email = $1", [session.user.email]);
    const userId = userResult.rows[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Template ID required" }, { status: 400 });

    await query("DELETE FROM email_templates WHERE id = $1 AND user_id = $2", [id, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}