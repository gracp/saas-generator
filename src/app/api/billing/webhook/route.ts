import { NextResponse } from "next/server";
import {
  constructWebhookEvent,
  planFromPriceId,
  getSubscription,
  isEventProcessed,
  markEventProcessed,
  cleanupProcessedEvents,
} from "@/lib/stripe-app";
import { dbUpdateUserPlan, dbGetUserByCustomerId } from "@/lib/db";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import type Stripe from "stripe";

function logWebhook(type: string, status: "processed" | "duplicate" | "error" | "verified_failed", detail?: string) {
  const base = `[Webhook] type=${type} status=${status}`;
  if (detail) console.log(`${base} detail="${detail}"`);
  else console.log(base);
}

// POST /api/billing/webhook — handle Stripe webhook events
export async function POST(request: Request) {
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
    logWebhook("unknown", "error", "missing_signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    // Sanitize — never expose raw error to Stripe or logs
    const safeErr = err instanceof Error ? err.message : "unknown";
    logWebhook("unknown", "error", "verification_failed");
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  // Idempotency check
  if (isEventProcessed(event.id)) {
    logWebhook(event.type, "duplicate", event.id);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Cleanup old events periodically (every ~100 requests this will run)
  if (Math.random() < 0.01) {
    cleanupProcessedEvents();
  }

  try {
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
            logWebhook(event.type, "processed", `${userEmail}->${plan}`);
          } catch (err) {
            logWebhook(event.type, "error", `checkout.completed_failed: ${err instanceof Error ? err.message : "unknown"}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
          const user = await dbGetUserByCustomerId(customerId);
          if (user) {
            await dbUpdateUserPlan(user.email, customerId, "free");
            logWebhook(event.type, "processed", `${user.email}->free`);
          }
        } catch (err) {
          logWebhook(event.type, "error", `subscription_deleted_failed: ${err instanceof Error ? err.message : "unknown"}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        logWebhook(event.type, "processed", `customer=${customerId}`);
        break;
      }

      default:
        logWebhook(event.type, "processed", "unhandled_event_type");
        break;
    }
  } catch (err) {
    logWebhook(event.type, "error", `handler_failed: ${err instanceof Error ? err.message : "unknown"}`);
  }

  markEventProcessed(event.id);
  return NextResponse.json({ received: true });
}
