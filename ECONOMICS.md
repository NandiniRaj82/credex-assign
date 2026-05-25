# ECONOMICS.md — StackLens Unit Economics

## What's a Converted Lead Worth to Credex?

**Assumption:** Credex earns a margin of 5–15% on AI credits sold. The product description says credits are sourced from companies that overforecast — let's assume Credex buys at 70% of retail and sells at 80–85%, netting 10–15% margin.

A typical converted customer (from StackLens audit data):
- Monthly AI spend: $1,500–$5,000 (the $500+/mo savings cases Credex targets)
- They switch 30–50% of that spend to Credex credits
- Annual credit purchase: $6,000–$30,000
- Credex margin: 12% average → **$720–$3,600 LTV per customer per year**

**Conservative estimate used below: $1,500 LTV/customer/year** (low end, accounting for churn and partial conversion).

---

## Customer Acquisition Cost (CAC) by Channel

| Channel | Cost | Audits Expected | Lead Capture Rate | Consultation Rate | Credit Purchase Rate | Customers | CAC |
|---------|------|-----------------|-------------------|-------------------|---------------------|-----------|-----|
| Show HN post | $0 (time) | 300 | 10% = 30 leads | 15% = 4.5 | 50% = 2.25 | ~2 | ~$0* |
| Reddit organic | $0 (time) | 150 | 10% = 15 leads | 15% = 2.25 | 50% = 1.1 | ~1 | ~$0* |
| Eng manager newsletter guest post | $0 (pitch time) | 200 | 12% = 24 leads | 15% = 3.6 | 50% = 1.8 | ~2 | ~$0* |
| Credex warm outreach to existing customers | $0 (sales time, est. $200/hr × 2hr) | N/A | 60% direct | 40% = book call | 60% close | 1.4 | ~$143 |

*"$0 CAC" is not free — it costs founder/team time. Normalised at $100/hour: HN post takes ~8 hours to write well = $800 investment for ~2 customers = $400 CAC. Still strong LTV:CAC > 3:1.

---

## Conversion Funnel

```
Landing page visitors
        │
        │ 40% click "Audit My Spend"
        ▼
Audit form started
        │
        │ 65% complete the form
        ▼
Audit completed (results page)
        │
        │ 10% submit email (lead capture)
        ▼
Lead captured
        │
        │ 15% of high-value leads book consultation
        ▼
Credex consultation
        │
        │ 50% convert to credit purchase
        ▼
Paying Credex customer
```

**At 1,000 audits/month:**
- 100 email leads
- ~30 are high-value ($500+/mo savings)
- 4–5 consultation bookings
- 2–3 credit purchases/month
- Revenue: 2–3 × $1,500 LTV = $3,000–$4,500/month attributed to StackLens

---

## What Has to Be True for $1M ARR in 18 Months

$1M ARR requires approximately **$83k/month in Credex revenue attributed to StackLens leads.**

At $1,500 average annual LTV and monthly credit purchases:
- Need ~55 new customers/month by month 18
- At 2–3% audit→customer conversion (audit → customer): need ~2,200 audits/month
- At 40% landing page → audit form CTR and 65% completion: need ~8,500 monthly visitors

**The math closes if:**
1. StackLens gets to 10k monthly visitors by month 9 (achievable via SEO + ongoing HN/Product Hunt distribution)
2. The consultation booking rate for high-value cases stays above 10% (requires responsive Credex sales follow-up)
3. The credit purchase close rate is ≥40% (depends heavily on Credex's sales process)
4. Average LTV is actually $2,000 (possible — high-savings customers tend to have larger AI budgets overall)

**The most important variable:** Credex's consultation-to-close rate. StackLens can generate warm, high-intent leads with a specific savings number attached. If Credex's sales team can convert those at 40%+, the economics work easily. If it drops to 20%, you need 2× the traffic.

**Rough 18-month model:**

| Month | Monthly Audits | Email Leads | Consultations | Customers | Cumulative ARR |
|-------|---------------|-------------|---------------|-----------|----------------|
| 1–3 | 300 | 30 | 4 | 2 | $36k |
| 4–6 | 800 | 80 | 11 | 5 | $126k |
| 7–9 | 1,500 | 150 | 20 | 10 | $306k |
| 10–12 | 2,500 | 250 | 34 | 17 | $612k |
| 13–15 | 4,000 | 400 | 54 | 27 | $1.1M |
| 16–18 | 6,000 | 600 | 81 | 40 | $1.8M |

This hits $1M ARR at roughly month 13–14, assuming growth compounds from word-of-mouth (shared audit URLs) and the organic SEO tail from PRICING_DATA content.

**Biggest risk:** Audit URL sharing rate is lower than expected, limiting the viral loop. Mitigation: add incentives for sharing (referral credit toward Credex purchase, or a "compare your stack to industry benchmark" feature gated behind sharing).
