import { NextResponse } from "next/server";
import { constructWebhookEvent, planFromPriceId, getSubscription } from "@/lib/stripe-app";
import { dbUpdateUserPlan, dbGetUserByCustomerId } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type Stripe from "stripe";

// POST /api/billing/webhook — handle Stripe webhook events
export async function POST(request: Request) {
  // Rate limit webhook endpoint
  const ip = getClientIp(request);
  const limited = rateLimit({ key: `webhook:${ip}`, ...RATE_LIMITS.webhook });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many webhook requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("Stripe webhook error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userEmail = session.metadata?.userEmail;
      const customerId = session.customer as string;

      if (userEmail && customerId) {
        try {
          const subscription = await getSubscription(customerId);
          const priceId = subscription?.items.data[0]?.price.id ?? "";
          const plan = planFromPriceId(priceId);
          await dbUpdateUserPlan(userEmail, customerId, plan);
          console.log(`[Stripe Webhook] User ${userEmail} subscribed to ${plan}`);
        } catch (err) {
          console.error("[Stripe Webhook] checkout.completed failed:", err);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      try {
        // Look up user by stripeCustomerId and downgrade to free
        const user = await dbGetUserByCustomerId(customerId);
        if (user) {
          await dbUpdateUserPlan(user.email, customerId, "free");
          console.log(`[Stripe Webhook] User ${user.email} downgraded to free`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] subscription.deleted failed:", err);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      console.log(`[Stripe Webhook] Payment failed for customer ${customerId}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
