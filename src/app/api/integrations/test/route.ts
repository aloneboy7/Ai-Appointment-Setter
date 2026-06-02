import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

// POST — test an integration connection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const { integrationKey } = await req.json();

    if (!integrationKey) {
      return NextResponse.json({ error: "integrationKey is required" }, { status: 400 });
    }

    // Get the integration settings
    const result = await query(
      "SELECT settings FROM user_integrations WHERE user_id = $1 AND integration_key = $2 AND status = 'connected'",
      [userId, integrationKey]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Integration not connected" });
    }

    const settings = result.rows[0].settings;

    // Test based on integration type
    if (integrationKey === "gmail") {
      const email = settings.sender_email;
      const appPassword = settings.app_password;

      if (!email || !appPassword) {
        return NextResponse.json({
          success: false,
          error: "Missing sender email or app password. Please configure both fields.",
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: email, pass: appPassword },
        });

        await transporter.verify();
        transporter.close();

        return NextResponse.json({
          success: true,
          message: `Gmail SMTP connection verified for ${email}`,
        });
      } catch (smtpErr: unknown) {
        const msg = smtpErr instanceof Error ? smtpErr.message : String(smtpErr);

        // Parse user-friendly error
        let friendlyError = msg;
        if (msg.includes("535") || msg.includes("Invalid login") || msg.includes("BadCredentials")) {
          friendlyError = "App Password rejected by Gmail. Please generate a fresh App Password at myaccount.google.com/apppasswords and update the Gmail integration.";
        } else if (msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
          friendlyError = "Could not reach Gmail SMTP server. Check your internet connection.";
        }

        return NextResponse.json({ success: false, error: friendlyError });
      }
    }

    // Generic test for other integrations (just check settings exist)
    const hasRequired = Object.keys(settings).some((k) => k !== "auto_sync" && settings[k]);
    if (hasRequired) {
      return NextResponse.json({
        success: true,
        message: `${integrationKey} has credentials configured. Connection test not yet implemented for this integration.`,
      });
    }

    return NextResponse.json({
      success: false,
      error: "No credentials configured for this integration.",
    });
  } catch (error) {
    console.error("Test integration error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}