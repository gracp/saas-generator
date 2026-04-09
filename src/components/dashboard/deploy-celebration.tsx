'use client';

import confetti from 'canvas-confetti';
import { CheckCircle2, ExternalLink, Share2, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DeployCelebrationProps {
  projectName: string;
  vercelUrl: string;
  githubUrl?: string;
  onDismiss: () => void;
}

export function DeployCelebration({
  projectName,
  vercelUrl,
  githubUrl,
  onDismiss,
}: DeployCelebrationProps) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    requestAnimationFrame(() => setVisible(true));

    // Trigger confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(vercelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `🎉 My SaaS "${projectName}" just went live! Built with @saasgenerator`
    );
    const url = encodeURIComponent(vercelUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(vercelUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-300 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        className={`
          relative w-full max-w-md mx-4
          bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl
          overflow-hidden
          transition-all duration-300 ease-out
          ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* Confetti accent strip */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        <div className="p-8 text-center space-y-6">
          {/* Animated checkmark */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-emerald-500/10 rounded-full p-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-[spin_3s_linear_infinite] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">🎉 {projectName} is live!</h2>
            <p className="text-zinc-400 text-sm">Your SaaS has been successfully deployed</p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <a
              href={vercelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-sm">{vercelUrl}</span>
            </a>

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-sm">View on GitHub</span>
              </a>
            )}
          </div>

          {/* Share buttons */}
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Share the news</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-md transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>

              <button
                onClick={handleTwitterShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-md transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>

              <button
                onClick={handleLinkedInShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-md transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                LinkedIn
              </button>
            </div>
          </div>

          {/* Badge */}
          <div className="pt-2">
            <p className="text-xs text-zinc-600">Built with SaaS Generator</p>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
