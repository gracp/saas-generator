import { PostHog } from "posthog-js";

let posthog: PostHog | null = null;

export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // No-op if no key configured

  posthog = new PostHog();
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    capture_pageview: true,
    persistence: "localStorage+cookie",
  });
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  posthog?.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  posthog?.identify(userId, traits);
}

export function resetAnalytics() {
  posthog?.reset();
}
