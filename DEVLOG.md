# DEVLOG.md — StackLens

Format: one entry per day for 7 days. All times in IST (UTC+5:30).

---

## Day 1 — 2026-05-22

**Hours worked:** 6

**What I did:**
Read the assignment brief carefully twice before writing a single line of code. Mapped out the six required features and identified what the audit engine needed to be defensible to a finance person — meaning no vague "this tool is cheaper" claims, but cited prices and specific seat math. Started with pricing research: opened every vendor pricing page tab (Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, OpenAI, Windsurf) and verified each number against official pages. Wrote `PRICING_DATA.md` first, before touching `audit-engine.ts`, because the data is the foundation. Built the entire audit engine as a pure TypeScript module — no external dependencies, fully testable. Wrote 9 tests covering the key audit scenarios. Set up vitest. Wrote the Supabase schema with RLS policies.

**What I learned:**
The audit engine's trickiest design decision was check ordering — running checks from "cheapest fix" to "most disruptive recommendation." If you recommend switching to a different tool before checking if the user is just on the wrong plan, you get false positives. The ordering matters: billing error → excess seats → min seat requirement → use-case mismatch → downgrade → cross-tool alternative → optimal.

**Blockers / what I'm stuck on:**
Supabase's free tier limit on simultaneous connections may be an issue at scale, but not blocking for now. hCaptcha integration requires a site key — will mock with honeypot-only for Day 2 and add real keys in Day 5.

**Plan for tomorrow:**
API routes (`/api/audit`, `/api/summary`, `/api/lead`), Supabase client setup, Resend email wrapper. Keep today's momentum on the backend before touching UI.

---

## Day 2 — 2026-05-23

**Hours worked:** 5.5

**What I did:**
Built all three API routes. The `/api/audit` route was straightforward — validate with Zod, run the engine, save to Supabase, return the slug. The `/api/summary` route took longer than expected — first attempt used streaming, but abandoned it after realising the 100-word output doesn't benefit from streaming enough to justify the added complexity. Wrote the Anthropic prompt and iterated three times (details in PROMPTS.md). Built the Resend email wrapper with the full HTML template. Conducted first user interview (R.K.) — his "just give me the number" feedback immediately influenced the results page layout decision. Added the `CLAUDE.md` note about checking Next.js 16 docs.

**What I learned:**
Zod v4 (which is installed) has a changed API for `.flatten()` on error objects — `error.flatten()` returns `{ fieldErrors, formErrors }` instead of just `fieldErrors`. Spent 20 minutes debugging why my error response was empty before noticing the version difference.

**Blockers / what I'm stuck on:**
The Anthropic API key isn't set yet — using fallback template for now. Will add real key when deploying.

**Plan for tomorrow:**
Start UI: landing page and the audit form. Design system first (globals.css), then components, then pages.

---

## Day 3 — 2026-05-24

**Hours worked:** 7

**What I did:**
Built the full design system in `globals.css` — CSS custom properties for all tokens, glassmorphism card style, button variants, badge variants, input states, animations. Then the landing page — spent extra time on the hero mock dashboard because it's the most-screenshotted element. The mock dashboard showing a realistic audit result was more persuasive than any copy I could write. Built the multi-step audit form with localStorage persistence — step 1 (team info) → step 2 (tools). The tool row component took multiple iterations: wanted to show the expected cost ("$40/seat for 2 seats = $80/mo") as a hint below the spend input field, which required real-time calculation from the pricing data constants. Conducted second and third user interviews (M. and A.T.). The interview with M. revealed the "justification document" use case — changed the CTA copy to "Share with your team" to reflect that.

**What I learned:**
Framer Motion's `AnimatePresence` requires the child element to have a unique `key` prop that actually changes — if you reuse the same key during the exit animation, the exit animation doesn't fire. Spent 30 minutes on this before finding it in the Framer Motion docs.

**Blockers / what I'm stuck on:**
The `@hcaptcha/react-hcaptcha` package integration on the lead form is deferred to Day 5 — don't want it blocking the results page work.

**Plan for tomorrow:**
Results page — the most important page in the app. Server-side OG tags, savings hero, per-tool cards, AI summary async load, Credex CTA, lead capture modal.

---

## Day 4 — 2026-05-25

**Hours worked:** 6

**What I did:**
Built the results page as a server component (`page.tsx`) for OG metadata + client component (`ResultsClient.tsx`) for interactivity. The savings hero animation is the detail I'm most proud of — the large number with `savings-number` animation class and the pulsing glow effect makes the dollar amount feel significant. Built all the ToolCard expandable components with Framer Motion `AnimatePresence`. Wired up the AI summary async fetch with skeleton loading states. Built the lead capture modal — email gate after value is shown, exactly as the brief requires. Added the dynamic OG image generator as an SVG API route.

**What I learned:**
Next.js 16 App Router `generateMetadata` with async params — the `params` argument is now a `Promise<{}>` in the latest version, not a plain object. This is a breaking change from what most docs still show. `const { id } = await params;` is required.

**Blockers / what I'm stuck on:**
The OG image is SVG-based — not ideal because some social platforms (particularly older Slack versions) don't render SVG OG images correctly. Would use `@vercel/og` in production, but that requires the Edge runtime. Acceptable for MVP.

**Plan for tomorrow:**
Wire up hCaptcha on the lead form, test the full end-to-end flow, write CI workflow, start on docs.

---

## Day 5 — 2026-05-26

**Hours worked:** 5

**What I did:**
Added hCaptcha integration to the lead capture modal (client-side) and verified the server-side token verification in `/api/lead`. Added the `not-found.tsx` page for invalid audit slugs. Ran the full end-to-end test: filled the audit form, submitted, watched the results page load, tested the lead capture modal, verified Supabase rows were inserted correctly. Fixed two bugs (see REFLECTION.md for details on the most interesting one). Wrote the CI workflow. Started on business documentation.

**What I learned:**
hCaptcha's React component fires `onVerify` asynchronously — you need to store the token in state and submit it with the form, not try to call verify at form submit time. The docs weren't clear on this.

**Blockers / what I'm stuck on:**
Still need real API keys for full E2E testing. Current test: Supabase and Resend with test credentials, Anthropic with fallback template.

**Plan for tomorrow:**
Finish all documentation files. Start writing REFLECTION.md and DEVLOG entries while they're fresh.

---

## Day 6 — 2026-05-27

**Hours worked:** 6

**What I did:**
Wrote ARCHITECTURE.md with the full Mermaid diagram and data flow documentation. Wrote PRICING_DATA.md with all verified sources. Wrote PROMPTS.md with full prompt and iteration notes. Wrote TESTS.md. Ran all tests — 17 passing, 0 failing. Ran `npm run lint` — clean. Ran `npm run build` — clean TypeScript compile. Started writing REFLECTION.md (the hardest doc to write well — tried to be specific and honest rather than generic). Pushed to GitHub, confirmed CI workflow runs green.

**What I learned:**
TypeScript strict mode catches a surprising number of edge cases in the audit engine — the `| undefined` handling for `getNextLowerPlan()` return value required explicit null checks that forced me to add a guard in `checkDowngrade()` that I'd missed. The type system found a real bug.

**Blockers / what I'm stuck on:**
REFLECTION.md question 3 (week 2 build) requires genuine thinking about what the product needs, not just listing features. Resisting the urge to just copy the bonus list from the assignment.

**Plan for tomorrow:**
Finish REFLECTION.md. Write GTM.md, ECONOMICS.md, USER_INTERVIEWS.md, LANDING_COPY.md, METRICS.md. Final README. Deploy to Vercel. Run Lighthouse audit. Polish pass.

---

## Day 7 — 2026-05-28

**Hours worked:** 7

**What I did:**
Finished all documentation files. Wrote the final README with screenshots (taken from the running app). Deployed to Vercel — required adding environment variables via Vercel dashboard. Connected Supabase project. Ran Lighthouse on the deployed URL: Performance 91, Accessibility 94, Best Practices 95. Fixed one accessibility issue found by Lighthouse (missing `aria-label` on the share button icon). Added `@keyframes spin` to globals.css for the loading spinner (had been missing). Final push — confirmed CI is green on GitHub. Tagged the repo `v1.0.0`.

**What I learned:**
Vercel's build process inlines environment variables at build time for `NEXT_PUBLIC_*` vars — any change to these requires a redeploy, not just a restart. Learned this when the app URL in OG tags was wrong on first deploy.

**Blockers / what I'm stuck on:**
None — shipped.
