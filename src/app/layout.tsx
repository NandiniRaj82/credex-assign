import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StackLens — Free AI Spend Audit for Startups",
    template: "%s | StackLens",
  },
  description:
    "Find out in 2 minutes if your startup is overspending on AI tools. Free audit for Cursor, Claude, ChatGPT, GitHub Copilot, and more.",
  keywords: [
    "AI tools cost",
    "AI spend audit",
    "cursor pricing",
    "claude pricing",
    "chatgpt cost",
    "AI budget startup",
    "AI tools comparison",
    "reduce AI costs",
  ],
  authors: [{ name: "StackLens" }],
  creator: "StackLens",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://stacklens.app"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "StackLens",
    title: "StackLens — Free AI Spend Audit for Startups",
    description:
      "Find out in 2 minutes if your startup is overspending on AI tools.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "StackLens — AI Spend Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StackLens — Free AI Spend Audit",
    description: "Find out if your startup is overspending on AI tools. Free, instant, no login.",
    images: ["/og-default.png"],
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
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0a0a0f" />
      </head>
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: "var(--font-inter, var(--font-sans))" }}>
        {children}
      </body>
    </html>
  );
}
