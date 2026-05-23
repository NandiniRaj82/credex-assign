import { NextRequest, NextResponse } from "next/server";

/**
 * Dynamic OG image for shareable audit URLs.
 * Returns a simple HTML-based image placeholder.
 * For production: use @vercel/og for proper image generation.
 *
 * Usage: /api/og?id=abc123&savings=1340
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const savings = searchParams.get("savings") ?? "0";
  const savingsNum = parseInt(savings);

  // SVG-based OG image (works without @vercel/og dependency)
  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#10d9a0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Grid lines (decorative) -->
  ${Array.from({ length: 8 }, (_, i) => `<line x1="${i * 160}" y1="0" x2="${i * 160}" y2="630" stroke="#1e1e2e" stroke-width="1" />`).join("")}
  ${Array.from({ length: 5 }, (_, i) => `<line x1="0" y1="${i * 140}" x2="1200" y2="${i * 140}" stroke="#1e1e2e" stroke-width="1" />`).join("")}

  <!-- Logo area -->
  <rect x="80" y="64" width="40" height="40" rx="10" fill="url(#accent)" />
  <text x="108" y="90" font-family="system-ui, sans-serif" font-size="24" font-weight="900" fill="#000" text-anchor="middle">S</text>
  <text x="134" y="90" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#f0f0f8">StackLens</text>

  <!-- Main content -->
  <text x="80" y="220" font-family="system-ui, sans-serif" font-size="20" fill="#a1a1b5" font-weight="500">AI Spend Audit Results</text>

  ${savingsNum > 0 ? `
  <!-- Savings display -->
  <text x="80" y="340" font-family="system-ui, sans-serif" font-size="100" font-weight="900" fill="url(#accent)">$${savingsNum.toFixed(0)}</text>
  <text x="80" y="400" font-family="system-ui, sans-serif" font-size="28" fill="#a1a1b5">per month in recoverable AI spend</text>
  <text x="80" y="448" font-family="system-ui, sans-serif" font-size="22" fill="#4a4a6a">= $${(savingsNum * 12).toFixed(0)}/year</text>
  ` : `
  <!-- Optimal display -->
  <text x="80" y="340" font-family="system-ui, sans-serif" font-size="60" font-weight="900" fill="url(#accent)">Spending well ✓</text>
  <text x="80" y="400" font-family="system-ui, sans-serif" font-size="28" fill="#a1a1b5">AI stack is optimised for current usage</text>
  `}

  <!-- Bottom bar -->
  <rect x="0" y="565" width="1200" height="65" fill="#111118" />
  <text x="80" y="607" font-family="system-ui, sans-serif" font-size="18" fill="#4a4a6a">stacklens.app</text>
  <text x="1120" y="607" font-family="system-ui, sans-serif" font-size="18" fill="#4a4a6a" text-anchor="end">Free AI spend audit for startups</text>
  <rect x="76" y="540" width="${Math.min(savingsNum / 20, 1048)}" height="6" rx="3" fill="url(#accent)" />
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
