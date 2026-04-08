import { NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe-app";
import type Stripe from "stripe";

// POST /api/billing/webhook — handle Stripe webhook events
export async function POST(request: Request) {
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

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const customerId = session.customer as string;

      if (userId && customerId) {
        // TODO: In DB — update user record with customerId and subscription status
        console.log(`[Stripe Webhook] checkout.completed: user=${userId} customer=${customerId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // TODO: In DB — mark user's subscription as cancelled
      console.log(`[Stripe Webhook] subscription.deleted: customer=${customerId}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // TODO: In DB — mark user's subscription as past_due
      console.log(`[Stripe Webhook] invoice.payment_failed: customer=${customerId}`);
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
