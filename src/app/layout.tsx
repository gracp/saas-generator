import type { Metadata } from 'next';
import { ClientProviders } from '@/components/providers/client-providers';
import './globals.css';

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SaaS Generator',
  description:
    'AI researches your niche, generates the SaaS, builds the code, and deploys it. You just pick the winners.',
  url: process.env.NEXTAUTH_URL ?? 'http://localhost:3457',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available',
  },
  creator: {
    '@type': 'Organization',
    name: 'SaaS Generator',
    url: 'https://saasgenerator.ai',
  },
};

export const metadata: Metadata = {
  title: 'SaaS Generator — From Idea to Launch in Minutes',
  description:
    'AI researches your niche, generates the SaaS, builds the code, and deploys it. You just pick the winners.',
  keywords: [
    'SaaS generator',
    'AI app builder',
    'micro SaaS',
    'indie hacker tools',
    'launch faster',
    'Next.js SaaS',
  ],
  authors: [{ name: 'SaaS Generator' }],
  openGraph: {
    title: 'SaaS Generator — From Idea to Launch in Minutes',
    description: 'AI researches your niche, generates the SaaS, builds the code, and deploys it.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Generator — From Idea to Launch in Minutes',
    description: 'AI researches your niche, generates the SaaS, builds the code, and deploys it.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
