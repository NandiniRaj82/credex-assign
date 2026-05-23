import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// SUPABASE CLIENT — Browser (uses anon key, subject to RLS)
// ---------------------------------------------------------------------------
export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ---------------------------------------------------------------------------
// SUPABASE CLIENT — Server (uses service role key, bypasses RLS)
// Only import this in API routes / Server Actions — never expose to browser.
// ---------------------------------------------------------------------------
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ---------------------------------------------------------------------------
// DATABASE TYPES
// ---------------------------------------------------------------------------
export type AuditRow = {
  id: string;
  slug: string;
  form_data: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
};

export type LeadRow = {
  id: string;
  audit_id: string | null;
  email: string;
  company: string | null;
  role: string | null;
  team_size: number | null;
  monthly_savings: number | null;
  high_value: boolean;
  email_sent: boolean;
  created_at: string;
};
