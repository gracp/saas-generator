"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, ExternalLink, LogOut, User, AlertTriangle } from "lucide-react";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";

const PLANS = [
  {
    name: "Free",
    price: "$0/mo",
    description: "1 project",
    priceId: null,
    key: "free",
    limit: 1,
  },
  {
    name: "Hobby",
    price: "$0/mo",
    description: "1 project",
    priceId: null,
    key: "hobby",
    limit: 1,
  },
  {
    name: "Maker",
    price: "$29/mo",
    description: "5 projects",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAKER ?? "",
    key: "maker",
    limit: 5,
  },
  {
    name: "Studio",
    price: "$99/mo",
    description: "Unlimited projects",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO ?? "",
    key: "studio",
    limit: -1,
  },
];

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  stripeCustomerId: string | null;
  plan: "free" | "hobby" | "maker" | "studio";
  projects: Array<{ id: string; name: string; status: string }>;
}

export default function SettingsClient({
  user,
  stripeCustomerId,
  plan: serverPlan,
  projects,
}: SettingsClientProps) {
  const [currentPlan, setCurrentPlan] = useState(serverPlan);
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const projectCount = projects?.length ?? 0;
  const currentPlanConfig = PLANS.find((p) => p.key === currentPlan);
  const limit = currentPlanConfig?.limit ?? 1;
  const usagePercent = limit === -1 ? 0 : Math.min((projectCount / limit) * 100, 100);
  const isAtLimit = limit !== -1 && projectCount >= limit;
  const isNearLimit = limit !== -1 && usagePercent >= 80;

  async function handleSubscribe(priceId: string) {
    setLoading(priceId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to start checkout");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to open billing portal");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function handleSaveEnv(key: string, value: string) {
    if (!value.trim()) return;
    setLoading(key);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSaved((prev) => [...prev, key]);
        setTimeout(() => setSaved((prev) => prev.filter((k) => k !== key)), 3000);
      }
    } catch { /* ignore */ }
    finally { setLoading(null); }
  }

  function usageColor() {
    if (usagePercent >= 100) return "bg-red-500";
    if (usagePercent >= 80) return "bg-amber-500";
    return "bg-violet-500";
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Account */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.image ? (
                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name?.[0] ?? user.email[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-zinc-100">{user.name || "Unnamed"}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100 text-base">Subscription</CardTitle>
              <CardDescription className="text-zinc-500">
                Current plan:{" "}
                <span className="text-violet-400 font-medium capitalize">
                  {currentPlan === "free" ? "Free" : currentPlan}
                </span>
                {stripeCustomerId && (
                  <span className="ml-2 text-emerald-400/70 text-xs">✓ Billing active</span>
                )}
              </CardDescription>
            </div>
            {stripeCustomerId ? (
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
                onClick={handlePortal}
                disabled={loading === "portal"}
              >
                {loading === "portal" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                )}
                Billing Portal
              </Button>
            ) : (
              <span className="text-xs text-zinc-600">No billing account</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Usage meter */}
          {limit !== -1 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isAtLimit && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className="text-xs text-zinc-400">
                    Projects used:{" "}
                    <span
                      className={
                        usagePercent >= 100
                          ? "text-red-400 font-medium"
                          : usagePercent >= 80
                          ? "text-amber-400 font-medium"
                          : "text-zinc-200 font-medium"
                      }
                    >
                      {projectCount}/{limit}
                    </span>
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    usagePercent >= 100
                      ? "text-red-400"
                      : usagePercent >= 80
                      ? "text-amber-400"
                      : "text-zinc-400"
                  }`}
                >
                  {Math.round(usagePercent)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${usageColor()}`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* At-limit state: prompt upgrade */}
          {isAtLimit ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-center">
              <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-zinc-200 font-medium mb-1">
                Project limit reached ({limit}/{limit})
              </p>
              <p className="text-xs text-zinc-500 mb-3">
                Upgrade to Maker (5 projects) or Studio (unlimited) to continue building.
              </p>
              {PLANS.filter((p) => p.priceId).map((plan) => (
                <Button
                  key={plan.key}
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white mr-2"
                  onClick={() => plan.priceId && handleSubscribe(plan.priceId as string)}
                  disabled={!!loading}
                >
                  {loading === plan.priceId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.key}
                  className={`rounded-lg border p-4 flex flex-col gap-2 ${
                    plan.key === currentPlan
                      ? "border-violet-500 bg-violet-500/5"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm">{plan.name}</p>
                    <p className="text-lg font-bold text-zinc-100">{plan.price}</p>
                    <p className="text-xs text-zinc-500">{plan.description}</p>
                  </div>
                  {plan.key === currentPlan ? (
                    <Button
                      size="sm"
                      disabled
                      className="bg-violet-600/50 text-white border-0 w-full"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Current
                    </Button>
                  ) : plan.priceId ? (
                    <Button
                      size="sm"
                      className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={!!loading}
                    >
                      {loading === plan.priceId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Upgrade"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      variant="ghost"
                      className="text-zinc-600 w-full"
                    >
                      Free
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-400"
            >
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
            API Keys
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Configure your integrations. Keys are stored in{" "}
            <code className="text-zinc-300">.env.local</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysManager />
        </CardContent>
      </Card>

      {/* Infrastructure */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base">Infrastructure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {[
              { label: "Hosting", value: "Vercel (recommended)", color: "text-emerald-400" },
              { label: "Database", value: "Supabase PostgreSQL", color: "text-zinc-300" },
              { label: "AI Research", value: "Exa AI (exa.ai) — free tier", color: "text-zinc-300" },
              { label: "Payments", value: "Stripe", color: "text-zinc-300" },
              { label: "Email", value: "Resend (resend.com) — free tier", color: "text-zinc-300" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-zinc-500 w-24 shrink-0">{label}</span>
                <span className={color}>{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
