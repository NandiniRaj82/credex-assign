import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createBrowserClient } from "@/lib/supabase";
import type { AuditResult } from "@/lib/audit-engine";
import ResultsClient from "./ResultsClient";

// ---------------------------------------------------------------------------
// FETCH AUDIT
// ---------------------------------------------------------------------------

async function getAudit(slug: string): Promise<AuditResult | null> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("audits")
      .select("result, created_at, slug")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;
    return data.result as unknown as AuditResult;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// METADATA — Server-side for OG tags on shareable URLs
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getAudit(id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://stacklens.app";

  if (!result) {
    return {
      title: "Audit Not Found | StackLens",
    };
  }

  const savingsText =
    result.totalMonthlySavings > 0
      ? `$${result.totalMonthlySavings.toFixed(0)}/mo in savings found`
      : "AI spend is already optimised";

  const title = `AI Spend Audit — ${savingsText} | StackLens`;
  const description = `${result.input.teamSize}-person team, ${result.input.tools.length} AI tools audited. ${savingsText}. See the full breakdown.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/results/${id}`,
      siteName: "StackLens",
      type: "website",
      images: [
        {
          url: `${appUrl}/api/og?id=${id}&savings=${result.totalMonthlySavings.toFixed(0)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${appUrl}/api/og?id=${id}&savings=${result.totalMonthlySavings.toFixed(0)}`],
    },
  };
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAudit(id);

  if (!result) {
    notFound();
  }

  return <ResultsClient result={result} slug={id} />;
}
