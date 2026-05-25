"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  ArrowUpRight,
  Share2,
  Check,
  Mail,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BarChart3,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import type { AuditResult, ToolAuditResult } from "@/lib/audit-engine";

// ---------------------------------------------------------------------------
// ACTION LABEL MAP
// ---------------------------------------------------------------------------

const ACTION_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ReactNode; color: string }
> = {
  stay: {
    label: "Optimal ✓",
    badgeClass: "badge-optimal",
    icon: <CheckCircle2 size={13} />,
    color: "var(--color-blue)",
  },
  downgrade: {
    label: "Downgrade",
    badgeClass: "badge-savings",
    icon: <TrendingDown size={13} />,
    color: "var(--color-accent)",
  },
  switch: {
    label: "Switch tool",
    badgeClass: "badge-savings",
    icon: <ArrowUpRight size={13} />,
    color: "var(--color-accent)",
  },
  "reduce-seats": {
    label: "Reduce seats",
    badgeClass: "badge-savings",
    icon: <TrendingDown size={13} />,
    color: "var(--color-accent)",
  },
  "review-usage": {
    label: "Review usage",
    badgeClass: "badge-warning",
    icon: <AlertTriangle size={13} />,
    color: "var(--color-amber)",
  },
};

// ---------------------------------------------------------------------------
// MAIN CLIENT COMPONENT
// ---------------------------------------------------------------------------

export default function ResultsClient({
  result,
  slug,
}: {
  result: AuditResult;
  slug: string;
}) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  // Fetch AI summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditResult: result }),
        });
        const { summary } = (await res.json()) as { summary: string };
        setAiSummary(summary);
      } catch {
        setAiSummary(
          "Your audit is complete. Review the per-tool recommendations below to prioritise your next savings action."
        );
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummary();
  }, [result]);

  // Share URL
  const handleShare = async () => {
    const url = `${window.location.origin}/results/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      window.open(
        `https://twitter.com/intent/tweet?text=Just%20audited%20our%20AI%20tool%20spend%20with%20StackLens%20%E2%80%94%20found%20%24${result.totalMonthlySavings.toFixed(0)}%2Fmo%20in%20savings%20%F0%9F%A4%AF&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    }
  };

  const APP_URL = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(10, 10, 15, 0.9)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className="container"
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "linear-gradient(135deg, var(--color-accent), var(--color-blue))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart3 size={12} color="#000" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--color-text-primary)",
              }}
            >
              StackLens
            </span>
          </Link>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary btn-sm"
              id="share-btn"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={() => setShowLeadModal(true)}
              className="btn btn-primary btn-sm"
              id="get-report-nav"
            >
              <Mail size={14} />
              Get Report
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 860 }}>
        {/* ---------------------------------------------------------------- */}
        {/* SAVINGS HERO                                                       */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          {result.totalMonthlySavings > 0 ? (
            <>
              <p
                style={{
                  color: "var(--color-accent)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                💰 Savings found for your stack
              </p>
              <div
                style={{
                  display: "inline-block",
                  padding: "40px 60px",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--color-accent-dim)",
                  border: "1px solid var(--color-accent-border)",
                  marginBottom: 24,
                }}
                className="animate-pulse-glow"
              >
                <p
                  className="savings-number"
                  style={{
                    fontSize: "clamp(56px, 10vw, 96px)",
                    fontWeight: 900,
                    color: "var(--color-accent)",
                    margin: 0,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  ${result.totalMonthlySavings.toFixed(0)}
                  <span style={{ fontSize: "0.35em", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                    /mo
                  </span>
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
                    color: "var(--color-text-secondary)",
                    fontSize: 16,
                  }}
                >
                  ={" "}
                  <strong style={{ color: "var(--color-text-primary)", fontSize: 20 }}>
                    ${result.totalAnnualSavings.toFixed(0)}
                  </strong>
                  /year in recoverable AI spend
                </p>
              </div>

              <p style={{ color: "var(--color-text-secondary)", fontSize: 15, margin: 0 }}>
                From{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  ${result.totalMonthlySpend.toFixed(0)}/mo
                </strong>{" "}
                current spend →{" "}
                <strong style={{ color: "var(--color-accent)" }}>
                  ${result.totalOptimalMonthlySpend.toFixed(0)}/mo
                </strong>{" "}
                optimal
              </p>
            </>
          ) : (
            <div
              style={{
                padding: "40px",
                borderRadius: "var(--radius-xl)",
                background: "var(--color-blue-dim)",
                border: "1px solid var(--color-blue-border)",
                marginBottom: 24,
              }}
            >
              <CheckCircle2
                size={40}
                color="var(--color-blue)"
                style={{ marginBottom: 16 }}
              />
              <h2
                style={{
                  fontSize: 28,
                  color: "var(--color-blue)",
                  marginBottom: 8,
                }}
              >
                You&apos;re spending well
              </h2>
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 16,
                  margin: 0,
                  maxWidth: 480,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Your AI stack of ${result.totalMonthlySpend.toFixed(0)}/mo is
                well-aligned to your team&apos;s needs. No major changes
                recommended right now.
              </p>
            </div>
          )}
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* AI SUMMARY                                                        */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card"
          style={{ padding: 28, marginBottom: 32 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Sparkles size={16} color="var(--color-accent)" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--color-accent)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              AI-generated summary
            </span>
          </div>

          {summaryLoading ? (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Loader2
                size={16}
                color="var(--color-text-muted)"
                style={{ animation: "spin 1s linear infinite", flexShrink: 0, marginTop: 2 }}
              />
              <div style={{ flex: 1 }}>
                {[85, 70, 50].map((w) => (
                  <div
                    key={w}
                    className="skeleton"
                    style={{ height: 16, width: `${w}%`, marginBottom: 8 }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                color: "var(--color-text-secondary)",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {aiSummary}
            </p>
          )}
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* CREDEX CTA (HIGH VALUE)                                           */}
        {/* ---------------------------------------------------------------- */}
        {result.isHighValueCase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              padding: 28,
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, rgba(16,217,160,0.06), rgba(14,165,233,0.06))",
              border: "1px solid var(--color-accent-border)",
              marginBottom: 32,
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <p
                style={{
                  margin: "0 0 8px",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "var(--color-accent)",
                }}
              >
                🎯 Capture even more savings with Credex
              </p>
              <p
                style={{
                  margin: 0,
                  color: "var(--color-text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                You&apos;re in the top tier for AI savings opportunity. Credex sells
                discounted AI infrastructure credits — Cursor, Claude, ChatGPT Enterprise,
                and more — at 15–30% off retail. With{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  ${result.totalMonthlySavings.toFixed(0)}/mo
                </strong>{" "}
                identified, a Credex consultation typically unlocks an additional 15%
                on top of plan optimisations.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              id="credex-cta"
              style={{ flexShrink: 0 }}
            >
              Book Credex consultation
              <ExternalLink size={14} />
            </a>
          </motion.div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* LOW SAVINGS — NOTIFY CTA                                          */}
        {/* ---------------------------------------------------------------- */}
        {result.isAlreadyOptimal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              padding: 24,
              borderRadius: "var(--radius-lg)",
              background: "var(--color-blue-dim)",
              border: "1px solid var(--color-blue-border)",
              marginBottom: 32,
              display: "flex",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "var(--color-blue)" }}>
                Stay ahead of price changes
              </p>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 13 }}>
                Get notified when new savings opportunities apply to your stack as AI tool pricing evolves.
              </p>
            </div>
            <button
              onClick={() => setShowLeadModal(true)}
              className="btn btn-secondary btn-sm"
              id="notify-cta"
            >
              <Mail size={14} />
              Notify me
            </button>
          </motion.div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* PER-TOOL BREAKDOWN                                                */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Per-tool breakdown</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.results.map((toolResult, i) => (
              <motion.div
                key={toolResult.toolId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
              >
                <ToolCard
                  toolResult={toolResult}
                  isExpanded={expandedTool === toolResult.toolId}
                  onToggle={() =>
                    setExpandedTool(
                      expandedTool === toolResult.toolId ? null : toolResult.toolId
                    )
                  }
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* BOTTOM CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            marginTop: 48,
            padding: 28,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>
              Save this report & share it with your team
            </p>
            <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 13 }}>
              Email yourself a copy and get notified when new savings apply to your stack.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary btn-sm"
              id="bottom-share"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={() => setShowLeadModal(true)}
              className="btn btn-primary btn-sm"
              id="bottom-email"
            >
              <Mail size={14} />
              Email my report
            </button>
          </div>
        </motion.div>

        {/* Audit again */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href="/audit"
            className="btn btn-ghost btn-sm"
            id="audit-again"
          >
            <RefreshCw size={14} />
            Run a new audit
          </a>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* LEAD CAPTURE MODAL                                                  */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {showLeadModal && (
          <LeadCaptureModal
            result={result}
            slug={slug}
            appUrl={APP_URL}
            onClose={() => setShowLeadModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TOOL CARD
// ---------------------------------------------------------------------------

function ToolCard({
  toolResult,
  isExpanded,
  onToggle,
}: {
  toolResult: ToolAuditResult;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = ACTION_CONFIG[toolResult.recommendedAction] ?? ACTION_CONFIG.stay;

  return (
    <div
      className="card"
      style={{ overflow: "hidden", cursor: "pointer" }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              {toolResult.toolName}
            </h3>
            <span
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                background: "var(--color-bg-elevated)",
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
              }}
            >
              {toolResult.currentPlanName}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
            ${toolResult.currentMonthlySpend.toFixed(0)}/mo current
            {toolResult.recommendedAction !== "stay" && (
              <>
                {" → "}
                <span style={{ color: "var(--color-accent)" }}>
                  ${toolResult.estimatedMonthlyCost.toFixed(0)}/mo optimal
                </span>
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {toolResult.monthlySavings > 0 && (
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--color-accent)",
                }}
              >
                -${toolResult.monthlySavings.toFixed(0)}/mo
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-muted)" }}>
                ${toolResult.annualSavings.toFixed(0)}/yr
              </p>
            </div>
          )}
          <span className={`badge ${config.badgeClass}`} style={{ gap: 4 }}>
            {config.icon}
            {config.label}
          </span>
          <div style={{ color: "var(--color-text-muted)" }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "0 20px 20px",
                borderTop: "1px solid var(--color-border-subtle)",
                paddingTop: 16,
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 14,
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                <strong style={{ color: config.color }}>Recommendation:</strong>{" "}
                {toolResult.reason}
              </p>

              {(toolResult.recommendedPlanName ||
                toolResult.recommendedAlternativeToolName) && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-accent-dim)",
                    border: "1px solid var(--color-accent-border)",
                    fontSize: 13,
                    color: "var(--color-accent)",
                    fontWeight: 600,
                  }}
                >
                  <ArrowUpRight size={14} />
                  Switch to:{" "}
                  {toolResult.recommendedAlternativeToolName
                    ? `${toolResult.recommendedAlternativeToolName}${toolResult.recommendedPlanName ? ` — ${toolResult.recommendedPlanName}` : ""}`
                    : toolResult.recommendedPlanName}
                </div>
              )}

              {toolResult.credexOpportunity &&
                toolResult.credexEstimatedMonthlySavings && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 14px",
                      borderRadius: "var(--radius-sm)",
                      background: "rgba(14,165,233,0.08)",
                      border: "1px solid var(--color-blue-border)",
                      fontSize: 13,
                      color: "var(--color-blue)",
                    }}
                  >
                    <Sparkles size={13} />
                    Credex credits could save an additional ~$
                    {toolResult.credexEstimatedMonthlySavings.toFixed(0)}/mo on top
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LEAD CAPTURE MODAL
// ---------------------------------------------------------------------------

function LeadCaptureModal({
  result,
  slug,
  appUrl,
  onClose,
}: {
  result: AuditResult;
  slug: string;
  appUrl: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company: company || undefined,
          role: role || undefined,
          website, // honeypot
          auditSlug: slug,
          totalMonthlySavings: result.totalMonthlySavings,
          totalAnnualSavings: result.totalAnnualSavings,
          isHighValue: result.isHighValueCase,
          toolCount: result.results.length,
        }),
      });

      if (!res.ok) {
        const { error: err } = (await res.json()) as { error?: string };
        throw new Error(err ?? "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="card"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 36,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            padding: 4,
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <CheckCircle2
              size={48}
              color="var(--color-accent)"
              style={{ marginBottom: 16 }}
            />
            <h3 style={{ fontSize: 22, marginBottom: 12 }}>Report sent!</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 15, marginBottom: 24 }}>
              Check your inbox for your full audit report.
              {result.isHighValueCase && (
                <> A member of the Credex team will reach out within 2 business days.</>
              )}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href={`${appUrl}/results/${slug}`}
                className="btn btn-secondary"
                id="modal-share-link"
                style={{ textDecoration: "none" }}
              >
                <Share2 size={14} />
                Share your audit
              </a>
              <button onClick={onClose} className="btn btn-ghost btn-sm">
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Get your report by email</h3>
              {result.totalMonthlySavings > 0 ? (
                <p style={{ color: "var(--color-text-secondary)", fontSize: 14, margin: 0 }}>
                  We&apos;ll send your full audit with the{" "}
                  <strong style={{ color: "var(--color-accent)" }}>
                    ${result.totalMonthlySavings.toFixed(0)}/mo savings breakdown
                  </strong>{" "}
                  straight to your inbox.
                </p>
              ) : (
                <p style={{ color: "var(--color-text-secondary)", fontSize: 14, margin: 0 }}>
                  We&apos;ll notify you when new savings opportunities apply to your AI stack.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Honeypot — hidden from real users */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div>
                <label htmlFor="modal-email" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                  Work email *
                </label>
                <input
                  id="modal-email"
                  type="email"
                  className="input-base"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label htmlFor="modal-company" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                    Company <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="modal-company"
                    type="text"
                    className="input-base"
                    placeholder="Acme Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="modal-role" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>
                    Your role <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="modal-role"
                    type="text"
                    className="input-base"
                    placeholder="CTO / Eng Manager"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--color-red)", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={13} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                id="modal-submit"
                style={{ marginTop: 4 }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send my report
                  </>
                )}
              </button>

              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-muted)", textAlign: "center" }}>
                No spam. Unsubscribe anytime. Your spending data is not shared.
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
