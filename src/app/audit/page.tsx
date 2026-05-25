"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ArrowRight, ArrowLeft, AlertCircle, Loader2, BarChart3 } from "lucide-react";
import type { ToolId, UseCase } from "@/lib/pricing-data";
import { TOOLS } from "@/lib/pricing-data";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

type ToolEntry = {
  id: string;
  toolId: ToolId | "";
  planId: string;
  seats: number;
  monthlySpend: number;
};

type FormState = {
  teamSize: number;
  primaryUseCase: UseCase;
  tools: ToolEntry[];
};

const STORAGE_KEY = "stacklens-audit-form";

const DEFAULT_FORM: FormState = {
  teamSize: 5,
  primaryUseCase: "mixed",
  tools: [
    { id: crypto.randomUUID ? crypto.randomUUID() : "1", toolId: "", planId: "", seats: 1, monthlySpend: 0 },
  ],
};

const USE_CASE_OPTIONS: { value: UseCase; label: string; emoji: string }[] = [
  { value: "coding", label: "Software development", emoji: "💻" },
  { value: "writing", label: "Content & writing", emoji: "✍️" },
  { value: "data", label: "Data & analytics", emoji: "📊" },
  { value: "research", label: "Research", emoji: "🔬" },
  { value: "mixed", label: "Mixed / General", emoji: "⚡" },
];

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function AuditPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = team info, 1 = tools
  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === "undefined") return DEFAULT_FORM;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as FormState;
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_FORM;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);



  // --- Persist to localStorage on change ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // Ignore storage errors
    }
  }, [form]);

  // ---------------------------------------------------------------------------
  // FORM HELPERS
  // ---------------------------------------------------------------------------

  const updateForm = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  }, []);

  const addTool = () => {
    setForm((prev) => ({
      ...prev,
      tools: [
        ...prev.tools,
        { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), toolId: "", planId: "", seats: 1, monthlySpend: 0 },
      ],
    }));
  };

  const removeTool = (id: string) => {
    setForm((prev) => ({ ...prev, tools: prev.tools.filter((t) => t.id !== id) }));
  };

  const updateTool = (id: string, update: Partial<ToolEntry>) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.id === id
          ? {
              ...t,
              ...update,
              // Reset plan when tool changes
              ...(update.toolId && update.toolId !== t.toolId ? { planId: "" } : {}),
            }
          : t
      ),
    }));
  };

  // ---------------------------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------------------------

  const validateStep0 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.teamSize || form.teamSize < 1) errs.teamSize = "Team size must be at least 1";
    if (form.teamSize > 100000) errs.teamSize = "That's a very large team — contact us instead";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.tools.length === 0) {
      errs.tools = "Add at least one AI tool";
    }
    form.tools.forEach((tool, i) => {
      if (!tool.toolId) errs[`tool-${i}-toolId`] = "Select a tool";
      if (!tool.planId) errs[`tool-${i}-planId`] = "Select a plan";
      if (tool.seats < 1) errs[`tool-${i}-seats`] = "At least 1 seat";
      if (tool.monthlySpend < 0) errs[`tool-${i}-spend`] = "Enter your monthly spend";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---------------------------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!validateStep1()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        teamSize: form.teamSize,
        primaryUseCase: form.primaryUseCase,
        tools: form.tools.map(({ toolId, planId, seats, monthlySpend }) => ({
          toolId,
          planId,
          seats,
          monthlySpend,
        })),
      };

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to run audit");
      }

      const { slug, result } = (await res.json()) as { slug: string; result: unknown };

      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);

      // If no DB is configured the API returns a local-* slug with the result embedded.
      // Stash it in sessionStorage so the results page can render without a DB query.
      if (slug.startsWith("local-") && result) {
        sessionStorage.setItem(`stacklens-result-${slug}`, JSON.stringify(result));
      }

      router.push(`/results/${slug}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div style={{ background: "var(--color-bg-base)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--color-border)", padding: "0" }}>
        <div className="container" style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, var(--color-accent), var(--color-blue))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart3 size={12} color="#000" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-primary)" }}>StackLens</span>
          </Link>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1].map((s) => (
              <div
                key={s}
                className={`step-dot ${s === step ? "active" : s < step ? "done" : ""}`}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="container" style={{ maxWidth: 720, paddingTop: 56, paddingBottom: 80 }}>
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step0TeamInfo
                form={form}
                errors={errors}
                updateForm={updateForm}
                onNext={() => { if (validateStep0()) setStep(1); }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Step1Tools
                form={form}
                errors={errors}
                submitting={submitting}
                submitError={submitError}
                onBack={() => setStep(0)}
                onAddTool={addTool}
                onRemoveTool={removeTool}
                onUpdateTool={updateTool}
                onSubmit={handleSubmit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 0 — Team Info
// ---------------------------------------------------------------------------

function Step0TeamInfo({
  form,
  errors,
  updateForm,
  onNext,
}: {
  form: FormState;
  errors: Record<string, string>;
  updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <p style={{ color: "var(--color-accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
          Step 1 of 2
        </p>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", marginBottom: 12 }}>
          Tell us about your team
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>
          This helps us tailor our audit recommendations to your actual usage context.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Team size */}
        <FormField label="How many people are on your team?" error={errors.teamSize} id="team-size">
          <input
            id="team-size"
            type="number"
            className={`input-base ${errors.teamSize ? "input-error" : ""}`}
            value={form.teamSize}
            onChange={(e) => updateForm("teamSize", parseInt(e.target.value) || 1)}
            min={1}
            max={100000}
            placeholder="e.g. 12"
          />
        </FormField>

        {/* Primary use case */}
        <FormField label="What's your team's primary use of AI tools?" id="use-case">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {USE_CASE_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                id={`use-case-${value}`}
                onClick={() => updateForm("primaryUseCase", value)}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${form.primaryUseCase === value ? "var(--color-accent)" : "var(--color-border)"}`,
                  background: form.primaryUseCase === value ? "var(--color-accent-dim)" : "var(--color-bg-elevated)",
                  color: form.primaryUseCase === value ? "var(--color-accent)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: form.primaryUseCase === value ? 600 : 400,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ marginRight: 8 }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </FormField>

        <button className="btn btn-primary btn-lg" onClick={onNext} id="step0-next" style={{ alignSelf: "flex-start" }}>
          Next: Enter your tools
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 1 — Tools
// ---------------------------------------------------------------------------

function Step1Tools({
  form,
  errors,
  submitting,
  submitError,
  onBack,
  onAddTool,
  onRemoveTool,
  onUpdateTool,
  onSubmit,
}: {
  form: FormState;
  errors: Record<string, string>;
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onAddTool: () => void;
  onRemoveTool: (id: string) => void;
  onUpdateTool: (id: string, update: Partial<ToolEntry>) => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <p style={{ color: "var(--color-accent)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>
          Step 2 of 2
        </p>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", marginBottom: 12 }}>
          What AI tools are you paying for?
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: 16 }}>
          Add each tool you pay for. Check your billing dashboard for exact amounts.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <AnimatePresence>
          {form.tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ToolRow
                tool={tool}
                index={i}
                errors={errors}
                canRemove={form.tools.length > 1}
                onUpdate={(update) => onUpdateTool(tool.id, update)}
                onRemove={() => onRemoveTool(tool.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add tool button */}
        {form.tools.length < 8 && (
          <button
            type="button"
            onClick={onAddTool}
            id="add-tool"
            className="btn btn-secondary"
            style={{ alignSelf: "flex-start", gap: 8 }}
          >
            <Plus size={16} />
            Add another tool
          </button>
        )}

        {/* Error */}
        {submitError && (
          <div style={{
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-red-dim)",
            border: "1px solid var(--color-red-border)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}>
            <AlertCircle size={16} color="var(--color-red)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, color: "var(--color-red)", fontSize: 14 }}>{submitError}</p>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: "flex", gap: 12, paddingTop: 8, alignItems: "center" }}>
          <button onClick={onBack} className="btn btn-ghost" id="step1-back">
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="btn btn-primary btn-lg"
            id="submit-audit"
          >
            {submitting ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Running audit…
              </>
            ) : (
              <>
                Run My Audit
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        <p style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
          Your data is saved locally and used only to generate your audit. We never store your spending data with your identity unless you choose to share your email.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TOOL ROW
// ---------------------------------------------------------------------------

function ToolRow({
  tool,
  index,
  errors,
  canRemove,
  onUpdate,
  onRemove,
}: {
  tool: ToolEntry;
  index: number;
  errors: Record<string, string>;
  canRemove: boolean;
  onUpdate: (update: Partial<ToolEntry>) => void;
  onRemove: () => void;
}) {
  const toolData = tool.toolId ? TOOLS[tool.toolId] : null;
  const plans = toolData?.plans ?? [];
  const toolOptions = Object.values(TOOLS);

  return (
    <div
      className="card"
      style={{ padding: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Tool {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-ghost btn-sm"
            id={`remove-tool-${index}`}
            style={{ color: "var(--color-red)", padding: "4px 8px" }}
            aria-label={`Remove tool ${index + 1}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Tool */}
        <FormField label="Tool" error={errors[`tool-${index}-toolId`]} id={`tool-${index}-tool`}>
          <select
            id={`tool-${index}-tool`}
            className={`input-base ${errors[`tool-${index}-toolId`] ? "input-error" : ""}`}
            value={tool.toolId}
            onChange={(e) => onUpdate({ toolId: e.target.value as ToolId })}
            style={{ cursor: "pointer" }}
          >
            <option value="">Select tool…</option>
            {toolOptions.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </FormField>

        {/* Plan */}
        <FormField label="Plan" error={errors[`tool-${index}-planId`]} id={`tool-${index}-plan`}>
          <select
            id={`tool-${index}-plan`}
            className={`input-base ${errors[`tool-${index}-planId`] ? "input-error" : ""}`}
            value={tool.planId}
            onChange={(e) => onUpdate({ planId: e.target.value })}
            disabled={!tool.toolId}
            style={{ cursor: tool.toolId ? "pointer" : "not-allowed" }}
          >
            <option value="">Select plan…</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}{p.pricePerSeatPerMonth > 0 && !p.isCustom ? ` — $${p.pricePerSeatPerMonth}/seat/mo` : p.isCustom ? " (Custom)" : " (Free)"}
              </option>
            ))}
          </select>
        </FormField>

        {/* Seats */}
        <FormField label="Number of seats" error={errors[`tool-${index}-seats`]} id={`tool-${index}-seats`}>
          <input
            id={`tool-${index}-seats`}
            type="number"
            className={`input-base ${errors[`tool-${index}-seats`] ? "input-error" : ""}`}
            value={tool.seats}
            onChange={(e) => onUpdate({ seats: parseInt(e.target.value) || 1 })}
            min={1}
            max={10000}
          />
        </FormField>

        {/* Monthly spend */}
        <FormField label="Actual monthly spend ($)" error={errors[`tool-${index}-spend`]} id={`tool-${index}-spend`}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              fontSize: 14,
              pointerEvents: "none",
            }}>$</span>
            <input
              id={`tool-${index}-spend`}
              type="number"
              className={`input-base ${errors[`tool-${index}-spend`] ? "input-error" : ""}`}
              style={{ paddingLeft: 24 }}
              value={tool.monthlySpend}
              onChange={(e) => onUpdate({ monthlySpend: parseFloat(e.target.value) || 0 })}
              min={0}
              placeholder="0.00"
            />
          </div>
          {tool.planId && tool.seats && toolData && !toolData.plans.find(p => p.id === tool.planId)?.isCustom && (
            <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--color-text-muted)" }}>
              Expected: ${(toolData.plans.find(p => p.id === tool.planId)?.pricePerSeatPerMonth ?? 0) * tool.seats}/mo for {tool.seats} seat(s)
            </p>
          )}
        </FormField>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FORM FIELD
// ---------------------------------------------------------------------------

function FormField({ label, error, id, children }: { label: string; error?: string; id: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ margin: 0, fontSize: 12, color: "var(--color-red)", display: "flex", alignItems: "center", gap: 4 }}>
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
