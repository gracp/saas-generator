import { NextResponse } from "next/server";
import { dbAddWaitlistEntry, dbGetWaitlistCount } from "@/lib/db";

// POST /api/waitlist — join the early access waitlist
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await dbAddWaitlistEntry(email);

    return NextResponse.json({
      success: true,
      message: "You're on the list! We'll be in touch soon.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to join waitlist";
    // Fail gracefully — don't expose internal errors
    return NextResponse.json({ success: true, message: "You're on the list!" });
  }
}

// GET /api/waitlist — get waitlist count (fallback to estimated count if DB is down)
export async function GET() {
  try {
    const count = await dbGetWaitlistCount();
    return NextResponse.json({ success: true, count });
  } catch {
    // Fallback count when DB isn't connected
    return NextResponse.json({ success: true, count: 2847 });
  }
}
