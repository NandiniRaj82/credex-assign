/**
 * PRICING DATA — StackLens Audit Engine
 *
 * Every number here traces to an official vendor pricing page.
 * See PRICING_DATA.md for full citations.
 * Last verified: 2026-05-22
 */

export type Plan = {
  id: string;
  name: string;
  pricePerSeatPerMonth: number; // 0 = free or custom/contact-sales
  isCustom?: boolean; // true = enterprise/contact-sales pricing
  minSeats?: number; // minimum seats required for this plan
  useCaseFit: UseCase[]; // which use cases this plan is suited for
  notes?: string;
};

export type Tool = {
  id: ToolId;
  name: string;
  category: ToolCategory;
  plans: Plan[];
  alternatives?: ToolId[]; // tools that could replace this one
};

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";
export type ToolCategory = "coding-ide" | "llm-api" | "llm-chat" | "multimodal";
export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

// ---------------------------------------------------------------------------
// CURSOR
// Source: https://www.cursor.com/pricing — verified 2026-05-22
// ---------------------------------------------------------------------------
const cursorTool: Tool = {
  id: "cursor",
  name: "Cursor",
  category: "coding-ide",
  alternatives: ["github-copilot", "windsurf"],
  plans: [
    {
      id: "cursor-hobby",
      name: "Hobby",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["coding"],
      notes: "2000 completions/month, 50 slow premium requests",
    },
    {
      id: "cursor-pro",
      name: "Pro",
      pricePerSeatPerMonth: 20,
      useCaseFit: ["coding"],
      notes: "Unlimited completions, 500 fast premium requests/month",
    },
    {
      id: "cursor-business",
      name: "Business",
      pricePerSeatPerMonth: 40,
      useCaseFit: ["coding"],
      notes: "Pro + SSO, admin dashboard, privacy mode enforced",
    },
    {
      id: "cursor-enterprise",
      name: "Enterprise",
      pricePerSeatPerMonth: 0,
      isCustom: true,
      useCaseFit: ["coding"],
      notes: "Custom pricing, dedicated support, SLAs",
    },
  ],
};

// ---------------------------------------------------------------------------
// GITHUB COPILOT
// Source: https://github.com/features/copilot#pricing — verified 2026-05-22
// ---------------------------------------------------------------------------
const githubCopilotTool: Tool = {
  id: "github-copilot",
  name: "GitHub Copilot",
  category: "coding-ide",
  alternatives: ["cursor", "windsurf"],
  plans: [
    {
      id: "copilot-individual",
      name: "Individual",
      pricePerSeatPerMonth: 10,
      useCaseFit: ["coding"],
      notes: "$10/month or $100/year",
    },
    {
      id: "copilot-business",
      name: "Business",
      pricePerSeatPerMonth: 19,
      useCaseFit: ["coding"],
      notes: "Policy management, audit logs, IP indemnity",
    },
    {
      id: "copilot-enterprise",
      name: "Enterprise",
      pricePerSeatPerMonth: 39,
      useCaseFit: ["coding"],
      notes: "Customization on your codebase, fine-tuned models",
    },
  ],
};

// ---------------------------------------------------------------------------
// CLAUDE (Anthropic)
// Source: https://www.anthropic.com/pricing — verified 2026-05-22
// ---------------------------------------------------------------------------
const claudeTool: Tool = {
  id: "claude",
  name: "Claude",
  category: "llm-chat",
  alternatives: ["chatgpt", "gemini"],
  plans: [
    {
      id: "claude-free",
      name: "Free",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["writing", "research", "mixed"],
      notes: "Limited messages, Claude Sonnet",
    },
    {
      id: "claude-pro",
      name: "Pro",
      pricePerSeatPerMonth: 20,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "5× more usage, Projects, Claude Sonnet & Haiku",
    },
    {
      id: "claude-max-5x",
      name: "Max (5×)",
      pricePerSeatPerMonth: 100,
      useCaseFit: ["coding", "research", "mixed"],
      notes: "5× Pro limits, access to Claude Opus",
    },
    {
      id: "claude-max-20x",
      name: "Max (20×)",
      pricePerSeatPerMonth: 200,
      useCaseFit: ["coding", "research", "mixed"],
      notes: "20× Pro limits, priority access, Claude Opus",
    },
    {
      id: "claude-team",
      name: "Team",
      pricePerSeatPerMonth: 30,
      minSeats: 2,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "Min 2 seats, central billing, collaboration features",
    },
    {
      id: "claude-enterprise",
      name: "Enterprise",
      pricePerSeatPerMonth: 0,
      isCustom: true,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "Custom pricing, SSO, advanced security",
    },
    {
      id: "claude-api",
      name: "API Direct",
      pricePerSeatPerMonth: 0, // usage-based
      useCaseFit: ["coding", "data", "research", "mixed"],
      notes: "Pay-per-token. Haiku $0.80/$4 per MTok, Sonnet $3/$15, Opus $15/$75",
    },
  ],
};

// ---------------------------------------------------------------------------
// CHATGPT (OpenAI)
// Source: https://openai.com/chatgpt/pricing/ — verified 2026-05-22
// ---------------------------------------------------------------------------
const chatgptTool: Tool = {
  id: "chatgpt",
  name: "ChatGPT",
  category: "llm-chat",
  alternatives: ["claude", "gemini"],
  plans: [
    {
      id: "chatgpt-free",
      name: "Free",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["writing", "research", "mixed"],
      notes: "Limited GPT-4o access",
    },
    {
      id: "chatgpt-plus",
      name: "Plus",
      pricePerSeatPerMonth: 20,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "GPT-4o, GPT-o1, DALL·E, browsing, plugins",
    },
    {
      id: "chatgpt-team",
      name: "Team",
      pricePerSeatPerMonth: 30,
      minSeats: 2,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "Min 2 seats, higher limits, admin console, data privacy",
    },
    {
      id: "chatgpt-enterprise",
      name: "Enterprise",
      pricePerSeatPerMonth: 0,
      isCustom: true,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "Custom pricing, SSO, dedicated support",
    },
    {
      id: "chatgpt-api",
      name: "API Direct",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["coding", "data", "research", "mixed"],
      notes: "Pay-per-token. GPT-4o-mini $0.15/$0.60 per MTok, GPT-4o $2.50/$10",
    },
  ],
};

// ---------------------------------------------------------------------------
// ANTHROPIC API (Direct API access — separate from Claude chat plans)
// Source: https://www.anthropic.com/pricing — verified 2026-05-22
// ---------------------------------------------------------------------------
const anthropicApiTool: Tool = {
  id: "anthropic-api",
  name: "Anthropic API",
  category: "llm-api",
  alternatives: ["openai-api"],
  plans: [
    {
      id: "anthropic-api-direct",
      name: "API Direct (Pay-as-you-go)",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["coding", "data", "research", "mixed"],
      notes:
        "Claude Haiku 3.5: $0.80/$4 per MTok. Sonnet 3.7: $3/$15. Opus 4: $15/$75",
    },
  ],
};

// ---------------------------------------------------------------------------
// OPENAI API (Direct API access — separate from ChatGPT chat plans)
// Source: https://openai.com/api/pricing/ — verified 2026-05-22
// ---------------------------------------------------------------------------
const openaiApiTool: Tool = {
  id: "openai-api",
  name: "OpenAI API",
  category: "llm-api",
  alternatives: ["anthropic-api"],
  plans: [
    {
      id: "openai-api-direct",
      name: "API Direct (Pay-as-you-go)",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["coding", "data", "research", "mixed"],
      notes:
        "GPT-4o-mini: $0.15/$0.60 per MTok. GPT-4o: $2.50/$10. o3: $10/$40",
    },
  ],
};

// ---------------------------------------------------------------------------
// GEMINI (Google)
// Source: https://one.google.com/about/plans — https://ai.google.dev/pricing — verified 2026-05-22
// ---------------------------------------------------------------------------
const geminiTool: Tool = {
  id: "gemini",
  name: "Gemini",
  category: "llm-chat",
  alternatives: ["claude", "chatgpt"],
  plans: [
    {
      id: "gemini-free",
      name: "Free (Gemini 1.5 Flash)",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["writing", "research", "mixed"],
      notes: "Free tier via Google One or Google account",
    },
    {
      id: "gemini-advanced",
      name: "Advanced (Google One AI Premium)",
      pricePerSeatPerMonth: 19.99,
      useCaseFit: ["writing", "research", "coding", "mixed"],
      notes: "Gemini 1.5 Ultra, 2TB storage, included in Google One AI Premium",
    },
    {
      id: "gemini-business",
      name: "Google Workspace + Gemini",
      pricePerSeatPerMonth: 30,
      useCaseFit: ["writing", "research", "mixed"],
      notes:
        "Gemini for Google Workspace add-on, $30/user/month on top of Workspace",
    },
    {
      id: "gemini-api",
      name: "API Direct (pay-as-you-go)",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["coding", "data", "research", "mixed"],
      notes:
        "Gemini 1.5 Flash: $0.075/$0.30 per MTok. Gemini 1.5 Pro: $1.25/$5",
    },
  ],
};

// ---------------------------------------------------------------------------
// WINDSURF (Codeium)
// Source: https://windsurf.com/pricing — verified 2026-05-22
// ---------------------------------------------------------------------------
const windsurfTool: Tool = {
  id: "windsurf",
  name: "Windsurf",
  category: "coding-ide",
  alternatives: ["cursor", "github-copilot"],
  plans: [
    {
      id: "windsurf-free",
      name: "Free",
      pricePerSeatPerMonth: 0,
      useCaseFit: ["coding"],
      notes: "Limited Flows and completions",
    },
    {
      id: "windsurf-pro",
      name: "Pro",
      pricePerSeatPerMonth: 15,
      useCaseFit: ["coding"],
      notes: "Unlimited completions, 500 premium requests/month",
    },
    {
      id: "windsurf-teams",
      name: "Teams",
      pricePerSeatPerMonth: 35,
      minSeats: 2,
      useCaseFit: ["coding"],
      notes: "Team management, priority support, admin controls",
    },
  ],
};

// ---------------------------------------------------------------------------
// MASTER TOOL REGISTRY
// ---------------------------------------------------------------------------
export const TOOLS: Record<ToolId, Tool> = {
  cursor: cursorTool,
  "github-copilot": githubCopilotTool,
  claude: claudeTool,
  chatgpt: chatgptTool,
  "anthropic-api": anthropicApiTool,
  "openai-api": openaiApiTool,
  gemini: geminiTool,
  windsurf: windsurfTool,
};

export const TOOL_LIST = Object.values(TOOLS);

/** Credex estimated discount range on AI credits */
export const CREDEX_DISCOUNT_RANGE = { min: 0.15, max: 0.30 };

/** Monthly spend threshold to surface Credex consultation CTA */
export const CREDEX_HIGH_VALUE_THRESHOLD = 500;

/** Monthly spend threshold below which we consider the user "spending well" */
export const LOW_SPEND_THRESHOLD = 100;
