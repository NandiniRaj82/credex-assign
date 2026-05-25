import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { sendAuditEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// INPUT VALIDATION
// ---------------------------------------------------------------------------

const LeadSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  company: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  auditSlug: z.string().min(1),
  // Honeypot — bots fill this, humans don't see it
  website: z.string().max(0).optional(),
  // hCaptcha token
  hcaptchaToken: z.string().optional(),
  // Audit summary data for email
  totalMonthlySavings: z.number().min(0).optional(),
  totalAnnualSavings: z.number().min(0).optional(),
  isHighValue: z.boolean().optional(),
  toolCount: z.number().int().min(1).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/lead
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Rate limit by IP — leads are more valuable, so stricter limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(ip, 5, 60 * 60 * 1000); // 5/hr
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // --- Honeypot check — silent reject if bot filled the website field ---
  if (data.website && data.website.length > 0) {
    // Pretend success to not tip off bots
    return NextResponse.json({ success: true }, { status: 201 });
  }

  // --- hCaptcha verification ---
  if (data.hcaptchaToken && process.env.HCAPTCHA_SECRET_KEY) {
    const isValid = await verifyHcaptcha(data.hcaptchaToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 }
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseReady = supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project");

  if (!supabaseReady) {
    console.warn("[lead] Supabase env vars not configured — skipping DB insert and email");
    return NextResponse.json({ success: true, isHighValue: (data.totalMonthlySavings ?? 0) >= 500 }, { status: 201 });
  }

  const supabase = createServerClient();

  // --- Look up the audit by slug to get its UUID ---
  const { data: auditRow, error: auditError } = await supabase
    .from("audits")
    .select("id")
    .eq("slug", data.auditSlug)
    .single();

  if (auditError || !auditRow) {
    console.warn("[lead] Audit not found for slug:", data.auditSlug);
  }

  const isHighValue = data.isHighValue ?? (data.totalMonthlySavings ?? 0) >= 500;

  // --- Upsert lead (don't error if duplicate email for same audit) ---
  let lead: { id: string } | null = null;
  try {
    const { data: insertedLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        audit_id: auditRow?.id ?? null,
        email: data.email,
        company: data.company ?? null,
        role: data.role ?? null,
        team_size: data.teamSize ?? null,
        monthly_savings: data.totalMonthlySavings ?? null,
        high_value: isHighValue,
        email_sent: false,
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("[lead] DB insert error:", leadError);
    } else {
      lead = insertedLead;
    }
  } catch (err) {
    console.error("[lead] Supabase client error:", err);
  }

  // --- Send confirmation email (non-blocking) ---
  if (lead) {
    try {
      const emailSent = await sendAuditEmail({
        to: data.email,
        auditSlug: data.auditSlug,
        totalMonthlySavings: data.totalMonthlySavings ?? 0,
        totalAnnualSavings: data.totalAnnualSavings ?? 0,
        isHighValue,
        toolCount: data.toolCount ?? 1,
      });

      if (emailSent) {
        await supabase
          .from("leads")
          .update({ email_sent: true })
          .eq("id", lead.id);
      }
    } catch (err) {
      console.error("[lead] Email send error:", err);
    }
  }

  return NextResponse.json({ success: true, isHighValue }, { status: 201 });

}

// ---------------------------------------------------------------------------
// hCAPTCHA VERIFICATION
// ---------------------------------------------------------------------------

async function verifyHcaptcha(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: token,
      }),
    });
    const json = (await res.json()) as { success: boolean };
    return json.success;
  } catch {
    console.error("[hcaptcha] Verification request failed");
    return true; // Fail open — don't block real users on captcha API failure
  }
}
