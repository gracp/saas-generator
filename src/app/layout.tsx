import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "SaaS Generator — From Idea to Launch in Minutes",
  description:
    "AI researches your niche, generates the SaaS, builds the code, and deploys it. You just pick the winners.",
  keywords: [
    "SaaS generator",
    "AI app builder",
    "micro SaaS",
    "indie hacker tools",
    "launch faster",
    "Next.js SaaS",
  ],
  authors: [{ name: "SaaS Generator" }],
  openGraph: {
    title: "SaaS Generator — From Idea to Launch in Minutes",
    description:
      "AI researches your niche, generates the SaaS, builds the code, and deploys it.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Generator — From Idea to Launch in Minutes",
    description:
      "AI researches your niche, generates the SaaS, builds the code, and deploys it.",
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
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
