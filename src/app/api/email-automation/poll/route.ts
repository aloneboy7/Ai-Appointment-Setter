import { NextResponse } from "next/server";
import { pollInboxesAndReply, startIdleListener } from "@/lib/email-automation";

let idleStarted = false;

// POST — trigger inbox poll and auto-reply
export async function POST() {
  try {
    // Start IMAP IDLE listener on first call (instant push notifications)
    if (!idleStarted) {
      idleStarted = true;
      // Start IDLE in background (don't await — it blocks)
      startIdleListener().catch(err =>
        console.error("[poll] IDLE start error:", err)
      );
      console.log("[poll] IMAP IDLE listener initiated for instant replies");
    }

    // Also do a manual poll as fallback
    const result = await pollInboxesAndReply();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Email automation poll error:", error);
    return NextResponse.json(
      { error: "Poll failed", details: String(error) },
      { status: 500 }
    );
  }
}

// GET — quick status check
export async function GET() {
  return NextResponse.json({
    status: "active",
    idle: idleStarted,
    message: "Email automation polling endpoint is running. POST to trigger a poll.",
  });
}