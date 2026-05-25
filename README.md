# StackLens — AI Spend Audit for Startups

StackLens is a free web app that audits your startup's AI tool subscriptions — Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, and more — and tells you exactly where you're overspending, what to switch or downgrade, and how much you'll save. Every recommendation cites official pricing and has a finance-literate reason. No login required to see your audit.

Built as a lead-generation tool for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits for startups with significant savings opportunities.

---

## Live Demo

🔗 **[https://stacklens.vercel.app](https://stacklens.vercel.app)** *(update after deploy)*

---


## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- Optional: Anthropic API key, Resend API key, hCaptcha keys

### Install & Run Locally

```bash
git clone https://github.com/your-username/stacklens
cd stacklens

npm install

# Copy and fill in your environment variables
cp .env.example .env.local
# Edit .env.local with your keys

npm run dev
# Open http://localhost:3000
```

### Run Tests

```bash
npm test
# Expected: 17 passing tests, 0 failing
```

### Run Lint

```bash
npm run lint
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Add environment variables in the Vercel dashboard:
# Settings → Environment Variables → add all from .env.example
```

### Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → run `supabase/schema.sql`
3. Copy your project URL and keys to `.env.local`

---

## Decisions

Five trade-offs made and why:

1. **Pure-function audit engine, no AI for the math.** AI halluccinates pricing data. A deterministic function with cited prices is trustworthy enough that a finance person agrees with it. AI is only used for the narrative summary — where variation is fine. This also makes the engine fully unit-testable, which matters when real money is at stake.

2. **Next.js 16 App Router over a plain React SPA.** The shareable URL feature requires server-side OG metadata generation per audit URL. App Router's `generateMetadata` function does this natively without an additional SSR server. An SPA would generate identical OG tags on every results URL, breaking the viral loop.

3. **Supabase over Firebase.** The "audit publicly readable, leads private" access pattern is cleaner in Postgres with row-level security than in Firestore's document model. RLS is enforced at the database layer — not just at the API layer — which is the right level of trust for financial data.

4. **Windsurf as the 8th tool (over v0).** Windsurf is a direct Cursor competitor with a public pricing page and a clear feature comparison. v0 is a UI generation tool — a different category. The cross-tool comparison logic is richer with two coding IDEs in the dataset.

5. **Email after value shown, never before.** This is the correct product decision for a trust-building B2B tool (and it's required by the assignment). The email gate opens *after* the user has seen their savings number — at the point they've already decided this is useful. Gating before value is shown kills the audit completion rate and signals low confidence in the product.

---

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + custom design system
- **Database:** Supabase (Postgres + RLS)
- **AI:** Anthropic claude-haiku-4-5 (summary only)
- **Email:** Resend
- **Abuse protection:** hCaptcha + honeypot field
- **Animations:** Framer Motion
- **Tests:** Vitest
- **Deploy:** Vercel
- **CI:** GitHub Actions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system diagram and stack justification.
