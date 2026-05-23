import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { runAudit } from "@/lib/audit-engine";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import type { AuditInput } from "@/lib/audit-engine";

// ---------------------------------------------------------------------------
// INPUT VALIDATION
// ---------------------------------------------------------------------------

const ToolEntrySchema = z.object({
  toolId: z.enum([
    "cursor",
    "github-copilot",
    "claude",
    "chatgpt",
    "anthropic-api",
    "openai-api",
    "gemini",
    "windsurf",
  ]),
  planId: z.string().min(1),
  seats: z.number().int().min(1).max(10000),
  monthlySpend: z.number().min(0).max(1000000),
});

const AuditInputSchema = z.object({
  tools: z.array(ToolEntrySchema).min(1).max(8),
  teamSize: z.number().int().min(1).max(100000),
  primaryUseCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
});

// ---------------------------------------------------------------------------
// POST /api/audit
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(ip, 15, 60 * 60 * 1000); // 15/hr
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  // Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = AuditInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input: AuditInput = parsed.data;

  // Run the audit engine (pure function — no I/O)
  let result;
  try {
    result = runAudit(input);
  } catch (err) {
    console.error("[audit] Engine error:", err);
    return NextResponse.json(
      { error: "Failed to run audit. Please check your input." },
      { status: 500 }
    );
  }

  // Generate unique slug for shareable URL
  const slug = nanoid(10);

  // Sanitize form data for public storage — strip any PII
  const publicFormData = {
    tools: input.tools,
    teamSize: input.teamSize,
    primaryUseCase: input.primaryUseCase,
  };

  // Save to Supabase
  const supabase = createServerClient();
  const { error: dbError } = await supabase.from("audits").insert({
    slug,
    form_data: publicFormData,
    result: result as unknown as Record<string, unknown>,
  });

  if (dbError) {
    console.error("[audit] DB insert error:", dbError);
    // Still return the result even if DB fails — don't block the user
    return NextResponse.json({ slug: `local-${nanoid(6)}`, result });
  }

  return NextResponse.json({ slug, result }, { status: 201 });
}
