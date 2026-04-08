"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";

export function NewProjectSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!name.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: name.trim(),
          niche: niche.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOpen(false);
        setName("");
        setNiche("");
        // Refresh the page to show new project
        window.location.reload();
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button className="bg-violet-600 hover:bg-violet-700 text-white">
          <Sparkles className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-zinc-950 border-zinc-800">
        <SheetHeader>
          <SheetTitle className="text-zinc-100">
            Generate a new SaaS
          </SheetTitle>
          <SheetDescription className="text-zinc-500">
            AI will research the market, generate ideas, and build the app.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">
              Project Name
            </label>
            <Input
              placeholder="e.g., InvoicePilot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-violet-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">
              Niche (optional)
            </label>
            <Input
              placeholder="e.g., AI invoicing for freelancers"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-violet-600"
            />
            <p className="text-[10px] text-zinc-600">
              Leave blank to let AI find the best niche for you
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <p className="text-xs font-medium text-zinc-400">
                What happens next:
              </p>
              <ol className="text-[11px] text-zinc-500 space-y-1.5">
                <li>1. AI researches the market and competition</li>
                <li>2. 3 SaaS ideas generated with validation scores</li>
                <li>3. You pick your favorite idea</li>
                <li>4. GitHub repo created with MVP issues</li>
                <li>5. Specialist agents build in parallel</li>
                <li>6. Code reviewed and deployed to Vercel</li>
              </ol>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!name.trim() || loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Generation
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
