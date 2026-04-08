import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PLANS, createCheckoutSession } from "@/lib/stripe-app";

// POST /api/billing/checkout — create Stripe Checkout session
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { priceId } = await request.json();
    const userId = (session.user as { id?: string }).id ?? session.user.email;

    // Validate price ID
    const validPriceIds = Object.values(PLANS).filter(Boolean);
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const returnUrl =
      process.env.NEXTAUTH_URL
        ? `${process.env.NEXTAUTH_URL}/dashboard/settings`
        : "http://localhost:3457/dashboard/settings";

    const checkoutSession = await createCheckoutSession({
      priceId,
      userId,
      userEmail: session.user.email,
      returnUrl,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
