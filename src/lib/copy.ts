export const copy = {
  meta: {
    title: "SaaS Generator — From Idea to Launch in Minutes",
    description:
      "AI researches your niche, generates the SaaS, builds the code, and deploys it. You just pick the winners.",
  },

  hero: {
    headline: "From idea to launch in minutes, not months.",
    subhead:
      "AI researches your niche, generates the SaaS, builds the code, and deploys it. You just pick the winners.",
    ctaPrimary: "Start Generating",
    ctaSecondary: "See How It Works",
    pipelineSteps: ["Research", "Generate", "Build", "Launch"],
  },

  howItWorks: {
    heading: "How it works",
    subheading: "Three steps from idea to live product.",
    steps: [
      {
        number: "01",
        title: "Pick a niche or let AI find one",
        description:
          "AI scans Reddit, HN, Product Hunt, Google Trends — identifies pain points and underserved markets. Scores niches by demand, competition, and monetization potential.",
      },
      {
        number: "02",
        title: "Generate your SaaS",
        description:
          "AI creates 5–10 ideas per niche with full specs. Domain availability check, competitor analysis included. Pick your favorite and customize the MVP scope.",
      },
      {
        number: "03",
        title: "Ship it",
        description:
          "AI generates a production-ready Next.js app. Landing page, auth, Stripe billing, core feature. Deploys to Vercel with your custom domain. You're live.",
      },
    ],
  },

  liveExamples: {
    heading: "Live examples",
    subheading: "These were generated and deployed with SaaS Generator.",
    examples: [
      {
        name: "InvoicePilot",
        tagline: "AI invoices for freelancers",
        description:
          "Generate polished, professional invoices in seconds. AI learns your style, auto-fills line items, and sends reminders so you never chase a payment again.",
        liveUrl: "#",
        sourceUrl: "#",
      },
      {
        name: "ReviewSnap",
        tagline: "Auto-respond to customer reviews",
        description:
          "Monitor all your reviews in one place. AI crafts thoughtful, brand-voice responses in seconds so you stay present without losing hours to manual replies.",
        liveUrl: "#",
        sourceUrl: "#",
      },
      {
        name: "WaitlistHero",
        tagline: "Launch waitlists in 60 seconds",
        description:
          "Stop losing early adopters while you build. Create a waitlist page, collect emails, and generate buzz before you've written a single line of product code.",
        liveUrl: "#",
        sourceUrl: "#",
      },
    ],
  },

  whatGetsGenerated: {
    heading: "What you get",
    subheading: "A fully-baked SaaS, ready for your first customers.",
    features: [
      {
        icon: "Layout",
        title: "Responsive landing page",
        description: "SEO-optimized with Open Graph, sitemap, and schema markup.",
      },
      {
        icon: "LogIn",
        title: "Authentication",
        description: "Google OAuth and email/password with secure session management.",
      },
      {
        icon: "CreditCard",
        title: "Stripe billing",
        description: "Free and paid tiers, checkout flows, webhook handling, and invoices.",
      },
      {
        icon: "Database",
        title: "Database",
        description: "Prisma ORM with PostgreSQL. Schema, migrations, and seed data.",
      },
      {
        icon: "BarChart3",
        title: "Admin dashboard",
        description: "User management, revenue metrics, and usage analytics out of the box.",
      },
      {
        icon: "Zap",
        title: "API endpoints",
        description: "RESTful routes with auth guards, rate limiting, and error handling.",
      },
      {
        icon: "Mail",
        title: "Email notifications",
        description: "Transactional email via Resend. Welcome, billing, and alert templates.",
      },
      {
        icon: "PieChart",
        title: "Analytics setup",
        description: "Vercel Analytics, PostHog events, and a pre-built dashboard.",
      },
    ],
  },

  pricing: {
    heading: "Simple pricing",
    subheading: "Start free. Scale when you're ready.",
    tiers: [
      {
        name: "Hobby",
        price: "0",
        period: "mo",
        description: "For trying things out and testing ideas.",
        features: [
          "1 project",
          "Community support",
          "Watermarked landing pages",
          "Basic niche research",
        ],
        cta: "Get started",
        featured: false,
      },
      {
        name: "Maker",
        price: "29",
        period: "mo",
        description: "For indie hackers shipping real products.",
        features: [
          "5 projects",
          "Custom domains",
          "Remove watermarks",
          "Priority support",
          "Competitor analysis",
          "Stripe billing",
        ],
        cta: "Start building",
        featured: true,
      },
      {
        name: "Studio",
        price: "99",
        period: "mo",
        description: "For teams and serious product velocity.",
        features: [
          "Unlimited projects",
          "White-label code",
          "API access",
          "Team members",
          "Custom integrations",
          "Dedicated support",
        ],
        cta: "Contact us",
        featured: false,
      },
    ],
  },

  faq: {
    heading: "FAQ",
    questions: [
      {
        q: "What kind of apps can it generate?",
        a: "SaaS Generator works best for micro-SaaS products: billing tools, productivity apps, community platforms, and data dashboards. It generates a complete Next.js app with auth, payments, and a core feature scaffold — so anything that fits that mold is a great fit.",
      },
      {
        q: "Is the generated code production-ready?",
        a: "Yes. The generated apps include proper error handling, TypeScript throughout, security headers, rate limiting, and follow Next.js and React best practices. You can deploy directly to Vercel and take on real users.",
      },
      {
        q: "Can I customize the generated app?",
        a: "Absolutely. You own 100% of the generated code. Edit anything — the UI, the business logic, the integrations. There's no lock-in and no runtime dependency on SaaS Generator after generation.",
      },
      {
        q: "What tech stack is used?",
        a: "Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma + PostgreSQL, NextAuth.js, Stripe, Resend for email, and Vercel for hosting. All battle-tested, production-grade tools.",
      },
      {
        q: "Do I own the generated code?",
        a: "Yes. You get full ownership of the code, the IP, and the deployed product. Use it commercially, modify it, resell it — no restrictions. We don't claim any rights to what you build.",
      },
      {
        q: "How long does generation take?",
        a: "Most apps generate in 60–90 seconds. Deployment to Vercel takes another 30–60 seconds. In under three minutes you have a live URL pointing at a real, working SaaS.",
      },
    ],
  },

  finalCta: {
    headline: "Stop brainstorming. Start shipping.",
    subheadline: "Your next SaaS is one click away.",
    cta: "Start generating",
  },

  nav: {
    cta: "Start generating",
  },
} as const;

export type Copy = typeof copy;
