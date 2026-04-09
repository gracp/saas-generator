'use client';

import { ArrowRight, Check, Loader2, Rocket, Zap, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((data) => {
        if (data.count) setCount(data.count);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage(data.message ?? 'You are on the list!');
        setCount((c) => (c !== null ? c + 1 : c));
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-zinc-900 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-100">SaaS Generator</span>
          </div>
          <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to home
          </a>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Early access — limited spots
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 text-balance mb-4 leading-tight">
            Your SaaS idea deserves a head start.
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 mb-8 text-balance max-w-lg mx-auto">
            Join the waitlist and be first to access AI-powered app generation. Pick a niche. Watch
            it build itself. Ship before dinner.
          </p>

          {/* Count */}
          {count !== null && (
            <div className="flex items-center justify-center gap-2 mb-10">
              <div className="flex -space-x-2">
                {['M', 'P', 'J', 'K', 'R'].map((initial, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-violet-600 border-2 border-zinc-950 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-sm text-zinc-500">
                <span className="text-zinc-300 font-semibold">{count.toLocaleString()}+</span>{' '}
                makers already waiting
              </span>
            </div>
          )}

          {/* Form */}
          {status !== 'success' ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Join waitlist
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-3 mb-8 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-zinc-100 font-semibold text-sm">{message}</p>
              <p className="text-zinc-500 text-xs">
                We will email you when your spot is ready. No spam, ever.
              </p>
            </div>
          )}

          {status === 'error' && <p className="text-red-400 text-xs mb-4">{message}</p>}

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              {
                icon: <Zap className="w-4 h-4 text-violet-400" />,
                title: 'First access',
                desc: 'Be among the first to use every new feature we ship',
              },
              {
                icon: <TrendingUp className="w-4 h-4 text-violet-400" />,
                title: 'Beta pricing',
                desc: 'Lock in 40% off Maker plan for life as an early supporter',
              },
              {
                icon: <Users className="w-4 h-4 text-violet-400" />,
                title: 'Private community',
                desc: 'Join a channel of makers sharing what is working',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  {icon}
                </div>
                <p className="text-zinc-100 text-xs font-semibold mb-1">{title}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-6 px-4 text-center">
        <p className="text-zinc-600 text-xs">
          No credit card required · Cancel anytime · Built with ⚡ by SaaS Generator
        </p>
      </footer>
    </main>
  );
}
