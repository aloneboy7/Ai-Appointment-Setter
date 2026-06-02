import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initDb } from "@/lib/models";
import { query } from "@/lib/db";
import { sendEmail, aiFollowUpTemplate } from "@/lib/email";

const CONVERSATION_SYSTEM_PROMPT = `You are the AI Appointment Setter bot having a live conversation with a lead (potential customer) on behalf of a business. You are NOT a general assistant — you are a sales/reception AI whose job is to engage the lead, answer their questions about the product, qualify them, and guide them toward booking a meeting or starting a free trial.

## Your Product — AI Appointment Setter
An AI-powered SaaS tool that automates lead follow-up, qualification, and appointment booking. Key features: AI chat, smart lead qualification, email + SMS follow-ups, calendar booking (Google Calendar/Outlook), CRM sync (HubSpot/Salesforce/40+), analytics dashboard, multi-channel (email/SMS/WhatsApp/chat), automated reminders.

## Pricing
- Starter: $49/mo ($39/mo annual) — 500 conversations, email follow-ups
- Growth: $99/mo ($79/mo annual) — unlimited conversations, SMS + email, CRM, analytics — MOST POPULAR
- Enterprise: $299/mo ($249/mo annual) — custom workflows, API, dedicated support
- All plans: 14-day free trial, no credit card required

## Your Personality
- Warm, professional, and concise
- You speak as if you are the business's AI receptionist helping their lead
- Use 1-2 emojis max per message
- Keep responses to 2-3 sentences
- Always guide toward a next step (booking a meeting, answering a question, etc.)

## What You Do
1. Greet leads warmly when they say hello
2. Answer questions about pricing, features, integrations, how it works
3. If they ask to book a meeting, offer specific times (e.g., "I have Tuesday at 2 PM or Wednesday at 10 AM")
4. If they ask something off-topic, gently redirect: "I'm here to help with questions about our AI appointment booking service. Want to learn about our pricing or book a demo?"
5. If they seem interested, encourage them to start a free trial or book a demo
6. If they say thanks or goodbye, close warmly and leave the door open

## Rules
- NEVER break character — you are always the AI appointment bot
- NEVER say "I don't have that information" — instead offer to connect them with a human
- NEVER write long paragraphs — keep it conversational and brief
- Do NOT use markdown formatting — plain text only`;

// Fallback responses when LLM is unavailable
function getFallbackResponse(input: string): string {
  const lower = input.toLowerCase();
  if (/^(hi|hello|hey)/i.test(lower))
    return "Hi there! 👋 Welcome! I'm here to help you learn about our AI appointment booking service. Are you looking for pricing info, a demo, or have a specific question?";
  if (/pric|cost|plan|how much/i.test(lower))
    return "Our plans start at $49/month for Starter, $99/month for Growth (most popular), and $299/month for Enterprise — all with a 14-day free trial. Want me to help you pick the right plan?";
  if (/demo|call|meeting|schedule|book/i.test(lower))
    return "I'd love to set up a demo! I have availability Tuesday at 2 PM or Wednesday at 10 AM this week. Which works best for you?";
  if (/integrat|crm|connect|hubspot|salesforce/i.test(lower))
    return "We integrate with Google Calendar, Outlook, HubSpot, Salesforce, Slack, WhatsApp, and 40+ more tools. Setup takes under 5 minutes! Want to see how it works?";
  if (/feature|what can|how does/i.test(lower))
    return "Our AI handles lead qualification, automated follow-ups, calendar booking, and CRM sync — all on autopilot. What's your biggest challenge with lead management right now?";
  if (/thank/i.test(lower))
    return "You're welcome! 😊 Feel free to reach out anytime — I'm here 24/7. Would you like to start a free trial in the meantime?";
  if (/bye|goodbye/i.test(lower))
    return "Great chatting with you! 👋 I'll save your info. Feel free to come back anytime — I'm always here to help.";
  if (/yes|sure|interested|sounds good/i.test(lower))
    return "Awesome! 🎉 To get you started, could you share your name and email? I'll set up your account right away.";
  return "Thanks for your message! I can help with pricing, features, booking a demo, or any questions about our AI. What would you like to know?";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await initDb();

    const userId = parseInt((session.user as Record<string, unknown>).id as string);
    const { id } = await params;
    const conversationId = parseInt(id);
    const body = await request.json();
    const { content, sender } = body;

    if (!content || !sender) {
      return NextResponse.json({ error: "Content and sender are required" }, { status: 400 });
    }

    // Verify conversation belongs to user
    const convResult = await query(
      "SELECT * FROM conversations WHERE id = $1 AND user_id = $2",
      [conversationId, userId]
    );
    if (convResult.rows.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const conversation = convResult.rows[0];
    const messages = conversation.messages || [];

    // Add user message
    const userMessage = {
      role: sender,
      content,
      timestamp: new Date().toISOString(),
    };
    messages.push(userMessage);

    // Generate AI response if message is from the lead
    let aiMessage = null;
    if (sender === "user") {
      let aiResponse: string;

      try {
        const apiKey = process.env.OPENAI_API_KEY;
        const baseUrl = process.env.OPENAI_BASE_URL;

        if (apiKey && baseUrl) {
          // Build conversation history for the LLM
          const chatHistory = messages.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role === "user" ? "user" as const : "assistant" as const,
            content: m.content,
          }));

          const llmResponse = await fetch(`${baseUrl}/v1/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "drytis/kimi-k2.5",
              messages: [
                { role: "system", content: CONVERSATION_SYSTEM_PROMPT },
                ...chatHistory,
              ],
              max_tokens: 200,
              temperature: 0.7,
            }),
          });

          if (llmResponse.ok) {
            const data = await llmResponse.json();
            aiResponse = data.choices?.[0]?.message?.content?.trim() || getFallbackResponse(content);
          } else {
            aiResponse = getFallbackResponse(content);
          }
        } else {
          aiResponse = getFallbackResponse(content);
        }
      } catch {
        aiResponse = getFallbackResponse(content);
      }

      aiMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      messages.push(aiMessage);
    }

    // Update conversation
    await query(
      `UPDATE conversations SET messages = $1, last_message_at = NOW() WHERE id = $2`,
      [JSON.stringify(messages), conversationId]
    );

    // 📧 Send AI reply as email follow-up (if lead has an email)
    if (aiMessage && conversation.lead_email) {
      try {
        const leadName = conversation.lead_name || "there";
        const senderName = (session.user as Record<string, unknown>).name as string || "AI Appointment Setter";
        const template = aiFollowUpTemplate(leadName, aiMessage.content, senderName);
        const emailResult = await sendEmail(userId, conversation.lead_email, template.subject, template.html);
        if (emailResult.success) {
          console.log(`AI follow-up email sent to ${conversation.lead_email}`);
        } else {
          console.warn(`AI follow-up email failed: ${emailResult.error}`);
        }
      } catch (emailErr) {
        console.warn("Conversation email error:", emailErr);
      }
    }

    return NextResponse.json({
      message: userMessage,
      aiMessage,
      emailSent: aiMessage && conversation.lead_email ? true : undefined,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}