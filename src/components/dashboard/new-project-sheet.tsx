'use client';

import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { GeneratedIdea } from '@/lib/projects';

export function NewProjectSheet({
  open: controlledOpen,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function setOpen(v: boolean) {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  }
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[] | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedIdeaIdx, setSelectedIdeaIdx] = useState<number | null>(null);
  const [selecting, setSelecting] = useState(false);
  const { toast } = useToast();
  const [generationStep, setGenerationStep] = useState(0);
  const [showIdeaCelebration, setShowIdeaCelebration] = useState(false);

  async function handleGenerate() {
    if (!name.trim()) return;
    setLoading(true);
    setIdeas(null);
    setGenerationStep(1);

    // Cycle through steps to show progress
    const stepInterval = setInterval(() => {
      setGenerationStep((s) => Math.min(s + 1, 3));
    }, 4000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: name.trim(),
          niche: niche.trim() || undefined,
        }),
      });

      clearInterval(stepInterval);
      setGenerationStep(4);

      const data = await res.json();
      if (data.success && data.ideas) {
        setIdeas(data.ideas);
        setProjectId(data.project?.id ?? null);
      } else {
        toast(data.error ?? 'Generation failed', 'error');
        setLoading(false);
        setGenerationStep(0);
      }
    } catch {
      clearInterval(stepInterval);
      toast('Network error — please try again', 'error');
      setLoading(false);
      setGenerationStep(0);
    }
  }

  async function handleSelectIdea(idx: number) {
    if (!projectId) return;
    setSelectedIdeaIdx(idx);
    setSelecting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select-idea', ideaIndex: idx }),
      });
      const data = await res.json();
      if (data.success) {
        setShowIdeaCelebration(true);
        setOpen(false);
        setName('');
        setNiche('');
        setIdeas(null);
        setProjectId(null);
        setSelectedIdeaIdx(null);
        setTimeout(() => {
          setShowIdeaCelebration(false);
          router.push(`/dashboard/${projectId}`);
        }, 1500);
      } else {
        toast(data.error ?? 'Failed to start build', 'error');
      }
    } catch {
      toast('Network error — please try again', 'error');
    } finally {
      setSelecting(false);
      setSelectedIdeaIdx(null);
    }
  }

  function handleClose() {
    setOpen(false);
    setLoading(false);
    setIdeas(null);
    setProjectId(null);
    setSelectedIdeaIdx(null);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose();
        }
        setOpen(v);
      }}
    >
      <SheetTrigger>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold cursor-pointer">
          <Sparkles className="h-4 w-4" />
          New Project
        </span>
      </SheetTrigger>
      <SheetContent className="bg-zinc-950 border-zinc-800 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-zinc-100">
            {ideas ? 'Choose your idea' : 'Generate a new SaaS'}
          </SheetTitle>
          <SheetDescription className="text-zinc-500">
            {ideas
              ? 'Pick the idea you like best — agents will start building immediately.'
              : 'AI will research the market, generate ideas, and build the app.'}
          </SheetDescription>
        </SheetHeader>

        {!ideas ? (
          // ─── Step 1: Enter project name ───
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Project Name</label>
              <Input
                placeholder="e.g., InvoicePilot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-violet-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Niche (optional)</label>
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
                <p className="text-xs font-medium text-zinc-400">What happens next:</p>
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
                  {generationStep === 1
                    ? 'Starting...'
                    : generationStep === 2
                      ? 'Researching market...'
                      : generationStep === 3
                        ? 'Generating ideas...'
                        : 'Finalizing...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Generation
                </>
              )}
            </Button>

            {/* Progress stepper */}
            {loading && (
              <div className="mt-4 space-y-1.5">
                {[
                  { step: 1, label: 'Initializing project' },
                  { step: 2, label: 'Researching market & competitors' },
                  { step: 3, label: 'Generating SaaS ideas' },
                ].map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                        generationStep >= step ? 'bg-violet-500' : 'bg-zinc-700'
                      }`}
                    />
                    <span
                      className={`text-[11px] transition-colors ${
                        generationStep >= step ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {label}
                    </span>
                    {generationStep === step && (
                      <Loader2 className="h-2.5 w-2.5 animate-spin text-violet-500 ml-auto" />
                    )}
                  </div>
                ))}
                <p className="text-[10px] text-zinc-600 mt-2">
                  This takes 30–120 seconds. Grab a coffee! ☕
                </p>
              </div>
            )}
          </div>
        ) : (
          // ─── Step 2: Pick an idea ───
          <div className="mt-8 space-y-4">
            <p className="text-xs text-zinc-400">
              Found {ideas.length} ideas for <span className="text-zinc-200">{name}</span>:
            </p>
            {ideas.map((idea, i) => (
              <button
                key={i}
                onClick={() => handleSelectIdea(i)}
                disabled={selecting}
                className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-violet-600 transition-colors disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-100 text-sm">{idea.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{idea.tagline}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{idea.monetization}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`text-xs font-bold ${
                        idea.validationScore >= 80
                          ? 'text-emerald-400'
                          : idea.validationScore >= 65
                            ? 'text-amber-400'
                            : 'text-zinc-500'
                      }`}
                    >
                      {idea.validationScore}
                    </span>
                    <p className="text-[10px] text-zinc-600">score</p>
                  </div>
                </div>
                {selectedIdeaIdx === i && (
                  <div className="mt-2 flex items-center gap-1 text-violet-400 text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Starting build...
                  </div>
                )}
              </button>
            ))}

            <button
              onClick={handleClose}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 py-2"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Idea selection celebration overlay */}
        {showIdeaCelebration && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center z-10 animate-in fade-in duration-200">
            <div className="text-5xl mb-4 animate-bounce">🚀</div>
            <p className="text-zinc-100 font-semibold text-sm">Building your SaaS!</p>
            <p className="text-zinc-500 text-xs mt-1">Redirecting to your project...</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
