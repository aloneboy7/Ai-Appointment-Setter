import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initDb } from "@/lib/models";
import { query } from "@/lib/db";

const SAMPLE_CONVERSATIONS = [
  {
    leadName: "Sarah Johnson",
    leadEmail: "sarah@techcorp.com",
    channel: "website_chat",
    messages: [
      { role: "assistant", content: "Hi there! 👋 Welcome to AI Appointment Setter. I'm your AI assistant — I can help you learn about our features, pricing, or get you booked for a demo. What are you most interested in?", timestamp: "2026-05-26T18:30:00Z" },
      { role: "user", content: "Hi! I'm interested in your pricing plans", timestamp: "2026-05-26T18:30:15Z" },
      { role: "assistant", content: "Great question! Our plans start at $49/month for Starter, $99/month for Growth (most popular), and $299/month for Enterprise. All plans include a 14-day free trial. Would you like to schedule a call to discuss which plan fits your needs?", timestamp: "2026-05-26T18:30:16Z" },
      { role: "user", content: "Yes, I'd love a demo. Can we do Wednesday at 10 AM?", timestamp: "2026-05-26T18:30:45Z" },
      { role: "assistant", content: "Excellent! 🎉 Wednesday at 10 AM works perfectly. I'll send a calendar invite to your email. In the meantime, could you tell me your industry so I can customize the demo for you?", timestamp: "2026-05-26T18:30:46Z" },
      { role: "user", content: "We're a real estate agency in Austin, TX", timestamp: "2026-05-26T18:31:10Z" },
      { role: "assistant", content: "Perfect! Real estate is one of our strongest use cases. Our AI can auto-qualify buyer leads based on budget, timeline, and preferences — then book property viewings directly. I'll make sure the demo covers real estate-specific features. See you Wednesday! 📅", timestamp: "2026-05-26T18:31:11Z" },
    ],
  },
  {
    leadName: "Mike Chen",
    leadEmail: "mike@growth.io",
    channel: "email",
    messages: [
      { role: "assistant", content: "Thanks for your interest in AI Appointment Setter! I noticed you downloaded our ebook on lead conversion. How can I help you today?", timestamp: "2026-05-26T15:00:00Z" },
      { role: "user", content: "What integrations do you support?", timestamp: "2026-05-26T15:02:00Z" },
      { role: "assistant", content: "We integrate with Google Calendar, Outlook, HubSpot, Salesforce, Gmail, Slack, WhatsApp, Zoom, Stripe, and Calendly — plus 20+ more via our API. All integrations take less than 5 minutes to set up. Would you like to see how?", timestamp: "2026-05-26T15:02:01Z" },
      { role: "user", content: "We use HubSpot and Zoom mainly", timestamp: "2026-05-26T15:03:30Z" },
      { role: "assistant", content: "Great choices! HubSpot + Zoom is our most popular combo. Leads from HubSpot forms auto-trigger AI conversations, and when they book a meeting, a Zoom link is generated and synced back to HubSpot as an activity. Want me to set up a demo showing this exact flow?", timestamp: "2026-05-26T15:03:31Z" },
    ],
  },
  {
    leadName: "Emily Davis",
    leadEmail: "emily@brightsmile.com",
    channel: "whatsapp",
    messages: [
      { role: "assistant", content: "Hello! 👋 Thanks for reaching out via WhatsApp. I'm the AI assistant for BrightSmile Dental. How can I help you today?", timestamp: "2026-05-26T12:00:00Z" },
      { role: "user", content: "I need to book a teeth cleaning appointment", timestamp: "2026-05-26T12:00:30Z" },
      { role: "assistant", content: "I'd be happy to help you book a cleaning! 😁 We have availability this week on:\n\n• Tuesday at 2:00 PM\n• Wednesday at 10:00 AM\n• Thursday at 4:00 PM\n\nWhich time works best for you?", timestamp: "2026-05-26T12:00:31Z" },
      { role: "user", content: "Thursday at 4 works!", timestamp: "2026-05-26T12:01:00Z" },
      { role: "assistant", content: "✅ Booked! Your teeth cleaning is confirmed for Thursday at 4:00 PM at our downtown location. You'll receive a reminder 24 hours before. Is there anything else you need?", timestamp: "2026-05-26T12:01:01Z" },
    ],
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

    // Check if sample conversations already exist for this user
    const existing = await query(
      "SELECT COUNT(*) as count FROM conversations WHERE user_id = $1",
      [userId]
    );
    if (parseInt(existing.rows[0].count) > 0) {
      return NextResponse.json({ message: "Conversations already exist. Skipping seed.", count: parseInt(existing.rows[0].count) });
    }

    let created = 0;
    for (const conv of SAMPLE_CONVERSATIONS) {
      // Find or create a lead for this conversation
      let leadResult = await query(
        "SELECT id FROM leads WHERE email = $1 AND user_id = $2",
        [conv.leadEmail, userId]
      );
      let leadId: number | null = null;
      if (leadResult.rows.length > 0) {
        leadId = leadResult.rows[0].id;
      } else {
        leadResult = await query(
          "INSERT INTO leads (user_id, name, email, source, status) VALUES ($1, $2, $3, 'ai_chat', 'contacted') RETURNING id",
          [userId, conv.leadName, conv.leadEmail]
        );
        leadId = leadResult.rows[0].id;
      }

      // Create conversation
      await query(
        `INSERT INTO conversations (user_id, lead_id, channel, messages, status, last_message_at)
         VALUES ($1, $2, $3, $4, 'active', NOW())`,
        [userId, leadId, conv.channel, JSON.stringify(conv.messages)]
      );
      created++;
    }

    return NextResponse.json({ message: `Created ${created} sample conversations!`, count: created });
  } catch (error) {
    console.error("Seed conversations error:", error);
    return NextResponse.json({ error: "Failed to seed conversations" }, { status: 500 });
  }
}