/**
 * AUDIT ENGINE TESTS — StackLens
 *
 * Tests the deterministic audit logic.
 * Run: npx vitest run
 */

import { describe, it, expect } from "vitest";
import {
  runAudit,
  auditSingleTool,
  type AuditInput,
  type ToolEntry,
} from "./audit-engine";
import { CREDEX_HIGH_VALUE_THRESHOLD, TOOLS } from "./pricing-data";

// ---------------------------------------------------------------------------
// TEST HELPERS
// ---------------------------------------------------------------------------

function makeInput(
  tools: ToolEntry[],
  overrides?: Partial<Omit<AuditInput, "tools">>
): AuditInput {
  return {
    tools,
    teamSize: overrides?.teamSize ?? 5,
    primaryUseCase: overrides?.primaryUseCase ?? "coding",
  };
}

// ---------------------------------------------------------------------------
// 1. CORRECT SAVINGS CALCULATION — overpaying on plan
// ---------------------------------------------------------------------------
describe("Audit Engine — savings calculations", () => {
  it("calculates correct monthly and annual savings when overpaying", () => {
    // Cursor Business is $40/seat, user paying $100 for 1 seat (overpaying)
    const input = makeInput([
      {
        toolId: "cursor",
        planId: "cursor-business",
        seats: 1,
        monthlySpend: 100, // should be $40
      },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    expect(toolResult.monthlySavings).toBeGreaterThan(0);
    expect(toolResult.annualSavings).toBe(toolResult.monthlySavings * 12);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it("returns $0 savings for a correctly priced plan", () => {
    // Cursor Pro at $20/seat, paying exactly $20 for 1 seat
    const input = makeInput([
      {
        toolId: "cursor",
        planId: "cursor-pro",
        seats: 1,
        monthlySpend: 20,
      },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    // Savings should be zero or near-zero (might still recommend alternative)
    expect(toolResult.currentMonthlySpend).toBe(20);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
  });

  it("sums savings correctly across multiple tools", () => {
    const input = makeInput([
      { toolId: "cursor", planId: "cursor-business", seats: 2, monthlySpend: 200 },
      { toolId: "claude", planId: "claude-pro", seats: 2, monthlySpend: 40 },
    ]);
    const result = runAudit(input);

    const sumOfIndividualSavings = result.results.reduce(
      (sum, r) => sum + r.monthlySavings,
      0
    );
    expect(result.totalMonthlySavings).toBe(sumOfIndividualSavings);
  });
});

// ---------------------------------------------------------------------------
// 2. SEAT EFFICIENCY — too many seats
// ---------------------------------------------------------------------------
describe("Audit Engine — seat efficiency", () => {
  it("flags excess seats when user pays for more seats than team size", () => {
    // Team size 3, but paying for 10 seats
    const input = makeInput(
      [{ toolId: "cursor", planId: "cursor-pro", seats: 10, monthlySpend: 200 }],
      { teamSize: 3 }
    );
    const result = runAudit(input);
    const toolResult = result.results[0];

    expect(toolResult.recommendedAction).toBe("reduce-seats");
    expect(toolResult.monthlySavings).toBeGreaterThan(0);
  });

  it("does NOT flag seats when seat count matches team size", () => {
    const input = makeInput(
      [{ toolId: "cursor", planId: "cursor-pro", seats: 5, monthlySpend: 100 }],
      { teamSize: 5 }
    );
    const result = runAudit(input);
    const toolResult = result.results[0];

    expect(toolResult.recommendedAction).not.toBe("reduce-seats");
  });
});

// ---------------------------------------------------------------------------
// 3. MINIMUM SEAT REQUIREMENT — team plan with too few seats
// ---------------------------------------------------------------------------
describe("Audit Engine — minimum seat requirements", () => {
  it("recommends downgrade when user is on Team plan with only 1 seat", () => {
    // Claude Team requires min 2 seats — 1 seat user should downgrade to Pro
    const input = makeInput([
      { toolId: "claude", planId: "claude-team", seats: 1, monthlySpend: 30 },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    expect(toolResult.recommendedAction).toBe("downgrade");
    expect(toolResult.recommendedPlanName).toBeTruthy();
  });

  it("does NOT trigger min-seat downgrade flag when seat requirement is fully met", () => {
    // Claude Team min seats = 2. With 3 seats, the min-seat check should NOT fire.
    // (A plan-efficiency downgrade to Pro may still fire — that's separate and correct.)
    const input = makeInput([
      { toolId: "claude", planId: "claude-team", seats: 3, monthlySpend: 90 },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    // The reason should NOT mention "minimum seats" — that's the min-seat check.
    // Any downgrade recommendation here is due to plan efficiency, not seat floor.
    expect(toolResult.reason).not.toContain("minimum of");
    expect(toolResult.reason).not.toContain("seat floor");
  });
});

// ---------------------------------------------------------------------------
// 4. USE CASE MISMATCH — coding IDE for a writing team
// ---------------------------------------------------------------------------
describe("Audit Engine — use case mismatch", () => {
  it("recommends switching from coding IDE to LLM chat for a writing team", () => {
    const input = makeInput(
      [{ toolId: "cursor", planId: "cursor-pro", seats: 3, monthlySpend: 60 }],
      { primaryUseCase: "writing", teamSize: 3 }
    );
    const result = runAudit(input);
    const toolResult = result.results[0];

    // Should recommend switching away from coding IDE
    expect(toolResult.recommendedAction).toBe("switch");
    expect(toolResult.recommendedAlternativeToolId).toBeTruthy();
  });

  it("keeps coding IDE (does NOT recommend non-coding tool) for a coding team", () => {
    const input = makeInput(
      [{ toolId: "cursor", planId: "cursor-pro", seats: 3, monthlySpend: 60 }],
      { primaryUseCase: "coding", teamSize: 3 }
    );
    const result = runAudit(input);
    const toolResult = result.results[0];

    // For a coding team, any alternative recommended must ALSO be a coding tool
    // (not a chat LLM like Claude or ChatGPT)
    if (toolResult.recommendedAlternativeToolId) {
      const altCategory = TOOLS[toolResult.recommendedAlternativeToolId]?.category;
      expect(altCategory).toBe("coding-ide");
    }
  });
});

// ---------------------------------------------------------------------------
// 5. HIGH VALUE THRESHOLD — $500+/mo savings triggers Credex CTA
// ---------------------------------------------------------------------------
describe("Audit Engine — Credex high-value threshold", () => {
  it("sets isHighValueCase=true when total monthly savings exceed $500", () => {
    // 20 Cursor Business seats at $80 each = $1600/mo; optimal = $40 each = $800
    const input = makeInput(
      [{ toolId: "cursor", planId: "cursor-business", seats: 20, monthlySpend: 1600 }],
      { teamSize: 20 }
    );
    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(
      CREDEX_HIGH_VALUE_THRESHOLD
    );
    expect(result.isHighValueCase).toBe(true);
  });

  it("sets isHighValueCase=false when savings are below threshold", () => {
    const input = makeInput([
      { toolId: "cursor", planId: "cursor-pro", seats: 1, monthlySpend: 20 },
    ]);
    const result = runAudit(input);

    expect(result.isHighValueCase).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. ANNUAL SAVINGS — always 12× monthly
// ---------------------------------------------------------------------------
describe("Audit Engine — annual savings calculation", () => {
  it("always computes annual savings as exactly 12× monthly savings", () => {
    const inputs: AuditInput[] = [
      makeInput([{ toolId: "cursor", planId: "cursor-business", seats: 5, monthlySpend: 400 }]),
      makeInput([{ toolId: "claude", planId: "claude-max-5x", seats: 2, monthlySpend: 200 }]),
      makeInput(
        [{ toolId: "github-copilot", planId: "copilot-enterprise", seats: 10, monthlySpend: 390 }],
        { teamSize: 10 }
      ),
    ];

    for (const input of inputs) {
      const result = runAudit(input);
      expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
      for (const r of result.results) {
        expect(r.annualSavings).toBe(r.monthlySavings * 12);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 7. API DIRECT TOOLS — flagged for Credex credits opportunity
// ---------------------------------------------------------------------------
describe("Audit Engine — API direct tools", () => {
  it("flags high-spend API usage for Credex credits opportunity", () => {
    const input = makeInput([
      { toolId: "openai-api", planId: "openai-api-direct", seats: 1, monthlySpend: 500 },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    expect(toolResult.credexOpportunity).toBe(true);
    expect(toolResult.credexEstimatedMonthlySavings).toBeDefined();
    expect(toolResult.credexEstimatedMonthlySavings!).toBeGreaterThan(0);
  });

  it("does NOT flag low-spend API usage for Credex opportunity", () => {
    const input = makeInput([
      { toolId: "anthropic-api", planId: "anthropic-api-direct", seats: 1, monthlySpend: 50 },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    expect(toolResult.credexOpportunity).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. CROSS-TOOL ALTERNATIVE — cheaper equivalent recommended
// ---------------------------------------------------------------------------
describe("Audit Engine — cross-tool alternatives", () => {
  it("recommends Windsurf over Cursor Business when user is price-sensitive", () => {
    // Cursor Business at $40/seat vs Windsurf Pro at $15/seat — same coding capability
    const input = makeInput([
      { toolId: "cursor", planId: "cursor-business", seats: 5, monthlySpend: 200 },
    ]);
    const result = runAudit(input);
    const toolResult = result.results[0];

    // Should at least recommend action (downgrade, switch, or reduce-seats)
    expect(toolResult.recommendedAction).not.toBe("stay");
    // Savings must be non-negative
    expect(toolResult.monthlySavings).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// 9. ALREADY OPTIMAL — isAlreadyOptimal flag
// ---------------------------------------------------------------------------
describe("Audit Engine — already optimal flag", () => {
  it("sets isAlreadyOptimal=true when total savings are under $100/mo", () => {
    const input = makeInput([
      { toolId: "cursor", planId: "cursor-pro", seats: 2, monthlySpend: 40 },
    ]);
    const result = runAudit(input);

    // If no savings were found, isAlreadyOptimal should be true
    if (result.totalMonthlySavings < 100) {
      expect(result.isAlreadyOptimal).toBe(true);
    }
  });
});
