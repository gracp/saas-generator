import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe-app";

// POST /api/billing/portal — create Stripe Customer Portal session
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In a real app we'd look up the Stripe customer ID from the DB
    // For now, return an error directing to settings
    return NextResponse.json(
      { error: "No active subscription found. Please subscribe first." },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to open portal";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
