# REFLECTION.md — StackLens

---

## 1. The Hardest Bug I Hit This Week

On Day 5, after wiring up the end-to-end flow, the results page was loading correctly but the AI summary was always returning the fallback template — even though my Anthropic API key was set. The network tab showed a 200 response from `/api/summary`, but the body contained the fallback text every time.

My first hypothesis was the API key wasn't being read in the API route environment. I added a `console.log` of `process.env.ANTHROPIC_API_KEY?.slice(0, 10)` to the route — it was `undefined`. But the `.env.local` file had the key. I checked the file encoding, checked for invisible characters, re-copied the key. Still undefined.

Second hypothesis: the variable name was wrong. Compared against the Anthropic SDK docs — no, `ANTHROPIC_API_KEY` is the standard name and the SDK reads it automatically. But wait — the SDK reads it automatically, which means I didn't need to pass `apiKey: process.env.ANTHROPIC_API_KEY` explicitly in the constructor. When I did pass it and it was undefined, the SDK received `apiKey: undefined` and initialised in a broken state rather than falling back to the environment lookup.

The fix: remove the explicit `apiKey` parameter from the Anthropic constructor — let the SDK pick it up automatically from the environment. I'd been explicitly passing it as a guard against "forgetting to set the env var," which ironically broke the exact scenario it was meant to protect against.

The lesson: when a library has convention-over-configuration for secrets, fight the urge to be explicit. The SDK's built-in env lookup is more robust than manually passing `process.env.X` because the SDK handles undefined safely; passing undefined explicitly is not the same as not passing the argument at all.

---

## 2. A Decision I Reversed Mid-Week

I initially built the results page so the per-tool breakdown came first and the total savings hero number came at the bottom — "show your work, then show the answer." The reasoning was that it felt more trustworthy: see all the individual recommendations, then the total makes sense.

After the R.K. interview on Day 2 (he said: *"if I could see one number — here's what you're wasting — that's all I'd need"*), I reversed it. Total savings hero at the top, breakdown expandable below.

The reversal was uncomfortable because my original rationale wasn't wrong — showing the reasoning first does build trust. But it was optimising for the wrong user. The person who wants to verify the math will scroll down and expand the tool cards. The person who just needs the number to take action will bounce if they don't see it immediately. The majority are the second type.

There's a UX principle here: lead with the output, let the curious dig into the input. The expandable tool card design (collapsed by default, click to expand reasoning) is a direct consequence of this reversal — it gives both users what they need without forcing either to wade through what they don't.

---

## 3. What I Would Build in Week 2

The honest answer, based on what I observed during user interviews and what felt incomplete after shipping:

**Priority 1: Benchmark mode.** A.T.'s quote — *"I don't know if my spend is high or low compared to teams like mine"* — points at the most emotionally resonant missing feature. Showing "your AI spend per developer is $X — the median for {use_case} teams your size is $Y" gives users a reference point that makes the savings number feel real. This requires building a simple aggregation layer over the audit results stored in Supabase, which I already have the data for.

**Priority 2: Proper OG image generation.** The SVG-based OG image works, but it renders incorrectly in some Slack/Discord clients. The shareable URL is the viral loop — if the preview card looks broken, the loop is broken. Would implement using `@vercel/og` with proper font rendering.

**Priority 3: Referral codes.** Each high-value lead who books a Credex consultation should get a unique referral code they can share. When someone else completes an audit via their link and converts, both parties get a perk (credit discount, or unlocking the PDF export). This turns satisfied customers into a distribution channel.

**Priority 4: PDF export.** Multiple interview subjects mentioned wanting to send the audit to someone. Email report helps, but a branded PDF they can attach to a Slack message or Google Doc is a more flexible format. Would use a headless browser approach (Playwright) or a PDF generation library.

---

## 4. How I Used AI Tools

**Tools used:** Claude (primary), Copilot (secondary for boilerplate).

**For what:** I used Claude to help draft the boilerplate API route structure, talk through the audit engine check ordering, and review my Zod schema for edge cases I might have missed. Copilot handled autocomplete for repetitive patterns (e.g., error handling blocks, Tailwind className patterns).

**What I didn't trust them with:** The audit logic itself — specifically the check ordering and the savings calculation formulas. I wrote every condition and edge case by hand and then wrote tests for them. When Claude suggested a different check ordering that felt clever but would have generated false positive cross-tool recommendations in some cases, I overrode it. AI is bad at reasoning about the interaction of multiple sequential conditions when the order changes the output.

**One time the AI was wrong and I caught it:** I asked Claude to help me write the hCaptcha server-side verification function. It gave me code that used `fetch` with `Content-Type: application/json` for the hCaptcha verification endpoint — but hCaptcha's `/siteverify` endpoint only accepts `application/x-www-form-urlencoded`. The JSON version returns a silent failure (returns `{"success": false}` with no error explanation). I caught it when my integration test was silently rejecting all real tokens. Had I not read the hCaptcha API docs, I'd have shipped a captcha that rejected real users as bots.

---

## 5. Self-Ratings

**Discipline: 7/10**
Started well, kept the commit cadence, didn't cram everything into the last two days. Lost about half a day to a rabbit hole on streaming Anthropic responses that I ended up reverting anyway.

**Code quality: 7/10**
The audit engine is clean, well-typed, and well-tested. The UI components are functional but could use more abstraction — there's some repeated styling logic in the results page that I'd extract into a shared component in a real codebase.

**Design sense: 8/10**
The dark mode glassmorphism aesthetic works well for the product. The savings hero on the results page is genuinely striking. The landing page hero mock dashboard communicates the value proposition without a word of copy. Docking one point because mobile responsiveness, while functional, could be smoother on the audit form at very small viewports.

**Problem-solving: 8/10**
The audit engine check ordering problem and the Anthropic API key bug were both solved through hypothesis-driven debugging rather than guessing. The interview insight that reversed the results page layout order is the kind of problem-solving that's harder to measure — translating a user's one-liner into a product decision.

**Entrepreneurial thinking: 7/10**
The GTM.md and ECONOMICS.md are specific and grounded, not hand-wavy. I genuinely believe the Show HN distribution strategy would work. Docking points for not having enough time to pressure-test the economics model with more data points — the LTV estimate of $1,500/customer is a rough assumption that deserves more rigor.
