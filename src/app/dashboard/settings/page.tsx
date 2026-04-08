"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";

const PLANS = [
  { name: "Hobby", price: "$0/mo", description: "1 project", priceId: null },
  { name: "Maker", price: "$29/mo", description: "5 projects", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAKER ?? "" },
  { name: "Studio", price: "$99/mo", description: "Unlimited projects", priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO ?? "" },
];

export default function SettingsPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account, billing, and integrations.</p>
      </div>

      {/* Subscription */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100 text-base">Subscription</CardTitle>
              <CardDescription className="text-zinc-500">
                Current plan: <span className="text-violet-400 font-medium capitalize">{currentPlan}</span>
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
              onClick={() => window.open("https://billing.stripe.com", "_blank")}
            >
              <ExternalLink className="h-3 w-3 mr-1.5" />
              Stripe Portal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg border p-4 flex flex-col gap-2 ${
                  plan.name.toLowerCase() === currentPlan
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <div>
                  <p className="font-semibold text-zinc-100 text-sm">{plan.name}</p>
                  <p className="text-lg font-bold text-zinc-100">{plan.price}</p>
                  <p className="text-xs text-zinc-500">{plan.description}</p>
                </div>
                {plan.name.toLowerCase() === currentPlan ? (
                  <Button size="sm" disabled className="bg-violet-600/50 text-white border-0 w-full">
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
                    ) : plan.price === "$0/mo" ? (
                      "Downgrade"
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                ) : (
                  <Button size="sm" disabled variant="ghost" className="text-zinc-600 w-full">
                    Free
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base">API Keys</CardTitle>
          <CardDescription className="text-zinc-500">
            Configure your integrations. Keys are stored in <code className="text-zinc-300">.env.local</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "EXA_API_KEY", label: "Exa API Key (Research)", placeholder: "sk-exa-xxxx", help: "exa.ai" },
            { key: "VERCEL_API_TOKEN", label: "Vercel API Token", placeholder: "xxxx", help: "vercel.com/account/tokens" },
            { key: "RESEND_API_KEY", label: "Resend API Key (Email)", placeholder: "re_xxxx", help: "resend.com" },
          ].map(({ key, label, placeholder, help }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">{label}</Label>
              <p className="text-[10px] text-zinc-600">Get your key at {help}</p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={placeholder}
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  onChange={(e) => { /* TODO: local state */ void 0; }}
                />
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                  onClick={() => {
                    const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
                    if (input) handleSaveEnv(key, input.value);
                  }}
                  disabled={!!loading}
                >
                  {saved.includes(key) ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : "Save"}
                </Button>
              </div>
            </div>
          ))}
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
