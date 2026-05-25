# METRICS.md — StackLens

## North Star Metric

**Qualified leads captured per week** (defined as: email submitted after completing a real audit, with totalMonthlySavings > $100).

**Why this, not "audits completed":**
A completed audit with no lead capture is awareness — useful, but doesn't directly drive Credex revenue. A qualified lead is a warm prospect who has seen their specific savings number and decided it's worth sharing their contact info. That's the unit of value StackLens delivers to Credex.

"Qualified" (>$100 savings) filters out users who are already spending optimally — they're fine prospects for a "notify me" drip sequence but not for a Credex consultation in the near term.

---

## 3 Input Metrics That Drive the North Star

### 1. Audit Completion Rate
**Definition:** `(audits completed) / (audit forms started)` per week

**Why it matters:** Qualified leads can only come from completed audits. A 50% completion rate is a leaking bucket — every drop in completion is a qualified lead that never existed.

**Target:** >65% completion rate. Below 50% triggers a UX review of the form.

**Instrumentation:** Track `audit_form_started` and `audit_form_completed` events.

---

### 2. Lead Capture Rate (Post-Audit)
**Definition:** `(emails submitted) / (audits completed)` per week

**Why it matters:** This is the value exchange rate. If users complete the audit and don't share their email, either the savings number wasn't compelling enough, or the email gate feels too expensive for the value shown.

**Target:** >8% overall; >20% for audits showing >$500/mo savings.

**Instrumentation:** Track `lead_capture_modal_opened`, `lead_submitted`, segmented by `monthly_savings` bucket.

---

### 3. Shareable URL Click-Through Rate
**Definition:** `(clicks on shared audit URLs from external sources) / (shareable URLs generated)` per week

**Why it matters:** StackLens's viral loop is the share feature. If 5% of users share their audit and each share drives 10 new visitors, that's a significant organic multiplier on paid and earned traffic. A low CTR means either nobody is sharing, or the OG preview isn't compelling enough to click.

**Target:** >10% of completed audits result in a shared URL click (from social media, Slack, or direct message referrals).

**Instrumentation:** Track `share_link_copied`, and instrument UTM parameters on incoming referral traffic from shared links.

---

## What I'd Instrument First

On day 1 of launching:

1. `audit_started` — user clicks "Audit My Spend" on landing page
2. `audit_step_1_complete` — team info submitted
3. `audit_submitted` — form POSTed to `/api/audit`
4. `audit_results_viewed` — results page loaded (with `savings_bucket`: "$0", "$1–100", "$100–500", "$500+")
5. `lead_modal_opened` — "Get Report" clicked
6. `lead_submitted` — email submitted successfully
7. `credex_cta_clicked` — "Book Credex consultation" clicked
8. `share_link_copied` — share button clicked

**Tool:** PostHog (free tier, self-hostable, no GDPR headaches with EU visitors).

All events include: `timestamp`, `audit_slug`, `savings_bucket`, `tool_count`, `primary_use_case`. No PII in event properties.

---

## What Number Triggers a Pivot Decision

**Pivot trigger: Lead capture rate drops below 4% for 3 consecutive weeks, while audit completion rate stays above 60%.**

This combination means: users are completing the audit and seeing their results, but not finding the value compelling enough to share their email. This suggests one of three problems:

1. **Savings numbers are too low** — the audit engine is recommending suboptimal plans too conservatively, or users are already well-optimised. Solution: loosen the savings threshold for recommendations; expand tool coverage.

2. **Email gate is too early in the results page** — users feel the value was shown but the ask feels premature. Solution: A/B test moving the email CTA further down the page, after all tool cards are expanded.

3. **Trust deficit** — users don't believe the savings estimates are real. Solution: add "how we calculated this" popovers on every savings number, and make the PRICING_DATA.md link more prominent in the UI.

If all three are tried and lead capture rate still doesn't hit 6%+, the more fundamental question is whether the tool is solving a real problem — which is what the user interviews should have answered upfront.
