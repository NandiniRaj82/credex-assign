# TESTS.md — StackLens

All automated tests are written using [Vitest](https://vitest.dev/).

## Running Tests

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file change)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

---

## Test Files

### `src/lib/audit-engine.test.ts`

**What it covers:** The entire audit engine — the most critical logic in the application.

| Test # | Description | What's verified |
|--------|-------------|-----------------|
| 1 | Correct savings calculation — overpaying | `monthlySavings > 0` when actual spend > list price; `annualSavings === monthlySavings × 12` |
| 2 | Correct $0 savings — optimal plan | Correctly priced plan returns no false positive savings |
| 3 | Multi-tool savings sum | `totalMonthlySavings === sum(results[i].monthlySavings)` across multiple tools |
| 4 | Excess seats flagged | `recommendedAction === "reduce-seats"` when `seats > teamSize × 1.2` |
| 5 | Correct seats not flagged | No reduce-seats recommendation when `seats === teamSize` |
| 6 | Min seat requirement — downgrade | `recommendedAction === "downgrade"` when on Team plan with 1 seat |
| 7 | Min seat met — no downgrade | No false downgrade when min seat requirement is satisfied |
| 8 | Use case mismatch | Coding IDE recommended for switch when team's use case is "writing" |
| 9 | Correct use case — no switch | Coding IDE kept for coding team |
| 10 | High value threshold — `isHighValueCase` | `isHighValueCase === true` when `totalMonthlySavings >= $500` |
| 11 | Below threshold — `isHighValueCase` false | `isHighValueCase === false` for small savings |
| 12 | Annual savings invariant | `totalAnnualSavings === totalMonthlySavings × 12` across all inputs |
| 13 | Per-tool annual savings | `annualSavings === monthlySavings × 12` for every individual result |
| 14 | API tool — high spend flagged | `credexOpportunity === true` for >$200/mo API spend |
| 15 | API tool — low spend not flagged | `credexOpportunity === false` for ≤$200/mo API spend |
| 16 | Cross-tool alternative | Cheaper alternative recommended when ≥25% cheaper per seat |
| 17 | `isAlreadyOptimal` flag | Set correctly when total savings < $100 |

**How to run:**
```bash
npm test
# or specifically:
npx vitest run src/lib/audit-engine.test.ts
```

---

## Coverage Report

```bash
npm run test:coverage
# Opens HTML coverage report in .coverage/index.html
```

The audit engine (`src/lib/audit-engine.ts`) and pricing data (`src/lib/pricing-data.ts`) should show >90% coverage from these tests.

---

## What Is NOT Tested (and Why)

| Area | Reason |
|------|--------|
| API routes (`/api/audit`, `/api/lead`, `/api/summary`) | Would require mocking Supabase and Anthropic clients — integration tests better suited here. Tested manually. |
| React components | UI components were not unit-tested in this MVP iteration. Would add React Testing Library tests in Week 2. |
| Email delivery | Resend sends real emails — tested manually against a test inbox. |
| hCaptcha verification | Tested against hCaptcha's test keys. Not in CI due to network dependency. |

---

## Future Tests (Week 2 Priority)

1. **API route integration tests** — using `next/test-utils` or `supertest`
2. **E2E tests** — Playwright covering the full audit → results → lead capture flow
3. **Rate limiter tests** — verify IP throttling logic
4. **Email template tests** — snapshot test HTML output
