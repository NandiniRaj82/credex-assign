"use client";

import Link from "next/link";
import { ArrowRight, TrendingDown, Zap, Shield, BarChart3, CheckCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// ANIMATION VARIANTS
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: <TrendingDown size={20} />,
    title: "Plan-fit analysis",
    desc: "Check if you're on the right plan for your team size and use case — with the math to back it.",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Cross-tool benchmarks",
    desc: "Compare equivalent tools by capability and cost. Not opinions — actual pricing.",
  },
  {
    icon: <Zap size={20} />,
    title: "Instant results",
    desc: "No waiting, no email required to see your audit. Results in under 10 seconds.",
  },
  {
    icon: <Shield size={20} />,
    title: "No login required",
    desc: "We show you value first. Email is optional and only asked after your audit is ready.",
  },
];

const TOOLS_SUPPORTED = [
  "Cursor", "GitHub Copilot", "Claude", "ChatGPT",
  "Anthropic API", "OpenAI API", "Gemini", "Windsurf",
];

const TESTIMONIALS = [
  {
    quote: "Found $1,800/year we were wasting on GitHub Copilot Enterprise seats we didn't need.",
    name: "S.K.",
    role: "CTO, Series A startup",
    savings: "$1,800/yr",
  },
  {
    quote: "We had 12 Claude Pro seats for a team of 4. StackLens caught it in 30 seconds.",
    name: "M.R.",
    role: "Engineering Manager",
    savings: "$960/yr",
  },
  {
    quote: "The audit told us what our finance team couldn't — we were paying retail for tokens we could get at 25% off.",
    name: "A.T.",
    role: "Founder, AI startup",
    savings: "$4,200/yr",
  },
];

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div style={{ background: "var(--color-bg-base)" }} className="min-h-screen">
      {/* ------------------------------------------------------------------ */}
      {/* NAV                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <nav
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(20px)",
        }}
        className="sticky top-0 z-40"
      >
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--color-accent), var(--color-blue))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart3 size={14} color="#000" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text-primary)" }}>
              StackLens
            </span>
          </div>
          <Link href="/audit" className="btn btn-primary btn-sm" id="nav-cta">
            Audit My Stack
          </Link>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 80 }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: 24, display: "inline-block" }}>
            <span className="badge badge-savings">
              <CheckCircle2 size={11} />
              Free — No login required
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            style={{ fontSize: "clamp(36px, 6vw, 64px)", marginBottom: 24, lineHeight: 1.1 }}
          >
            Is your startup{" "}
            <span className="gradient-text">overpaying</span>
            {" "}for AI tools?
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 18,
              color: "var(--color-text-secondary)",
              marginBottom: 40,
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto 40px",
            }}
          >
            Enter your AI tool subscriptions and get an instant, finance-literate audit
            showing exactly where you can save — with the math to back every recommendation.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/audit" className="btn btn-primary btn-lg" id="hero-cta-primary">
              Audit My AI Spend
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="btn btn-secondary btn-lg"
              id="hero-cta-secondary"
            >
              How it works
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.p
            variants={fadeUp}
            style={{
              marginTop: 24,
              fontSize: 13,
              color: "var(--color-text-muted)",
            }}
          >
            <span style={{ color: "var(--color-accent)" }}>★★★★★</span>
            {" "}Trusted by 200+ startups · Average savings found: <strong style={{ color: "var(--color-text-secondary)" }}>$2,400/year</strong>
            {" "}· <em style={{ color: "var(--color-text-muted)", fontSize: 11 }}>(mocked — indicate pre-launch)</em>
          </motion.p>
        </motion.div>

        {/* Hero visual — animated spending dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginTop: 64 }}
        >
          <HeroDashboardMock />
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TOOLS SUPPORTED                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section style={{ borderTop: "1px solid var(--color-border)", padding: "32px 0" }}>
        <div className="container">
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
            Supports all major AI tools
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {TOOLS_SUPPORTED.map((tool) => (
              <span
                key={tool}
                style={{
                  padding: "6px 16px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg-elevated)",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                }}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section id="how-it-works" style={{ padding: "96px 0" }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            style={{ textAlign: "center", marginBottom: 64 }}
          >
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(28px, 4vw, 42px)", marginBottom: 16 }}>
              Audit in 3 steps
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: "var(--color-text-secondary)", fontSize: 17 }}>
              No spreadsheets. No waiting. Instant clarity on your AI spend.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}
          >
            {[
              {
                step: "01",
                title: "Enter your tools",
                desc: "Tell us which AI tools you pay for, which plan, how many seats, and what you're actually paying. Takes 2 minutes.",
              },
              {
                step: "02",
                title: "Get your audit",
                desc: "Our engine checks plan fit, seat efficiency, cheaper alternatives, and credits opportunities. Every number is cited.",
              },
              {
                step: "03",
                title: "Take action",
                desc: "Get a shareable report with specific, prioritised recommendations. Save it, share it with your team, or book a Credex call.",
              },
            ].map(({ step, title, desc }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="card"
                style={{ padding: 32, position: "relative", overflow: "hidden" }}
              >
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 900,
                    color: "var(--color-border)",
                    lineHeight: 1,
                    position: "absolute",
                    top: 16,
                    right: 24,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step}
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 12, marginTop: 0 }}>{title}</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURES                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section style={{ padding: "0 0 96px" }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}
          >
            {FEATURES.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                style={{
                  padding: 24,
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  transition: "border-color 0.2s",
                }}
                whileHover={{ borderColor: "var(--color-accent-border)" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--color-accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-accent)",
                    marginBottom: 16,
                  }}
                >
                  {icon}
                </div>
                <h3 style={{ fontSize: 15, marginBottom: 8, marginTop: 0 }}>{title}</h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TESTIMONIALS                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section style={{ padding: "0 0 96px" }}>
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <motion.h2 variants={fadeUp} style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 8 }}>
              What founders found
            </motion.h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
              <em>(Mocked testimonials — indicate pre-launch)</em>
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}
          >
            {TESTIMONIALS.map(({ quote, name, role, savings }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="card"
                style={{ padding: 28 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--color-accent)" color="var(--color-accent)" />
                  ))}
                </div>
                <p style={{ color: "var(--color-text-primary)", fontSize: 15, lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{role}</p>
                  </div>
                  <span className="badge badge-savings">{savings}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA SECTION                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section style={{ padding: "0 0 120px" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="animate-pulse-glow"
            style={{
              textAlign: "center",
              padding: "64px 40px",
              borderRadius: "var(--radius-xl)",
              background: "linear-gradient(135deg, rgba(16, 217, 160, 0.08), rgba(14, 165, 233, 0.08))",
              border: "1px solid var(--color-accent-border)",
            }}
          >
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 16 }}>
              Stop guessing. Start saving.
            </h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: 17, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
              Most startups overspend on AI tools by 20–40%. Your audit is free, takes 2 minutes, and doesn&apos;t require an account.
            </p>
            <Link href="/audit" className="btn btn-primary btn-lg" id="footer-cta">
              Run My Free Audit
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                              */}
      {/* ------------------------------------------------------------------ */}
      <footer style={{ borderTop: "1px solid var(--color-border)", padding: "32px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--color-text-secondary)" }}>StackLens</span>
            <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              · A free tool by{" "}
              <a href="https://credex.rocks" style={{ color: "var(--color-accent)", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">
                Credex
              </a>
            </span>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 12, margin: 0 }}>
            Pricing data verified weekly. All recommendations are suggestions — consult your team before making changes.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HERO DASHBOARD MOCK — Visual showing the audit result preview
// ---------------------------------------------------------------------------

function HeroDashboardMock() {
  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        background: "var(--color-bg-card)",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--color-bg-elevated)",
        }}
      >
        {["#f43f5e", "#f59e0b", "#10d9a0"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            color: "var(--color-text-muted)",
          }}
        >
          stacklens.app/results/audit-preview
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 28px" }}>
        {/* Savings hero */}
        <div style={{ textAlign: "center", marginBottom: 28, padding: "24px", background: "var(--color-accent-dim)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-accent-border)" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            Monthly Savings Found
          </p>
          <p className="savings-number" style={{ margin: "0 0 4px", fontSize: 48, fontWeight: 800, color: "var(--color-accent)" }}>
            $1,340
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>
            = <strong style={{ color: "var(--color-text-secondary)" }}>$16,080/year</strong> in recoverable AI spend
          </p>
        </div>

        {/* Tool rows */}
        {[
          { tool: "Cursor Business", action: "Downgrade to Pro", savings: "$400/mo", badge: "badge-savings", actionLabel: "Downgrade" },
          { tool: "GitHub Copilot Enterprise", action: "Switch to Business tier", savings: "$200/mo", badge: "badge-savings", actionLabel: "Switch plan" },
          { tool: "Claude Pro", action: "Already optimal for your team", savings: "—", badge: "badge-optimal", actionLabel: "Optimal ✓" },
          { tool: "OpenAI API", action: "Consider Credex credits", savings: "$740/mo", badge: "badge-savings", actionLabel: "Save via credits" },
        ].map(({ tool, action, savings, badge, actionLabel }) => (
          <div
            key={tool}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: "1px solid var(--color-border-subtle)",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{tool}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{action}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {savings !== "—" && (
                <span style={{ fontWeight: 700, color: "var(--color-accent)", fontSize: 15 }}>{savings}</span>
              )}
              <span className={`badge ${badge}`} style={{ fontSize: 11 }}>{actionLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
