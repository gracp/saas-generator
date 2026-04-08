import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set in environment");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true });
  }
  return _stripe;
}

export const stripe = {
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
};

// ─── Price IDs from env ─────────────────────────────────
export const PLANS = {
  maker: process.env.STRIPE_PRICE_MAKER ?? "",
  studio: process.env.STRIPE_PRICE_STUDIO ?? "",
} as const;

// ─── Checkout ───────────────────────────────────────────
export async function createCheckoutSession({
  priceId,
  userId,
  userEmail,
  returnUrl,
}: {
  priceId: string;
  userId: string;
  userEmail: string;
  returnUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: userEmail,
    metadata: { userId, userEmail },
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
  });
  return session;
}

// ─── Customer Portal ────────────────────────────────────
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}

// ─── Webhook signature verification ─────────────────────
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

// ─── Get subscription from Stripe ─────────────────────
export async function getSubscription(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });
  return subscriptions.data[0] ?? null;
}

// ─── Determine plan from price ID ───────────────────────
export function planFromPriceId(priceId: string): "free" | "maker" | "studio" {
  if (priceId === process.env.STRIPE_PRICE_MAKER) return "maker";
  if (priceId === process.env.STRIPE_PRICE_STUDIO) return "studio";
  return "free";
}
