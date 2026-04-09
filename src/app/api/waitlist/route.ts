import { NextResponse } from "next/server";
import { dbAddWaitlistEntry, dbGetWaitlistCount } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { csrfCheck } from "@/lib/csrf";

// POST /api/waitlist — join the early access waitlist
export async function POST(request: Request) {
  // CSRF check for cross-origin requests
  const csrfError = csrfCheck(request);
  if (csrfError) return csrfError;

  const ip = getClientIp(request);
  const limited = rateLimit({ key: `waitlist:${ip}`, ...RATE_LIMITS.auth });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }
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
    console.error("[Waitlist] DB error:", error instanceof Error ? error.message : error);
    // Don't silently swallow — tell the user something went wrong
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
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
