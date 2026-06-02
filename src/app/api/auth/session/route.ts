import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return NextResponse.json(session);
    }
    return NextResponse.json(null);
  } catch {
    return NextResponse.json(null);
  }
}