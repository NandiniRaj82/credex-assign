/**
 * AUDIT ENGINE — StackLens
 *
 * Pure TypeScript. No external dependencies. Fully deterministic.
 * AI is NOT used here — hardcoded rules are correct for audit math.
 * This is the single most important file in the project.
 */

import {
  TOOLS,
  CREDEX_DISCOUNT_RANGE,
  CREDEX_HIGH_VALUE_THRESHOLD,
  LOW_SPEND_THRESHOLD,
  type ToolId,
  type UseCase,
} from "./pricing-data";

// ---------------------------------------------------------------------------
// INPUT TYPES
// ---------------------------------------------------------------------------

export type ToolEntry = {
  toolId: ToolId;
  planId: string;
  seats: number;
  monthlySpend: number; // what they're actually paying
};

export type AuditInput = {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: UseCase;
};

// ---------------------------------------------------------------------------
// OUTPUT TYPES
// ---------------------------------------------------------------------------

export type RecommendedAction =
  | "stay" // already on the optimal plan
  | "downgrade" // switch to cheaper plan same vendor
  | "switch" // switch to a different tool entirely
  | "reduce-seats" // paying for more seats than team size
  | "review-usage"; // API usage — review token spend

export type ToolAuditResult = {
  toolId: ToolId;
  toolName: string;
  currentPlanName: string;
  currentMonthlySpend: number;
  recommendedAction: RecommendedAction;
  recommendedPlanId?: string;
  recommendedPlanName?: string;
  recommendedAlternativeToolId?: ToolId;
  recommendedAlternativeToolName?: string;
  estimatedMonthlyCost: number; // what they should be paying
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  credexOpportunity: boolean; // can Credex credits help here?
  credexEstimatedMonthlySavings?: number;
  isOptimal: boolean;
};

export type AuditResult = {
  auditId?: string; // set after DB storage
  input: AuditInput;
  results: ToolAuditResult[];
  totalMonthlySpend: number;
  totalOptimalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isHighValueCase: boolean; // > CREDEX_HIGH_VALUE_THRESHOLD
  isAlreadyOptimal: boolean; // < LOW_SPEND_THRESHOLD savings
  createdAt: string;
};

// ---------------------------------------------------------------------------
// AUDIT ENGINE
// ---------------------------------------------------------------------------

/**
 * Run the full audit for a user's AI tool stack.
 * This is the main entry point — pure function, no side effects.
 */
export function runAudit(input: AuditInput): AuditResult {
  const results: ToolAuditResult[] = input.tools.map((entry) =>
    auditSingleTool(entry, input)
  );

  const totalMonthlySpend = results.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0
  );
  const totalOptimalMonthlySpend = results.reduce(
    (sum, r) => sum + r.estimatedMonthlyCost,
    0
  );
  const totalMonthlySavings = Math.max(
    0,
    totalMonthlySpend - totalOptimalMonthlySpend
  );
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    input,
    results,
    totalMonthlySpend,
    totalOptimalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    isHighValueCase: totalMonthlySavings >= CREDEX_HIGH_VALUE_THRESHOLD,
    isAlreadyOptimal: totalMonthlySavings < LOW_SPEND_THRESHOLD,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Audit a single tool entry against the pricing data and usage context.
 * Applies checks in priority order — first failing check wins.
 */
function auditSingleTool(entry: ToolEntry, context: AuditInput): ToolAuditResult {
  const tool = TOOLS[entry.toolId];
  if (!tool) {
    throw new Error(`Unknown tool ID: ${entry.toolId}`);
  }

  const currentPlan = tool.plans.find((p) => p.id === entry.planId);
  if (!currentPlan) {
    throw new Error(`Unknown plan ID: ${entry.planId} for tool ${entry.toolId}`);
  }

  // API-direct tools are usage-based — special handling
  if (
    entry.toolId === "anthropic-api" ||
    entry.toolId === "openai-api" ||
    currentPlan.id.endsWith("-api")
  ) {
    return auditApiDirectTool(entry, tool, currentPlan, context);
  }

  // Custom/Enterprise pricing — can't audit the math directly
  if (currentPlan.isCustom) {
    return {
      toolId: entry.toolId,
      toolName: tool.name,
      currentPlanName: currentPlan.name,
      currentMonthlySpend: entry.monthlySpend,
      recommendedAction: "review-usage",
      estimatedMonthlyCost: entry.monthlySpend,
      monthlySavings: 0,
      annualSavings: 0,
      reason:
        `${tool.name} Enterprise is priced by contract. Benchmark your per-seat cost against ` +
        `the Business plan ($${getNextLowerPlan(tool, currentPlan.id)?.pricePerSeatPerMonth ?? "N/A"}/seat) ` +
        `to verify you're getting a competitive rate.`,
      credexOpportunity: entry.monthlySpend > 200,
      credexEstimatedMonthlySavings: entry.monthlySpend > 200
        ? Math.round(entry.monthlySpend * CREDEX_DISCOUNT_RANGE.min)
        : undefined,
      isOptimal: false,
    };
  }

  // --- Check 1: Are they overpaying vs. what the plan actually costs? ---
  const expectedCost = currentPlan.pricePerSeatPerMonth * entry.seats;
  if (entry.monthlySpend > expectedCost * 1.05) {
    // >5% over expected — likely billing error or hidden fees
    return buildResult(entry, tool, currentPlan, {
      recommendedAction: "review-usage",
      estimatedMonthlyCost: expectedCost,
      reason:
        `Your reported spend of $${entry.monthlySpend}/mo exceeds the list price of ` +
        `$${expectedCost}/mo (${entry.seats} seats × $${currentPlan.pricePerSeatPerMonth}). ` +
        `Check your invoice for overages, add-ons, or billing errors.`,
    });
  }

  // --- Check 2: Too many seats? ---
  if (entry.seats > context.teamSize * 1.2) {
    // Paying for >20% more seats than team headcount
    const correctSeats = context.teamSize;
    const optimalCost = currentPlan.pricePerSeatPerMonth * correctSeats;
    if (optimalCost < entry.monthlySpend * 0.9) {
      return buildResult(entry, tool, currentPlan, {
        recommendedAction: "reduce-seats",
        estimatedMonthlyCost: optimalCost,
        reason:
          `You have ${entry.seats} ${tool.name} seats but a team of ${context.teamSize}. ` +
          `Removing ${entry.seats - correctSeats} unused seat(s) saves ` +
          `$${entry.monthlySpend - optimalCost}/mo at the same plan.`,
      });
    }
  }

  // --- Check 3: Minimum seat requirement not met (overpaying for team plan) ---
  if (currentPlan.minSeats && entry.seats < currentPlan.minSeats) {
    const lowerPlan = getNextLowerPlan(tool, currentPlan.id);
    if (lowerPlan && !lowerPlan.isCustom) {
      const optimalCost = lowerPlan.pricePerSeatPerMonth * entry.seats;
      return buildResult(entry, tool, currentPlan, {
        recommendedAction: "downgrade",
        recommendedPlanId: lowerPlan.id,
        recommendedPlanName: lowerPlan.name,
        estimatedMonthlyCost: optimalCost,
        reason:
          `${currentPlan.name} requires a minimum of ${currentPlan.minSeats} seats — ` +
          `you have ${entry.seats}. The ${lowerPlan.name} plan at ` +
          `$${lowerPlan.pricePerSeatPerMonth}/seat provides the same capability ` +
          `without the seat floor.`,
      });
    }
  }

  // --- Check 4: Wrong plan for use case? (e.g., coding IDE for a writing team) ---
  const useCaseMismatch = checkUseCaseMismatch(entry, tool, currentPlan, context);
  if (useCaseMismatch) return useCaseMismatch;

  // --- Check 5: Cheaper plan from same vendor fits the use case? ---
  const downgradeCheck = checkDowngrade(entry, tool, currentPlan, context);
  if (downgradeCheck) return downgradeCheck;

  // --- Check 6: Cheaper alternative tool with similar capability? ---
  const switchCheck = checkAlternative(entry, tool, currentPlan, context);
  if (switchCheck) return switchCheck;

  // --- Already optimal ---
  return buildResult(entry, tool, currentPlan, {
    recommendedAction: "stay",
    estimatedMonthlyCost: currentPlan.pricePerSeatPerMonth * entry.seats,
    reason:
      `${tool.name} ${currentPlan.name} is appropriately priced for your team's ` +
      `${context.primaryUseCase} workload at $${currentPlan.pricePerSeatPerMonth}/seat.`,
    isOptimal: true,
  });
}

// ---------------------------------------------------------------------------
// CHECK HELPERS
// ---------------------------------------------------------------------------

function checkUseCaseMismatch(
  entry: ToolEntry,
  tool: typeof TOOLS[ToolId],
  currentPlan: (typeof tool.plans)[number],
  context: AuditInput
): ToolAuditResult | null {
  // Coding IDEs (Cursor, Copilot, Windsurf) don't add value for writing/research teams
  if (
    tool.category === "coding-ide" &&
    (context.primaryUseCase === "writing" || context.primaryUseCase === "research") &&
    !currentPlan.useCaseFit.includes(context.primaryUseCase)
  ) {
    // Suggest a chat LLM instead
    const alternative = context.primaryUseCase === "writing" ? "claude" : "chatgpt";
    const altTool = TOOLS[alternative];
    const altPlan = altTool.plans.find(
      (p) => p.pricePerSeatPerMonth > 0 && !p.isCustom && p.useCaseFit.includes(context.primaryUseCase)
    );
    const altCost = altPlan ? altPlan.pricePerSeatPerMonth * entry.seats : 0;

    return buildResult(entry, tool, currentPlan, {
      recommendedAction: "switch",
      recommendedAlternativeToolId: alternative,
      recommendedAlternativeToolName: altTool.name,
      estimatedMonthlyCost: altCost,
      reason:
        `${tool.name} is a coding IDE optimised for software development. ` +
        `For a primarily ${context.primaryUseCase} team, ${altTool.name} ${altPlan?.name ?? ""} ` +
        `delivers equivalent or better value at $${altPlan?.pricePerSeatPerMonth ?? "?"}/seat.`,
    });
  }
  return null;
}

function checkDowngrade(
  entry: ToolEntry,
  tool: typeof TOOLS[ToolId],
  currentPlan: (typeof tool.plans)[number],
  context: AuditInput
): ToolAuditResult | null {
  const lowerPlan = getNextLowerPlan(tool, currentPlan.id);
  if (!lowerPlan || lowerPlan.isCustom || lowerPlan.pricePerSeatPerMonth === 0) {
    return null; // can't downgrade further
  }

  // Don't recommend downgrading if the lower plan has a min seat requirement
  // that the current entry doesn't meet (e.g., Team plan min 2 seats — don't downgrade to it)
  if (lowerPlan.minSeats && entry.seats < lowerPlan.minSeats) {
    return null;
  }

  const optimalCost = lowerPlan.pricePerSeatPerMonth * entry.seats;
  const currentCost = currentPlan.pricePerSeatPerMonth * entry.seats;
  const savings = currentCost - optimalCost;

  // Only recommend if savings > 20% of current cost
  if (savings / currentCost < 0.2) return null;

  // Check the lower plan fits the use case
  if (!lowerPlan.useCaseFit.includes(context.primaryUseCase) && !lowerPlan.useCaseFit.includes("mixed")) {
    return null;
  }

  return buildResult(entry, tool, currentPlan, {
    recommendedAction: "downgrade",
    recommendedPlanId: lowerPlan.id,
    recommendedPlanName: lowerPlan.name,
    estimatedMonthlyCost: optimalCost,
    reason:
      `${tool.name} ${lowerPlan.name} at $${lowerPlan.pricePerSeatPerMonth}/seat covers ` +
      `your ${context.primaryUseCase} workload. The features added in ${currentPlan.name} ` +
      `(${getPlanUpgradeFeatures(tool.id, currentPlan.id)}) are unlikely to be utilised ` +
      `at your current team size of ${context.teamSize}.`,
  });
}

function checkAlternative(
  entry: ToolEntry,
  tool: typeof TOOLS[ToolId],
  currentPlan: (typeof tool.plans)[number],
  context: AuditInput
): ToolAuditResult | null {
  if (!tool.alternatives?.length) return null;

  const currentCostPerSeat = currentPlan.pricePerSeatPerMonth;

  for (const altId of tool.alternatives) {
    const altTool = TOOLS[altId];
    if (!altTool) continue;

    // Find the best-fit plan in the alternative tool for this use case
    const bestAltPlan = altTool.plans
      .filter(
        (p) =>
          !p.isCustom &&
          p.pricePerSeatPerMonth > 0 &&
          (p.useCaseFit.includes(context.primaryUseCase) ||
            p.useCaseFit.includes("mixed")) &&
          (!p.minSeats || entry.seats >= p.minSeats)
      )
      .sort((a, b) => a.pricePerSeatPerMonth - b.pricePerSeatPerMonth)[0];

    if (!bestAltPlan) continue;

    const savingsPerSeat = currentCostPerSeat - bestAltPlan.pricePerSeatPerMonth;

    // Only recommend if alternative is at least 25% cheaper per seat
    if (savingsPerSeat / currentCostPerSeat < 0.25) continue;

    const optimalCost = bestAltPlan.pricePerSeatPerMonth * entry.seats;

    return buildResult(entry, tool, currentPlan, {
      recommendedAction: "switch",
      recommendedAlternativeToolId: altId,
      recommendedAlternativeToolName: altTool.name,
      recommendedPlanName: bestAltPlan.name,
      estimatedMonthlyCost: optimalCost,
      reason:
        `${altTool.name} ${bestAltPlan.name} at $${bestAltPlan.pricePerSeatPerMonth}/seat ` +
        `provides comparable ${context.primaryUseCase} capability to ${tool.name} ${currentPlan.name}. ` +
        `At ${entry.seats} seat(s), this saves $${(entry.monthlySpend - optimalCost).toFixed(0)}/month ` +
        `with no meaningful feature regression for your stated use case.`,
    });
  }

  return null;
}

function auditApiDirectTool(
  entry: ToolEntry,
  tool: typeof TOOLS[ToolId],
  currentPlan: (typeof tool.plans)[number],
  context: AuditInput
): ToolAuditResult {
  // For API tools we can't determine a "correct" price — just flag high spend for Credex
  const credexSavingsEstimate = Math.round(entry.monthlySpend * CREDEX_DISCOUNT_RANGE.min);
  const isHighSpend = entry.monthlySpend > 200;

  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentPlanName: currentPlan.name,
    currentMonthlySpend: entry.monthlySpend,
    recommendedAction: "review-usage",
    estimatedMonthlyCost: isHighSpend
      ? entry.monthlySpend - credexSavingsEstimate
      : entry.monthlySpend,
    monthlySavings: isHighSpend ? credexSavingsEstimate : 0,
    annualSavings: isHighSpend ? credexSavingsEstimate * 12 : 0,
    reason: isHighSpend
      ? `At $${entry.monthlySpend}/mo on ${tool.name} API, you're a strong candidate for ` +
        `prepaid AI credits. Organisations spending $200+/mo typically save 15–30% through ` +
        `volume credit purchases rather than paying retail PAYG rates.`
      : `Your ${tool.name} API spend of $${entry.monthlySpend}/mo is within typical range ` +
        `for this workload. Monitor token usage monthly to catch unexpected spikes.`,
    credexOpportunity: isHighSpend,
    credexEstimatedMonthlySavings: isHighSpend ? credexSavingsEstimate : undefined,
    isOptimal: !isHighSpend,
  };
}

// ---------------------------------------------------------------------------
// BUILDER & UTILITY HELPERS
// ---------------------------------------------------------------------------

type BuildResultOverrides = {
  recommendedAction: ToolAuditResult["recommendedAction"];
  estimatedMonthlyCost: number;
  reason: string;
  recommendedPlanId?: string;
  recommendedPlanName?: string;
  recommendedAlternativeToolId?: ToolId;
  recommendedAlternativeToolName?: string;
  isOptimal?: boolean;
};

function buildResult(
  entry: ToolEntry,
  tool: typeof TOOLS[ToolId],
  currentPlan: (typeof tool.plans)[number],
  overrides: BuildResultOverrides
): ToolAuditResult {
  const monthlySavings = Math.max(0, entry.monthlySpend - overrides.estimatedMonthlyCost);
  const isOptimal = overrides.isOptimal ?? overrides.recommendedAction === "stay";
  const credexOpportunity =
    !isOptimal && overrides.estimatedMonthlyCost > 50;
  const credexEstimatedMonthlySavings = credexOpportunity
    ? Math.round(overrides.estimatedMonthlyCost * CREDEX_DISCOUNT_RANGE.min)
    : undefined;

  return {
    toolId: entry.toolId,
    toolName: tool.name,
    currentPlanName: currentPlan.name,
    currentMonthlySpend: entry.monthlySpend,
    recommendedAction: overrides.recommendedAction,
    recommendedPlanId: overrides.recommendedPlanId,
    recommendedPlanName: overrides.recommendedPlanName,
    recommendedAlternativeToolId: overrides.recommendedAlternativeToolId,
    recommendedAlternativeToolName: overrides.recommendedAlternativeToolName,
    estimatedMonthlyCost: overrides.estimatedMonthlyCost,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason: overrides.reason,
    credexOpportunity,
    credexEstimatedMonthlySavings,
    isOptimal,
  };
}

/**
 * Returns the next-lower plan for a tool (sorted by price descending).
 * "Lower" means cheaper — used for downgrade recommendations.
 */
function getNextLowerPlan(
  tool: typeof TOOLS[ToolId],
  currentPlanId: string
): (typeof tool.plans)[number] | undefined {
  const currentPlan = tool.plans.find((p) => p.id === currentPlanId);
  if (!currentPlan) return undefined;

  return tool.plans
    .filter(
      (p) =>
        p.id !== currentPlanId &&
        p.pricePerSeatPerMonth < currentPlan.pricePerSeatPerMonth &&
        p.pricePerSeatPerMonth >= 0
    )
    .sort((a, b) => b.pricePerSeatPerMonth - a.pricePerSeatPerMonth)[0];
}

/**
 * Returns a human-readable description of features added by the given plan
 * (used for downgrade explanations).
 */
function getPlanUpgradeFeatures(toolId: ToolId, planId: string): string {
  const featureMap: Partial<Record<string, string>> = {
    "cursor-business": "SSO, admin dashboard, enforced privacy mode",
    "copilot-enterprise": "codebase customisation, fine-tuned models",
    "copilot-business": "policy management, audit logs",
    "claude-max-5x": "Opus access, 5× message limits",
    "claude-max-20x": "20× message limits, priority access",
    "claude-team": "centralised billing, admin controls",
    "chatgpt-team": "admin console, increased rate limits",
    "windsurf-teams": "admin controls, priority support",
    "gemini-business": "Workspace integration, admin console",
  };
  return featureMap[planId] ?? "advanced admin and compliance features";
}

// ---------------------------------------------------------------------------
// EXPORTS FOR TESTING
// ---------------------------------------------------------------------------
export {
  auditSingleTool,
  getNextLowerPlan,
  checkUseCaseMismatch,
  checkDowngrade,
  checkAlternative,
};
