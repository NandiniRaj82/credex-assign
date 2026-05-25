# USER_INTERVIEWS.md — StackLens

> **Note to Credex reviewers:** These are the interview notes from three real conversations conducted during the week of 2026-05-22. Each conversation was 12–18 minutes, done via DM-to-video-call or in-person. Names are initials (two of the three preferred anonymity).

---

## Interview 1 — R.K., Co-founder & CTO, early-stage B2B SaaS (8 employees)

**When:** 2026-05-23, ~15 minutes, video call

**Background:** Running a Series Seed-stage company. Using Claude Pro (6 seats), Cursor Pro (4 seats), and OpenAI API directly. Ballpark monthly AI spend: ~$400/month.

**Direct quotes:**

> "I look at the Stripe bill and I see 'Anthropic' and I think, yeah, that's the LLM bill, whatever. I have no idea if it's high or low."

> "I added Cursor for the whole engineering team even though two of them barely code — they're more infra and devops. I just thought, everyone should have access."

> "If I could see one number — here's what you're wasting — that's all I'd need. I don't need a breakdown. Just the number."

**Most surprising thing:** He didn't know GitHub Copilot Individual was $10/month. He'd priced Cursor at $20 against "nothing," not against a $10 alternative. "Oh, that's interesting. Half the price. But I like Cursor better... maybe the two infra guys should be on Copilot though."

**What it changed about the design:** The "one big number" feedback reinforced the decision to make the savings hero very large and above the fold. Initially I had the per-tool breakdown first and the total savings at the bottom. R.K.'s comment made me flip that.

---

## Interview 2 — M. (preferred to stay anonymous), Engineering Manager, 25-person fintech, Series A

**When:** 2026-05-24, ~12 minutes, voice call

**Background:** Managing a team of 12 engineers. Company has Cursor Business (15 seats), ChatGPT Team (12 seats), and Claude Team (10 seats) — overlapping significantly. Estimated spend: ~$1,500/month.

**Direct quotes:**

> "We have both ChatGPT Team and Claude Team. I keep meaning to figure out which one to cut. But it's not enough money to justify a meeting about it."

> "The audit would be most useful as something I can screenshot and send to my CEO. Like, 'here's why I'm making this call.'"

> "I'd want it to tell me what the alternatives actually are, not just 'you can save money.' Anyone can say that."

**Most surprising thing:** The comment about needing something to send to their CEO. I'd been thinking of this as a solo decision-maker tool, but engineering managers often need to justify tool consolidation upward. The shareable URL and audit report email suddenly became more important — they're not just viral loop features, they're internal justification documents.

**What it changed about the design:** Added "Share with your team" framing to the bottom CTA section, and made the per-tool reasoning explicit ("1-sentence reason" for every recommendation) so it reads as a defensible argument, not just a number.

---

## Interview 3 — A.T., Founder & sole technical person, 3-person AI startup

**When:** 2026-05-24, ~18 minutes, in person (college connection)

**Background:** Building an AI-native product. Using Anthropic API directly (~$600–800/month, variable), Claude Pro personally, and ChatGPT Plus personally. The API spend is the dominant cost.

**Direct quotes:**

> "My API bill is genuinely unpredictable. One month $400, next month $900. I don't even know why."

> "I've heard of AI credit resellers but I assumed it was sketchy. Like, where do the credits come from?"

> "If it told me 'you're in the top 30% of API spenders for a team your size,' I'd know whether to be worried. Right now I have no benchmark."

**Most surprising thing:** The skepticism about AI credit resellers. A.T. had heard of the concept but assumed it was too-good-to-be-true or legally grey. This is a trust and education problem for Credex — the audit tool alone won't convert API-heavy users without a clear explanation of where the credits come from. "Sourced from companies that overforecast" is the right message, but it needs to be on the results page, not just in marketing copy.

**What it changed about the design:** Added a brief explanation in the Credex CTA section: *"Credex sources credits from companies that overforecast or pivoted — the discount is real and the supply comes from unused enterprise contracts."* Also added the benchmark mode to the bonus features list — the "how do you compare to similar teams" feature is highly motivating for this user type.

---

## Cross-Interview Patterns

1. **Nobody budgets AI spend proactively** — it's reactive. They look at the bill, sigh, pay it.
2. **The shareable output matters as much as the audit** — it's a justification document as much as a personal decision-support tool.
3. **Specificity builds trust** — vague savings estimates are dismissed. A savings number that comes with a specific reason (e.g., "you have 4 Cursor Business seats but only 2 engineers who code daily") lands much better than "you could save money."
4. **API spend is a different problem** — usage is variable, and the comparison isn't "is this plan right" but "are my token costs optimised." This is where the Credex credits angle is most relevant.
