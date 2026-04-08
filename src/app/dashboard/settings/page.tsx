"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [exapiKey, setExaApiKey] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSaveEnv(key: string, value: string) {
    if (!value.trim()) return;
    setSaving(true);
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
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Configure your API keys and deployment settings.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base">API Keys</CardTitle>
          <CardDescription className="text-zinc-500">
            Keys are stored in <code className="text-zinc-300">.env.local</code> and never sent to our servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs">Exa API Key (Research)</Label>
            <p className="text-[10px] text-zinc-600 mb-1">
              Get your key at{" "}
              <a href="https://exa.ai" className="text-violet-400 hover:underline" target="_blank" rel="noopener">
                exa.ai
              </a>{" "}
              — used for Reddit + trend research
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="sk-exa-xxxx"
                value={exapiKey}
                onChange={(e) => setExaApiKey(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                onClick={() => handleSaveEnv("EXA_API_KEY", exapiKey)}
                disabled={saving || !exapiKey.trim()}
              >
                {saved.includes("EXA_API_KEY") ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : "Save"}
              </Button>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs">Vercel API Token (Deployments)</Label>
            <p className="text-[10px] text-zinc-600 mb-1">
              Get your token at{" "}
              <a href="https://vercel.com/account/tokens" className="text-violet-400 hover:underline" target="_blank" rel="noopener">
                vercel.com/account/tokens
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="xxxx"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                onClick={() => handleSaveEnv("VERCEL_API_TOKEN", vercelToken)}
                disabled={saving || !vercelToken.trim()}
              >
                {saved.includes("VERCEL_API_TOKEN") ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : "Save"}
              </Button>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs">Stripe Secret Key (Billing)</Label>
            <p className="text-[10px] text-zinc-600 mb-1">
              Get your keys at{" "}
              <a href="https://dashboard.stripe.com/apikeys" className="text-violet-400 hover:underline" target="_blank" rel="noopener">
                dashboard.stripe.com/apikeys
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="sk_live_xxxx"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-100"
              />
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                onClick={() => handleSaveEnv("STRIPE_SECRET_KEY", stripeKey)}
                disabled={saving || !stripeKey.trim()}
              >
                {saved.includes("STRIPE_SECRET_KEY") ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base">Database</CardTitle>
          <CardDescription className="text-zinc-500">
            PostgreSQL connection string for persisting projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 space-y-1">
            <p className="text-xs text-zinc-500">Recommended: Supabase PostgreSQL</p>
            <p className="text-xs text-zinc-400 font-mono">
              postgresql://user:password@host.db.supabase.co:5432/postgres
            </p>
          </div>
          <p className="text-[10px] text-zinc-600">
            Run migrations after setting DATABASE_URL:{" "}
            <code className="text-zinc-400">npx prisma migrate dev</code>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-base">Infrastructure Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {[
              { label: "Hosting", value: "Vercel (recommended)", color: "text-emerald-400" },
              { label: "Database", value: "Supabase PostgreSQL (or any Postgres)", color: "text-zinc-300" },
              { label: "AI Research", value: "Exa AI (exa.ai) — free tier available", color: "text-zinc-300" },
              { label: "Payments", value: "Stripe (test mode by default)", color: "text-zinc-300" },
              { label: "Email", value: "Resend (resend.com) — free tier", color: "text-zinc-300" },
              { label: "Domain", value: "Vercel + Cloudflare (optional)", color: "text-zinc-300" },
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
