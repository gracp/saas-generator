import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
