"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/lib/copy";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Database,
  Layout,
  LogIn,
  Mail,
  PieChart,
  Zap,
  BarChart3,
  ExternalLink,
  Code,
  Search,
  Sparkles,
  Rocket,
  Globe,
} from "lucide-react";

/* ─── Intersection Observer hook ──────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const targets = el.querySelectorAll(".reveal");
    targets.forEach((t) => observer.observe(t));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ─── Feature icon map ─────────────────────────────────────────────── */
const featureIcons: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-5 h-5" />,
  LogIn: <LogIn className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Mail: <Mail className="w-5 h-5" />,
  PieChart: <PieChart className="w-5 h-5" />,
};

/* ─── Nav ─────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-100">SaaS Generator</span>
        </div>
        <a
          href="#pricing"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
        >
          {copy.nav.cta}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </nav>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-24 px-4 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8 reveal">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by advanced AI
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-100 text-balance leading-[1.1] mb-6 reveal reveal-delay-1">
          {copy.hero.headline}
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 text-balance reveal reveal-delay-2">
          {copy.hero.subhead}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 reveal reveal-delay-3">
          <a
            href="#pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-violet-500 text-white font-semibold text-sm hover:bg-violet-400 transition-colors glow-violet-sm"
          >
            {copy.hero.ctaPrimary}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-zinc-700 text-zinc-300 font-medium text-sm hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
          >
            {copy.hero.ctaSecondary}
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>

        {/* Pipeline */}
        <div className="mt-20 reveal reveal-delay-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            {copy.hero.pipelineSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    {i === 0 && <Search className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />}
                    {i === 1 && <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />}
                    {i === 2 && <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />}
                    {i === 3 && <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">{step}</span>
                </div>
                {i < copy.hero.pipelineSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-zinc-700 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600">
        <span className="text-xs">scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────────────── */
function HowItWorks() {
  const sectionRef = useReveal();

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-3 reveal">
            {copy.howItWorks.heading}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 reveal reveal-delay-1">
            {copy.howItWorks.subheading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {copy.howItWorks.steps.map((step, i) => (
            <div
              key={step.number}
              className={`reveal reveal-delay-${i + 1} relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-violet-500/30 transition-colors group`}
            >
              {/* Step number */}
              <div className="text-6xl font-bold text-violet-500/10 absolute top-4 right-6 leading-none select-none">
                {step.number}
              </div>

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-500/20 transition-colors">
                  {i === 0 && <Search className="w-5 h-5 text-violet-400" />}
                  {i === 1 && <Sparkles className="w-5 h-5 text-violet-400" />}
                  {i === 2 && <Rocket className="w-5 h-5 text-violet-400" />}
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Live Examples ───────────────────────────────────────────────── */
function LiveExamples() {
  const sectionRef = useReveal();

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 px-4 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/30 to-zinc-950 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-3 reveal">
            {copy.liveExamples.heading}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 reveal reveal-delay-1">
            {copy.liveExamples.subheading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {copy.liveExamples.examples.map((example, i) => (
            <div
              key={example.name}
              className={`reveal reveal-delay-${i + 1} group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden hover:border-zinc-700 transition-all`}
            >
              {/* Mock screenshot */}
              <div className="relative h-44 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-zinc-600 text-sm font-medium">
                    {example.name}
                  </span>
                </div>
                {/* Live badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">Live</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <div className="mb-1">
                  <span className="text-xs text-violet-400 font-semibold uppercase tracking-wide">
                    {example.tagline}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {example.name}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  {example.description}
                </p>
                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-zinc-800">
                  <a
                    href={example.liveUrl}
                    className="flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Live
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={example.sourceUrl}
                    className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Source
                    <Code className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What Gets Generated ────────────────────────────────────────── */
function WhatGetsGenerated() {
  const sectionRef = useReveal();

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-3 reveal">
            {copy.whatGetsGenerated.heading}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 reveal reveal-delay-1">
            {copy.whatGetsGenerated.subheading}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {copy.whatGetsGenerated.features.map((feature, i) => (
            <div
              key={feature.title}
              className={`reveal reveal-delay-${(i % 4) + 1} p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-violet-500/20 transition-colors`}
            >
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
                {featureIcons[feature.icon]}
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">
                {feature.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ──────────────────────────────────────────────────────── */
function Pricing() {
  const sectionRef = useReveal();

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-3 reveal">
            {copy.pricing.heading}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-100 reveal reveal-delay-1">
            {copy.pricing.subheading}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {copy.pricing.tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`reveal reveal-delay-${i + 1} flex flex-col rounded-2xl border p-6 relative ${
                tier.featured
                  ? "border-violet-500/50 bg-zinc-900/90 glow-violet"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-semibold">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-zinc-100 font-semibold text-lg mb-1">
                  {tier.name}
                </h3>
                <p className="text-zinc-500 text-sm">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-100">
                    ${tier.price}
                  </span>
                  <span className="text-zinc-500 text-sm">/{tier.period}</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-zinc-400"
                  >
                    <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  tier.featured
                    ? "bg-violet-500 text-white hover:bg-violet-400"
                    : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ──────────────────────────────────────────────────────────── */
function FAQ() {
  const sectionRef = useReveal();

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 text-sm font-semibold uppercase tracking-wider mb-3 reveal">
            {copy.faq.heading}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {copy.faq.questions.map((item, i) => (
            <FAQItem
              key={i}
              question={item.q}
              answer={item.a}
              delay={(i % 3) + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
  delay,
}: {
  question: string;
  answer: string;
  delay: number;
}) {
  return (
    <details className={`reveal reveal-delay-${delay} group rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`}>
      <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none text-zinc-100 font-medium text-sm hover:text-violet-300 transition-colors select-none">
        {question}
        <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4">
        {answer}
      </div>
    </details>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────── */
function FinalCTA() {
  const sectionRef = useReveal();

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-100 text-balance mb-5 reveal">
          {copy.finalCta.headline}
        </h2>
        <p className="text-lg text-zinc-400 mb-10 reveal reveal-delay-1">
          {copy.finalCta.subheadline}
        </p>
        <div className="reveal reveal-delay-2">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-500 text-white font-semibold text-base hover:bg-violet-400 transition-colors glow-violet"
          >
            {copy.finalCta.cta}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500 flex items-center justify-center">
            <Rocket className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-zinc-500 text-sm font-medium">SaaS Generator</span>
        </div>
        <p className="text-zinc-600 text-xs">
          Built for builders who ship.
        </p>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <HowItWorks />
      <LiveExamples />
      <WhatGetsGenerated />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
