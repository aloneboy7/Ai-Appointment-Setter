import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initDb } from "@/lib/models";
import { query } from "@/lib/db";

const DEMO_NOTIFICATIONS = [
  {
    type: "lead",
    title: "New lead captured",
    message: "Sarah Johnson from TechCorp submitted a demo request via the website chatbot.",
    link: "/dashboard/leads",
  },
  {
    type: "meeting",
    title: "Meeting booked automatically",
    message: "AI booked a Product Demo with Mike Chen (GrowthIO) for tomorrow at 10:00 AM via Zoom.",
    link: "/dashboard/calendar",
  },
  {
    type: "ai",
    title: "AI follow-up sent",
    message: "Automated follow-up email sent to Emily Davis — 2nd touchpoint in the sequence.",
    link: "/dashboard/conversations",
  },
  {
    type: "success",
    title: "Lead converted! 🎉",
    message: "James Wilson from AgencyHub upgraded to a Growth plan after the demo call.",
    link: "/dashboard/analytics",
  },
  {
    type: "warning",
    title: "Trial expiring soon",
    message: "Your 14-day free trial expires in 3 days. Upgrade now to keep your AI assistant running.",
    link: "/#pricing",
  },
  {
    type: "integration",
    title: "HubSpot sync complete",
    message: "Successfully synced 23 new contacts from HubSpot. Leads are now being followed up by AI.",
    link: "/dashboard/leads",
  },
  {
    type: "ai",
    title: "AI conversation insight",
    message: "Your AI chatbot handled 12 conversations today with a 92% satisfaction score. View the report.",
    link: "/dashboard/analytics",
  },
  {
    type: "info",
    title: "New feature available",
    message: "WhatsApp Business integration is now live! Connect it from AI Settings to reach leads on WhatsApp.",
    link: "/dashboard/ai-settings",
  },
];

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);

    // Check if notifications already exist
    const existing = await query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1",
      [userId]
    );
    if (parseInt(existing.rows[0].count) > 0) {
      return NextResponse.json({
        message: `You already have ${existing.rows[0].count} notifications.`,
        count: parseInt(existing.rows[0].count),
      });
    }

    // Insert demo notifications with staggered timestamps
    let created = 0;
    for (let i = 0; i < DEMO_NOTIFICATIONS.length; i++) {
      const n = DEMO_NOTIFICATIONS[i];
      const hoursAgo = i * 3 + Math.floor(Math.random() * 2);
      await query(
        `INSERT INTO notifications (user_id, type, title, message, link, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${hoursAgo} hours')`,
        [userId, n.type, n.title, n.message, n.link, i > 4] // first 5 unread, rest read
      );
      created++;
    }

    return NextResponse.json({
      message: `Created ${created} demo notifications!`,
      count: created,
    });
  } catch (error) {
    console.error("Seed notifications error:", error);
    return NextResponse.json({ error: "Failed to seed notifications" }, { status: 500 });
  }
}