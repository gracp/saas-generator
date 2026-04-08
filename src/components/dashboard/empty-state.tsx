"use client";

import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="relative max-w-lg w-full text-center px-4">
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute w-64 h-64 rounded-full bg-violet-600/5 blur-2xl" />
        </div>

        {/* Rocket illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Glow behind rocket */}
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full scale-75" />
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-violet-600/10 border border-violet-500/20">
                <Rocket className="h-10 w-10 text-violet-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-bold text-zinc-100 mb-3">
          Your SaaS empire starts here
        </h2>

        {/* Subheadline */}
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          Generate your first AI-powered SaaS application in minutes
        </p>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={onCreateProject}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create your first SaaS
          </Button>

          {/* Secondary text */}
          <p className="text-xs text-zinc-500">
            Browse examples below to see what you can build
          </p>
        </div>

        {/* Decorative dots pattern */}
        <div className="mt-12 flex justify-center gap-2 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
