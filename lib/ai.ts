import type { AnalyzeRequest, AnalysisReport, CraftNotes } from "./types";
import { buildObservationsPrompt, buildReportPrompt } from "./prompts";

// ── Constants ─────────────────────────────────────────────────────────────────

// ~4 chars per token. gpt-4o-mini context: 128k tokens.
// We cap at ~120k usable tokens (leaving headroom for prompt overhead + output).
// 120,000 tokens × 4 chars = 480,000 characters.
const MAX_SCRIPT_CHARS = 480_000;

const SCRIPT_TOO_LONG_ERROR =
  "Your script is too long to process. Scripts over approximately 130 pages may exceed our processing limit. " +
  "Try submitting only the screenplay pages (remove title page, cast lists, or appendices), or contact support@championscreenplays.com for help.";

// ── Public entry point ────────────────────────────────────────────────────────

export async function analyzeScript(req: AnalyzeRequest): Promise<AnalysisReport> {
  if (req.scriptText.length > MAX_SCRIPT_CHARS) {
    throw new Error(SCRIPT_TOO_LONG_ERROR);
  }

  const provider = process.env.AI_PROVIDER ?? "openai";

  if (provider === "openai") {
    return analyzeWithOpenAI(req);
  }
  return analyzeWithGroq(req);
}

// ── OpenAI two-stage orchestration ────────────────────────────────────────────

async function analyzeWithOpenAI(req: AnalyzeRequest): Promise<AnalysisReport> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const call = async (prompt: string, maxTokens: number) => {
    try {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });
      return parseJSON(res.choices[0]?.message?.content ?? "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("context_length_exceeded") || msg.includes("maximum context length")) {
        throw new Error(SCRIPT_TOO_LONG_ERROR);
      }
      throw err;
    }
  };

  // Stage 1: internal story observations (fast, small budget)
  const observations = await call(buildObservationsPrompt(req), 1200);

  // Stage 2: full report anchored to observations
  const raw = await call(buildReportPrompt(req, observations), 8000);

  return normalizeReport(raw);
}

// ── Groq two-stage orchestration ──────────────────────────────────────────────

async function analyzeWithGroq(req: AnalyzeRequest): Promise<AnalysisReport> {
  const { default: Groq } = await import("groq-sdk");
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const call = async (prompt: string, maxTokens: number) => {
    try {
      const res = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional screenplay analyst. You always respond with valid, complete JSON only. No explanation, no markdown, no code fences. Your JSON must be parseable by JSON.parse().",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      });
      return parseJSON(res.choices[0]?.message?.content ?? "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("context_length_exceeded") || msg.includes("maximum context length")) {
        throw new Error(SCRIPT_TOO_LONG_ERROR);
      }
      throw err;
    }
  };

  const observations = await call(buildObservationsPrompt(req), 1200);
  const raw = await call(buildReportPrompt(req, observations), 8000);

  return normalizeReport(raw);
}

// ── JSON parser ───────────────────────────────────────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  let cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Extract outermost JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  // Fix common LLM JSON issues
  cleaned = cleaned
    .replace(/,\s*([\]}])/g, "$1")   // trailing commas
    .replace(/([}\]])\s*([{[])/g, "$1,$2"); // missing commas between objects

  // First try native parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to jsonrepair
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { jsonrepair } = require("jsonrepair");
    return JSON.parse(jsonrepair(cleaned));
  }
}

// ── Normalizers ───────────────────────────────────────────────────────────────

function safeCraftNotes(val: unknown): CraftNotes {
  if (val && typeof val === "object" && !Array.isArray(val)) {
    const obj = val as Record<string, unknown>;
    return {
      working: Array.isArray(obj.working) ? obj.working : [],
      needsImprovement: Array.isArray(obj.needsImprovement) ? obj.needsImprovement : [],
    };
  }
  if (typeof val === "string" && val.trim()) return { working: [], needsImprovement: [val] };
  return { working: [], needsImprovement: [] };
}

function safeStringArray(val: unknown): string[] {
  return Array.isArray(val) ? val.filter((v) => typeof v === "string") : [];
}

function normalizeReport(raw: Record<string, unknown>): AnalysisReport {
  const cs = (raw.categoryScores ?? {}) as Record<string, unknown>;
  const verdict = (raw.industryVerdict ?? {}) as Record<string, unknown>;

  const rawComps = Array.isArray(raw.comparableTitles) ? raw.comparableTitles : [];
  const comparableTitles = rawComps
    .map((c: unknown) => {
      const comp = (c ?? {}) as Record<string, unknown>;
      return {
        title: typeof comp.title === "string" ? comp.title : "",
        reason: typeof comp.reason === "string" ? comp.reason : "",
      };
    })
    .filter((c) => c.title);

  return {
    title: "",
    writerName: "",
    genreNote: typeof raw.genreNote === "string" && raw.genreNote ? raw.genreNote : undefined,
    industryVerdict: {
      label: (["Recommend", "Consider", "Develop"].includes(verdict.label as string)
        ? verdict.label
        : "Consider") as "Recommend" | "Consider" | "Develop",
      rationale: typeof verdict.rationale === "string" ? verdict.rationale : "",
    },
    scriptIntent: typeof raw.scriptIntent === "string" ? raw.scriptIntent : "",
    quickSnapshot: safeStringArray(raw.quickSnapshot),
    overallScore: Number(raw.overallScore) || 0,
    scoreJustification: typeof raw.scoreJustification === "string" ? raw.scoreJustification : "",
    topFixes: safeStringArray(raw.topFixes),
    executiveSummary: typeof raw.executiveSummary === "string" ? raw.executiveSummary : "",
    readerReaction: typeof raw.readerReaction === "string" ? raw.readerReaction : "",
    categoryScores: {
      concept: Number(cs.concept) || 0,
      structure: Number(cs.structure) || 0,
      characters: Number(cs.characters) || 0,
      dialogue: Number(cs.dialogue) || 0,
      pacing: Number(cs.pacing) || 0,
      marketability: Number(cs.marketability) || 0,
    },
    comparableTitles,
    commercialOutlook: safeStringArray(raw.commercialOutlook),
    loglineFeedback:
      typeof raw.premiseFeedback === "string"
        ? raw.premiseFeedback
        : typeof raw.loglineFeedback === "string"
        ? raw.loglineFeedback
        : "",
    strengths: safeStringArray(raw.strengths),
    weaknesses: safeStringArray(raw.weaknesses),
    structureNotes: safeCraftNotes(raw.structureNotes),
    characterNotes: safeCraftNotes(raw.characterNotes),
    dialogueNotes: safeCraftNotes(raw.dialogueNotes),
    pacingNotes: safeCraftNotes(raw.pacingNotes),
    marketabilityNotes: safeCraftNotes(raw.marketabilityNotes),
  };
}
