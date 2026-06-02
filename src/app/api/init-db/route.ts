import { NextResponse } from "next/server";
import { initDb } from "@/lib/models";

export async function POST() {
  try {
    await initDb();
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error) {
    console.error("DB init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}