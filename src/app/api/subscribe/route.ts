import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter, initDb } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    await initDb();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const result = await subscribeNewsletter(email);

    if (!result) {
      return NextResponse.json(
        { message: "You're already subscribed!" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "You've been subscribed! Check your email for confirmation." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}