import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";

const SYSTEM_PROMPT = `You are the AI Appointment Setter assistant — a friendly, knowledgeable chatbot on the AI Appointment Setter website (${SITE_URL}). Your ONLY job is to help visitors understand the product and guide them toward signing up.

## About AI Appointment Setter
AI Appointment Setter is a SaaS product that automates lead follow-up, qualification, and appointment booking using AI. It responds to leads in under 12 seconds, qualifies them with intelligent questions, books meetings directly into the user's calendar, and logs everything to the CRM automatically.

## Key Features
1. AI Chat Assistant — Conversational AI that engages, qualifies, and books meetings automatically
2. Smart Lead Qualification — AI asks targeted questions to score and prioritize best leads
3. Email + SMS Follow-ups — Automated multi-channel sequences that keep leads engaged
4. Calendar Booking — Seamless scheduling that books directly into Google Calendar or Outlook
5. CRM Integration — Sync with HubSpot, Salesforce, and 20+ CRMs
6. Analytics Dashboard — Real-time insights on response times, conversion rates, pipeline health
7. Multi-channel Communication — Reach leads on email, SMS, WhatsApp, and web chat
8. Human Handoff — Seamlessly transfer complex conversations to the team
9. Pipeline Tracking — Visual pipeline showing every lead's journey
10. Automated Reminders — Reduce no-shows by 35% with smart pre-meeting reminders

## Pricing
- Starter: $49/month (billed monthly) or $39/month (billed annually) — 500 conversations/month, email follow-ups, basic CRM
- Growth: $99/month (billed monthly) or $79/month (billed annually) — Unlimited conversations, SMS + email follow-ups, advanced CRM, analytics — MOST POPULAR
- Enterprise: $299/month (billed monthly) or $249/month (billed annually) — Custom workflows, dedicated support, multi-team, API access

All plans include a free 14-day trial. No credit card required.

## Integrations
Google Calendar, Outlook, HubSpot, Salesforce, Gmail, Slack, WhatsApp, Zoom, Stripe, Calendly, and 40+ more.

## How It Works (5 steps)
1. Lead Submits Inquiry — fills out a form, sends an email, or messages you
2. AI Replies Instantly — responds in under 12 seconds with a personalized message
3. AI Qualifies the Lead — intelligent questions determine if the lead is a good fit
4. AI Books the Meeting — qualified leads schedule directly into your calendar
5. CRM Updates Automatically — every detail is logged, no manual data entry

## Use Cases
- Real Estate — Book property viewings automatically, follow up with buyers/sellers 24/7
- Marketing Agencies — Qualify inbound leads instantly, never miss a form submission
- Consultants — Automate discovery call scheduling, reduce no-shows
- Healthcare/Clinics — Handle patient appointment requests 24/7, reduce front desk workload

## ROI
Most customers see 3-5x ROI in the first month. Response times drop from hours to seconds. Lead conversion typically triples. No-shows drop 35% with automated reminders.

## STRICT RULES
- ONLY answer questions about AI Appointment Setter — its features, pricing, integrations, how it works, use cases, ROI, and getting started.
- If someone asks about unrelated topics (politics, sports, coding help, other products, etc.), politely say you can only help with questions about AI Appointment Setter and redirect them.
- NEVER make up features, pricing, or integrations that aren't listed above.
- Keep responses concise — 2-3 sentences max. Be warm but not overly chatty.
- Always end with a helpful next step (e.g., "Would you like to try it free for 14 days?" or "Want me to walk you through the features?").
- Use relevant emojis sparingly (1-2 per response max).
- Do NOT use markdown formatting, bullet points, or headers in your responses — write plain conversational text.`;

export async function POST(req: NextRequest) {
  let messages: { role: string; content: string }[] = [];
  try {
    const body = await req.json();
    messages = body.messages || [];

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL;

    if (!apiKey || !baseUrl) {
      // Fallback to keyword responses if API not configured
      return NextResponse.json({
        reply: getFallbackResponse(messages),
        quickReplies: getFallbackQuickReplies(messages),
      });
    }

    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-10), // Keep last 10 messages for context
    ];

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "drytis/kimi-k2.5",
        messages: chatMessages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("LLM API error:", response.status, errText);
      return NextResponse.json({
        reply: getFallbackResponse(messages),
        quickReplies: getFallbackQuickReplies(messages),
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || getFallbackResponse(messages);

    // Determine quick replies based on conversation context
    const quickReplies = getContextualQuickReplies(messages, reply);

    return NextResponse.json({ reply, quickReplies });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: getFallbackResponse(messages),
      quickReplies: getFallbackQuickReplies([]),
    });
  }
}

// Fallback keyword-based responses when LLM is unavailable
function getFallbackResponse(messages: { role: string; content: string }[]): string {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content?.toLowerCase() || "";
  if (/pric|cost|plan|budget|\$|how much/i.test(lastUserMsg))
    return "Our plans start at $49/month for Starter, $99/month for Growth, and $299/month for Enterprise — all with a free 14-day trial! 🎉";
  if (/demo|call|meeting|schedule|book/i.test(lastUserMsg))
    return "I'd love to show you a demo! You can schedule one at " + SITE_URL + "/book-demo";
  if (/integrat|crm|hubspot|salesforce|connect/i.test(lastUserMsg))
    return "We integrate with Google Calendar, Outlook, HubSpot, Salesforce, Slack, WhatsApp, and 40+ more tools!";
  if (/feature|what can|how does/i.test(lastUserMsg))
    return "Our AI handles lead qualification, instant replies, appointment booking, email/SMS follow-ups, and CRM sync — all on autopilot!";
  if (/hello|hi|hey/i.test(lastUserMsg))
    return "Hey there! 👋 I can help you learn about our pricing, features, or get you started with a free trial.";
  return "I'm here to help you learn about AI Appointment Setter! Ask me about pricing, features, integrations, or how it works.";
}

function getFallbackQuickReplies(messages: { role: string; content: string }[]): string[] {
  return ["Pricing", "Features", "Book a Demo", "Integrations"];
}

function getContextualQuickReplies(
  messages: { role: string; content: string }[],
  reply: string
): string[] {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content?.toLowerCase() || "";
  const replyLower = reply.toLowerCase();

  // Don't repeat what they just asked about
  if (/pric|cost|plan/i.test(lastUserMsg) || /pric|cost|plan/i.test(replyLower)) {
    return ["Compare Plans", "Start Free Trial", "Book a Demo"];
  }
  if (/demo|schedule|book|call/i.test(lastUserMsg)) {
    return ["Start Free Trial", "See Features", "View Integrations"];
  }
  if (/integrat|crm|connect|hubspot|salesforce/i.test(lastUserMsg) || /integrat|sync/i.test(replyLower)) {
    return ["Pricing", "Book a Demo", "Start Free Trial"];
  }
  if (/feature|what can|how does|what is/i.test(lastUserMsg)) {
    return ["Book a Demo", "Pricing", "Integrations"];
  }
  if (/trial|start|sign up|free|register/i.test(lastUserMsg) || /trial|free/i.test(replyLower)) {
    return ["Book a Demo", "View Features", "See Pricing"];
  }
  if (/hello|hi|hey/i.test(lastUserMsg)) {
    return ["Pricing", "Features", "Book a Demo", "Integrations"];
  }

  return ["Pricing", "Features", "Book a Demo", "Integrations"];
}