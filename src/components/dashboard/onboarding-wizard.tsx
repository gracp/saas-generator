"use client";

import { useState } from "react";
import { Sparkles, Rocket, CheckCircle2, ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
  selectedNiche?: string;
}

const NICHE_CARDS = [
  { emoji: "🚀", label: "SaaS", value: "saas", trending: true },
  { emoji: "📝", label: "Productivity", value: "productivity", trending: false },
  { emoji: "💰", label: "Finance", value: "finance", trending: false },
  { emoji: "🎨", label: "Design", value: "design", trending: false },
  { emoji: "📱", label: "Mobile", value: "mobile", trending: false },
  { emoji: "🤖", label: "AI", value: "ai", trending: true },
];

const SAMPLE_IDEAS: Record<string, { name: string; tagline: string; score: string }[]> = {
  saas: [
    { name: "CodeFlow", tagline: "AI-powered code review for dev teams", score: "94" },
    { name: "Meetly", tagline: "Smart scheduling that actually works", score: "89" },
    { name: "Stackwise", tagline: "Track your tech stack dependencies", score: "87" },
  ],
  ai: [
    { name: "PromptBase", tagline: "Marketplace for AI prompts", score: "92" },
    { name: "AIWriter Pro", tagline: "Long-form content generation", score: "88" },
    { name: "ImageAI Studio", tagline: "Custom image generation for brands", score: "91" },
  ],
  productivity: [
    { name: "FocusTimer", tagline: "Pomodoro with team sync", score: "86" },
    { name: "NoteFlow", tagline: "Notes that connect themselves", score: "84" },
    { name: "TaskMap", tagline: "Visual task management", score: "82" },
  ],
  finance: [
    { name: "Spendly", tagline: "Track expenses with AI insights", score: "90" },
    { name: "InvoiceAI", tagline: "Smart invoicing for freelancers", score: "85" },
    { name: "BudgetFlow", tagline: "Automated budget planning", score: "83" },
  ],
  design: [
    { name: "ColorAI", tagline: "AI color palette generator", score: "88" },
    { name: "MockupMagic", tagline: "Instant design mockups", score: "86" },
    { name: "FontPair", tagline: "AI font pairing assistant", score: "84" },
  ],
  mobile: [
    { name: "FitTrack AI", tagline: "Personalized fitness plans", score: "89" },
    { name: "MealSnap", tagline: "Track meals by photo", score: "87" },
    { name: "SleepWise", tagline: "Sleep quality analyzer", score: "85" },
  ],
};

export function OnboardingWizard({ onComplete, onSkip, selectedNiche = "saas" }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedNicheState, setSelectedNicheState] = useState(selectedNiche);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);

  const goNext = () => {
    if (step < 3) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        if (step === 1) {
          setShowIdeas(true);
        }
        setIsAnimating(false);
      }, 200);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = () => {
    trackEvent("onboarding_completed", { niche: selectedNicheState });
    fetch("/api/onboarding/complete", { method: "POST" })
      .then(() => onComplete())
      .catch(() => onComplete());
  };

  const sampleIdeas = SAMPLE_IDEAS[selectedNicheState] || SAMPLE_IDEAS.saas;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onSkip} />

      {/* Modal */}
      <div
        className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 transition-all duration-200 ${
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-violet-500"
                  : s < step
                  ? "w-2 bg-violet-500"
                  : "w-2 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Step 1 - Pick your niche */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 mb-4">
                  <Sparkles className="h-6 w-6 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-100">Pick your niche</h2>
                <p className="text-sm text-zinc-400">
                  Choose the category that best fits your SaaS idea
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {NICHE_CARDS.map((niche) => (
                  <button
                    key={niche.value}
                    onClick={() => setSelectedNicheState(niche.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                      selectedNicheState === niche.value
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                    }`}
                  >
                    {niche.trending && (
                      <span className="absolute top-2 right-2 text-[10px] font-medium text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        Popular
                      </span>
                    )}
                    <span className="text-2xl">{niche.emoji}</span>
                    <span className="text-sm font-medium text-zinc-200">{niche.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" size="sm" onClick={onSkip}>
                  Skip
                </Button>
                <Button
                  onClick={goNext}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 - See what you'll build */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/10 mb-4">
                  <Sparkles className="h-6 w-6 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-100">Here&apos;s what we&apos;ll build for you</h2>
                <p className="text-sm text-zinc-400">
                  Based on your <span className="text-violet-400 font-medium">{NICHE_CARDS.find(n => n.value === selectedNicheState)?.label}</span> niche
                </p>
              </div>

              <div className="space-y-3">
                {sampleIdeas.map((idea, i) => (
                  <div
                    key={idea.name}
                    className={`flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-800/50 transition-all duration-300 ${
                      showIdeas ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <div>
                      <h3 className="font-medium text-zinc-100">{idea.name}</h3>
                      <p className="text-xs text-zinc-400">{idea.tagline}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="text-xs font-medium">{idea.score}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={goNext}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 - Deploy */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-4 py-4">
                {/* Rocket illustration */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full" />
                  <div className="relative flex items-center justify-center w-full h-full">
                    <Rocket className="h-16 w-16 text-violet-400" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-zinc-100">Ready to launch your SaaS empire?</h2>
                <p className="text-sm text-zinc-400">
                  You&apos;re minutes away from having your own AI-powered SaaS application
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" size="sm" onClick={goBack}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Start Building — It&apos;s Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
