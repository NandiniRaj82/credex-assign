# PROMPTS.md — StackLens

This file documents every LLM prompt used in the tool, the reasoning behind each design choice, and what was iterated on.

---

## 1. Audit Summary Prompt

### Location
`src/app/api/summary/route.ts` — `POST /api/summary`

### Model
`claude-haiku-4-5` (Anthropic)

**Why Haiku:** The summary needs to be fast (results page loads it async). Haiku is Anthropic's fastest model. Latency matters more than raw quality for a 100-word paragraph — Sonnet or Opus would be overkill and 3–5× the cost per call.

### The Full Prompt

```
You are a concise, numbers-first AI spend analyst. Write a single paragraph of exactly 80–110 words summarising this AI tool audit for a startup.

AUDIT DATA:
- Team size: {teamSize} people
- Primary use case: {primaryUseCase}
- Total current monthly AI spend: ${totalMonthlySpend}
- Total monthly savings identified: ${totalMonthlySavings}
- Total annual savings identified: ${totalAnnualSavings}
- Tool breakdown:
{toolBreakdown}

RULES:
1. Lead with the headline number (total monthly savings, or "spending efficiently" if none).
2. Call out the biggest single saving opportunity by tool name and dollar amount.
3. End with a forward-looking sentence about what to do next.
4. Tone: direct, smart, no jargon, no fluff. Like a CFO's hot take.
5. Do NOT use bullet points. One paragraph only.
6. Do NOT include $ signs at the start of the paragraph.
```

### Tool breakdown format

Each tool is serialised as:
```
- {toolName} ({currentPlanName}): {optimal | action="{action}", saves ${monthlySavings}/mo — {reason}}
```

---

### Design Rationale

**Why a word count target (80–110 words)?**
The summary appears in a card on the results page. Too short and it feels like an error message. Too long and users stop reading. 80–110 words fits two comfortable paragraphs of reading — but we force it to one paragraph, which is harder to write well and forces the AI to prioritise.

**Why "like a CFO's hot take"?**
The persona constraint is the single most important part of the prompt. Without it, the model defaults to hedging language ("you may want to consider..."). A CFO doesn't hedge — they say what the number means and what to do next. This framing dramatically reduced hedge-language in my tests.

**Why rule 6 ("do not start with $")?**
Early iterations started almost every summary with "$X/month in savings..." — grammatically correct but feels like a robot reading a spreadsheet. Rule 6 forces a different sentence opener, producing more varied and readable summaries.

---

### What I Tried That Didn't Work

**Attempt 1: Streaming response**
I initially streamed the response using `client.messages.stream()` to show a typewriter effect. The UI was cool, but:
1. Edge runtime streaming in Next.js App Router required specific configuration
2. The token-by-token stream meant the word count rule was harder to enforce (model sometimes stopped mid-sentence)
3. For 100-word output, buffering is fine — the latency difference is under 500ms

Reverted to non-streaming `client.messages.create()`.

**Attempt 2: GPT-4o-mini**
Used OpenAI's GPT-4o-mini in an earlier iteration. The summaries were fine but the tone was consistently more casual than I wanted for a B2B product. Anthropic's models read as slightly more precise and businesslike for financial language. Subjective, but consistent across 20+ test runs.

**Attempt 3: One-shot system prompt**
Tried moving rules to the `system` role:
```json
{ "role": "system", "content": "You are a CFO-style analyst..." }
```
The results were almost identical. Kept rules in the user message for clarity and simpler code.

---

## 2. No Other LLM Calls

The audit logic itself (plan fit, seat efficiency, alternative recommendations, savings calculations) uses **zero LLM calls**. This is intentional and documented in ARCHITECTURE.md.

Reasons:
1. **Accuracy:** LLMs hallucinate pricing data. Hardcoded rules with cited prices are more reliable for financial recommendations.
2. **Speed:** The audit results page loads instantly. No LLM latency on the critical path.
3. **Cost:** At 1,000 audits/day, a single Claude call per audit at Haiku rates ($0.80/MTok) costs roughly $0.02/audit — acceptable. Running the audit engine through an LLM would be 10–50× more expensive with worse reliability.
4. **Testability:** Pure functions are unit-testable. LLM outputs are not deterministic — you can't write a meaningful unit test for "does the AI give the right recommendation."

This is the correct engineering trade-off. Knowing when **not** to use AI is as important as knowing when to use it.
