import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AuditResult } from "@/lib/audit-engine";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// INPUT VALIDATION
// ---------------------------------------------------------------------------

const SummaryRequestSchema = z.object({
  auditResult: z.object({
    totalMonthlySpend: z.number(),
    totalMonthlySavings: z.number(),
    totalAnnualSavings: z.number(),
    isHighValueCase: z.boolean(),
    isAlreadyOptimal: z.boolean(),
    input: z.object({
      teamSize: z.number(),
      primaryUseCase: z.string(),
    }),
    results: z.array(
      z.object({
        toolName: z.string(),
        currentPlanName: z.string(),
        recommendedAction: z.string(),
        monthlySavings: z.number(),
        reason: z.string(),
      })
    ),
  }),
});

// ---------------------------------------------------------------------------
// POST /api/summary
// Returns a streamed AI-generated narrative summary of the audit.
// Falls back to a template if the Anthropic API fails.
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ summary: buildFallback(null) }, { status: 200 });
  }

  const parsed = SummaryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { summary: buildFallback(null) },
      { status: 200 }
    );
  }

  const { auditResult } = parsed.data;

  // Build the prompt — see PROMPTS.md for full rationale
  const toolSummaries = auditResult.results
    .map(
      (r) =>
        `- ${r.toolName} (${r.currentPlanName}): ${r.recommendedAction === "stay" ? "optimal" : `action="${r.recommendedAction}", saves $${r.monthlySavings}/mo — ${r.reason}`}`
    )
    .join("\n");

  const prompt = `You are a concise, numbers-first AI spend analyst. Write a single paragraph of exactly 80–110 words summarising this AI tool audit for a startup.

AUDIT DATA:
- Team size: ${auditResult.input.teamSize} people
- Primary use case: ${auditResult.input.primaryUseCase}
- Total current monthly AI spend: $${auditResult.totalMonthlySpend}
- Total monthly savings identified: $${auditResult.totalMonthlySavings}
- Total annual savings identified: $${auditResult.totalAnnualSavings}
- Tool breakdown:
${toolSummaries}

RULES:
1. Lead with the headline number (total monthly savings, or "spending efficiently" if none).
2. Call out the biggest single saving opportunity by tool name and dollar amount.
3. End with a forward-looking sentence about what to do next.
4. Tone: direct, smart, no jargon, no fluff. Like a CFO's hot take.
5. Do NOT use bullet points. One paragraph only.
6. Do NOT include $ signs at the start of the paragraph.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const summary =
      message.content[0]?.type === "text"
        ? message.content[0].text
        : buildFallback(auditResult as unknown as AuditResult);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[summary] Anthropic API error:", err);
    return NextResponse.json(
      { summary: buildFallback(auditResult as unknown as AuditResult) },
      { status: 200 }
    );
  }
}

// ---------------------------------------------------------------------------
// FALLBACK TEMPLATE
// Used when Anthropic API is unavailable or the key is not set.
// ---------------------------------------------------------------------------

function buildFallback(result: AuditResult | null): string {
  if (!result) {
    return "Your AI spend audit is complete. Review the recommendations below to identify where your team can optimise costs without sacrificing capability.";
  }

  if (result.isAlreadyOptimal) {
    return `Your team of ${result.input.teamSize} is running a well-optimised AI stack for ${result.input.primaryUseCase} work. Current spend of $${result.totalMonthlySpend}/month is aligned with your plan pricing — no major changes recommended right now. Set a quarterly review to catch plan changes as your team grows.`;
  }

  const biggestWin = [...result.results].sort(
    (a, b) => b.monthlySavings - a.monthlySavings
  )[0];

  return `Your team of ${result.input.teamSize} is spending $${result.totalMonthlySpend}/month on AI tools — and we found $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) in actionable savings. The biggest opportunity is ${biggestWin?.toolName ?? "your current tooling"}, where a plan adjustment could save $${biggestWin?.monthlySavings ?? 0}/month with no capability loss. Review the recommendations below and implement the top change this week.`;
}
