import type { AnalyzeRequest } from "./types";

// ── Format rules ──────────────────────────────────────────────────────────────

const FORMAT_RULES: Record<string, string> = {
  "Feature": `FORMAT: FEATURE FILM
- Standalone narrative. Evaluate three-act structure, midpoint, earned resolution.
- Flag scenes that advance neither character nor plot.
- COMPS: Feature films only. No TV, no shorts.
- Commercial outlook: theatrical viability, streaming placement, budget tier.`,

  "Short": `FORMAT: SHORT FILM
- Economy of storytelling. Every scene and line must earn its place.
- One clear idea, fully realized. Assess whether the ending earns its runtime.
- COMPS: Short films only. No features, no TV.
- Commercial outlook: festival circuit, awards eligibility, short-form platform fit.`,

  "TV Pilot": `FORMAT: TELEVISION PILOT
- Entry point to a potential series, not a self-contained story.
- Evaluate the episodic engine: does the premise generate recurring, sustainable conflict?
- Does the pilot end with a specific, compelling reason to watch Episode 2?
- Assess long-form character potential across seasons.
- COMPS: TV series only. No films. No shorts. No exceptions.
- Commercial outlook: platform fit, audience demographics, binge potential, season sustainability.`,
};

// ── Stage 1: Internal story observations ─────────────────────────────────────

export function buildObservationsPrompt(req: AnalyzeRequest): string {
  const formatRules = FORMAT_RULES[req.format] ?? FORMAT_RULES["Feature"];

  return `You are a senior script analyst. Read this screenplay and extract structured internal observations. These observations will be used as the analytical foundation for a professional coverage report. Be precise and specific. Reference actual characters, sequences, and story patterns.

SCRIPT DETAILS:
- Title: ${req.title}
- Writer: ${req.writerName}
- Submitted Genre: ${req.genre}
- Format: ${req.format}

SCRIPT PROFILE DETECTION (critical — complete this before all other analysis):
Read the full script and build a precise profile from its content alone. Ignore the submitted genre completely during this step.

Detect four things:

1. PRIMARY GENRE — the dominant genre driving the narrative engine (e.g. Crime Thriller, Psychological Horror, Coming-of-Age Drama, Action Comedy). One genre only.

2. SECONDARY GENRE — a meaningful supporting genre layer present in the script (e.g. Character Drama, Family Drama, Procedural, Romantic Subplot). One genre. Omit if there is no meaningful secondary layer.

3. TONE — 2–4 specific tonal descriptors that define the script's emotional register (e.g. Dark / Gritty / Psychological, Light / Satirical / Absurdist, Tense / Paranoid / Claustrophobic). Be specific — "dark" alone is not enough.

4. MODE — the storytelling mode or structural identity of the script (e.g. Contained Character Study, Ensemble Crime Procedural, Road Movie, Single-Location Thriller, Episodic Coming-of-Age). This is how the story is built, not what it's about.

Genre override rules:
- "submittedGenre": copy the submitted genre exactly as given.
- "detectedGenre": the primaryGenre you detected — script content only, not the submitted label.
- "genreConflict": true if detectedGenre meaningfully differs from submittedGenre, false otherwise.
- "genreConfidence": your confidence — "low", "medium", or "high".
- "genreBlend": ONLY if the script has two genuinely co-equal genre modes both fully present on the page. Do NOT blend just because the writer mislabeled — that is a conflict. Leave empty if it is a mislabel.
- High or medium confidence conflict → use detectedGenre exclusively. No incorporation of the submitted genre.
- Genuine co-equal hybrid → use the blend.
- Low confidence only → analyze as submitted, flag the ambiguity.
- Always default to what the script does on the page.

${formatRules}

SCRIPT TEXT:
${req.scriptText}

Return ONLY valid JSON. No markdown, no explanation:

{
  "submittedGenre": "${req.genre}",
  "detectedGenre": "<primary genre detected from script content alone>",
  "secondaryGenre": "<secondary genre layer if meaningfully present, otherwise omit>",
  "tone": ["<tonal descriptor>", "<tonal descriptor>", "<tonal descriptor>"],
  "mode": "<storytelling mode — how the story is structurally built>",
  "genreConflict": <true or false>,
  "genreConfidence": "<low | medium | high>",
  "genreBlend": ["<genre1>", "<genre2>"],
  "primaryStrengths": [
    "<2-4 specific strengths: name the character, scene, or story element and why it works>",
    "<strength>",
    "<strength>"
  ],
  "primaryWeaknesses": [
    "<2-4 specific weaknesses: name the element, the root cause, and the audience consequence>",
    "<weakness>",
    "<weakness>"
  ],
  "coreThemes": [
    "<1–3 thematic threads actually present in the script>",
    "<theme>"
  ],
  "commercialHooks": [
    "<1-3 commercially viable elements: premise appeal, genre hooks, audience entry points>",
    "<hook>"
  ],
  "audienceRisks": [
    "<1-3 specific risks to sustained audience engagement: where attention may drop and why>",
    "<risk>"
  ],
  "characterDynamics": [
    "<1–3 key relationship patterns or character behavior observations>",
    "<dynamic>"
  ],
  "toneProfile": [
    "<1-2 tonal observations: what register the script operates in and whether it is consistent>",
    "<tone note>"
  ],
  "storyEngine": "<one precise sentence describing the core narrative engine driving the story>",
  "formatFit": "<one sentence on how well the execution fits the stated format>"
}`;
}

// ── Stage 2: Final report using internal observations ─────────────────────────

export function buildReportPrompt(
  req: AnalyzeRequest,
  observations: Record<string, unknown>
): string {
  const formatRules = FORMAT_RULES[req.format] ?? FORMAT_RULES["Feature"];

  const submittedGenre = req.genre;
  const detectedGenre = typeof observations.detectedGenre === "string" ? observations.detectedGenre : req.genre;
  const secondaryGenre = typeof observations.secondaryGenre === "string" ? observations.secondaryGenre : "";
  const tone: string[] = Array.isArray(observations.tone) ? observations.tone as string[] : [];
  const mode = typeof observations.mode === "string" ? observations.mode : "";
  const genreConflict = observations.genreConflict === true;
  const genreConfidence = typeof observations.genreConfidence === "string" ? observations.genreConfidence : "high";
  const genreBlend: string[] = Array.isArray(observations.genreBlend) ? observations.genreBlend as string[] : [];

  // Determine the effective genre for analysis
  const isHybrid = genreBlend.length >= 2;
  const effectiveGenre = isHybrid
    ? genreBlend.join("/")
    : (genreConflict && genreConfidence !== "low")
      ? detectedGenre
      : submittedGenre;

  // Build full script profile string for the prompt
  const profileLines = [
    `- Primary Genre: ${effectiveGenre}`,
    secondaryGenre ? `- Secondary Genre: ${secondaryGenre}` : "",
    tone.length ? `- Tone: ${tone.join(" / ")}` : "",
    mode ? `- Mode: ${mode}` : "",
  ].filter(Boolean).join("\n");

  // Build the genre context block
  let genreInstruction = "";
  let genreNoteInstruction = "";

  if (genreConflict && genreConfidence === "low") {
    genreInstruction = `\nGENRE NOTE: Some ${detectedGenre} elements were detected but confidence is low — analyzing as submitted (${submittedGenre}).`;
  } else if (isHybrid) {
    genreInstruction = `\nGENRE: This script is a legitimate blend of ${genreBlend.join(" and ")}. Analyze it as such. Comps, tone, pacing expectations, marketability, and scoring must reflect the full blended profile above — not a single genre in isolation.`;
    genreNoteInstruction = `\nInclude a "genreNote" in your JSON: "Genre Note: This script was submitted as ${submittedGenre} and reads as a ${effectiveGenre} blend. This report analyzes it through that combined lens for the most accurate coverage."`;
  } else if (genreConflict && genreConfidence !== "low") {
    genreInstruction = `\nGENRE OVERRIDE: Submitted as "${submittedGenre}" — detected as "${detectedGenre}" with ${genreConfidence} confidence. Analyze entirely through the script profile above. Do not apply ${submittedGenre} genre expectations anywhere in the report. This override affects: comparable titles, pacing benchmarks, tone analysis, character evaluation, marketability, commercial outlook, and scoring calibration.`;
    genreNoteInstruction = `\nInclude a "genreNote" in your JSON: "Genre Note: This script was submitted as ${submittedGenre}, but it reads primarily as ${detectedGenre}. This report analyzes it through the detected genre lens for more accurate coverage." Make it sound helpful and informative — not like an error or criticism.`;
  }

  const obs = JSON.stringify(observations, null, 2);

  return `You are a senior script analyst at a major streaming production company. You are writing the final professional coverage report for this screenplay. Your analytical foundation has already been established in the INTERNAL OBSERVATIONS below — use them as your primary source of truth. Do NOT invent details not present in the observations.

SCRIPT DETAILS:
- Title: ${req.title}
- Writer: ${req.writerName}
- Format: ${req.format}
${profileLines}
${genreInstruction}
${genreNoteInstruction}

${formatRules}

INTERNAL STORY OBSERVATIONS (your complete analytical foundation — use these exclusively):
${obs}
---

REPORT RULES:

VOICE: Senior streaming development executive. Direct, specific, commercially aware.
No literary flourishes. One observation per sentence. Name specific characters and scenes.
If stakes are unclear, say so. If scenes drag, say so. Be professionally honest.

BANNED PHRASES: "lacks clarity" / "needs refinement" / "underdeveloped" (alone) /
"has potential" / "could benefit from" / "shows promise" / "the narrative would benefit" /
"with some work" / "interesting premise" / "compelling exploration" / any generic variation.

SCORING:
  90–100: Exceptional. Submission or market ready.
  80–89:  Very strong with minor addressable issues.
  70–79:  Promising but meaningful development required.
  60–69:  Interesting concept with notable execution problems.
  Below 60: Major structural or storytelling issues.
Score what is on the page. Written analysis and score must match.
Scoring calibration must use the full script profile:
  Primary genre: ${effectiveGenre}${secondaryGenre ? ` | Secondary: ${secondaryGenre}` : ""}${tone.length ? ` | Tone: ${tone.join(" / ")}` : ""}${mode ? ` | Mode: ${mode}` : ""}
Score pacing, structure, and marketability against what this specific genre/tone/mode demands — not generic expectations.

VERDICT:
  RECOMMEND: 90+: submission or market ready.
  CONSIDER:  75-89: real merit, revision needed before going out.
  DEVELOP:   Below 75: promising foundation, substantial refinement required.
Exception: CONSIDER may apply below 75 if the concept is highly commercial and execution is weaker than the idea.

ANTI-REPETITION PROTOCOL (CRITICAL):
Each section has an exclusive analytical domain. If an issue spans multiple sections,
each section must discuss a DIFFERENT DIMENSION of that issue.

Example for a flashback pacing issue:
  Reader Reaction → "The flashbacks interrupt emotional momentum."
  Structure → "The flashbacks fragment the forward narrative drive."
  Pacing → "The flashback-to-present transitions disrupt scene rhythm."
  Commercial Outlook → "The pacing interruptions may reduce binge retention."

SECTION DOMAINS (strictly enforce):

quickSnapshot → High-level skimmable bullets. Strongest commercial/story insight first.
  NO deep analysis. NO structural terminology. Skimmable only.

executiveSummary → Overall professional evaluation: viability, development readiness,
  high-level strengths and weaknesses. Concise. Sharp. No plot summary.

readerReaction → Emotional audience experience only: engagement, confusion, anticipation,
  fatigue, emotional investment. Reference character names and story moments.
  NO commercial positioning. NO structural terminology. Human reaction first.

scriptIntent → What this script is trying to be: audience positioning, platform fit,
  tonal ambition, storytelling identity. 1–2 sentences. Executive one-pager voice.

premiseFeedback → Core concept evaluation: uniqueness, hook strength, scalability,
  thematic potential, pitch clarity. Is it commercially viable and pitchable?

categoryScores → Score each domain independently using the INTERNAL OBSERVATIONS as calibration.
  All scores calibrated to: ${effectiveGenre}${secondaryGenre ? ` / ${secondaryGenre}` : ""}, ${tone.join(" / ") || "as detected"}, ${mode || "as detected"}.

comparableTitles → Format-matched comps ONLY. Match primary genre (${effectiveGenre})${tone.length ? ` and tone (${tone.join(" / ")})` : ""}.
  Justify each with a specific tonal, structural, thematic, or audience parallel.
  Not "similar themes": name the actual similarity.

commercialOutlook → Market positioning ONLY: streamer appeal, audience demographics,
  binge potential, budget tier, platform fit, episodic sustainability.
  Do NOT repeat emotional or structural observations unless discussing commercial consequences.

strengths → Use primaryStrengths from observations as anchors. Explain WHY each works
  and WHAT value it creates. Do not introduce unanchored new strengths.

weaknesses → Use primaryWeaknesses from observations as anchors. State root cause
  and audience consequence. Do not repeat language used in craft sections.

structureNotes → Narrative construction ONLY: escalation, sequencing, scene progression,
  turning points, transitions. Do NOT repeat emotional audience reactions.

characterNotes → Motivations, internal arcs, relationship dynamics, emotional consistency.
  Use characterDynamics from observations as context.

dialogueNotes → Voice differentiation, exposition problems, realism, tonal consistency, subtext.

pacingNotes → Rhythm, momentum, drag points, narrative interruptions, scene flow.
  Pacing must be evaluated against ${effectiveGenre} / ${mode || "detected mode"} conventions — not generic feature film pacing.
  A contained character study has different rhythm expectations than a thriller. Calibrate accordingly.
  Each observation must be distinct from structure or reader reaction notes.

marketabilityNotes → Positioning, genre accessibility, audience reach, commercial clarity,
  marketing hooks. Distinct from commercialOutlook bullets.
  Evaluate marketability against the ${effectiveGenre}${tone.length ? ` (${tone.join(" / ")})` : ""} market specifically.

---

Return ONLY valid JSON. No markdown, no code fences:

{
  "genreNote": "<include only if genreConflict is true or script is a genre blend — otherwise omit this field entirely>",
  "industryVerdict": {
    "label": "Recommend" | "Consider" | "Develop",
    "rationale": "<1–2 direct sentences. Execution quality + commercial readiness. No poetic language.>"
  },
  "scriptIntent": "<1–2 sentences. Audience positioning, platform fit, tonal ambition. Development exec voice.>",
  "quickSnapshot": [
    "<Strongest commercial or story-level insight, goes first>",
    "<Second most important observation>",
    "<Character or voice observation>",
    "<Pacing or tonal observation>",
    "<Marketability or platform observation>"
  ],
  "overallScore": <true weighted average integer, must match severity of written analysis>,
  "scoreJustification": "<2–3 sentences. Why this score. Reference specific issues. If below 80, explain what keeps it there.>",
  "topFixes": [
    "<Root-cause fix: name the specific problem and the benefit of fixing it>",
    "<fix>", "<fix>", "<fix>", "<fix>"
  ],
  "executiveSummary": "<3–5 sentences. Development memo. What it IS and accomplishes, then what limits it. Reference characters or sequences. No plot summary.>",
  "readerReaction": "<2–4 sentences. Human reading experience: where curiosity is created, where engagement drops. Reference character names and story moments. Reaction first, analysis second.>",
  "categoryScores": {
    "concept": <0–100>,
    "structure": <0–100>,
    "characters": <0–100>,
    "dialogue": <0–100>,
    "pacing": <0–100>,
    "marketability": <0–100>
  },
  "comparableTitles": [
    { "title": "<${effectiveGenre}-appropriate comp>", "reason": "<specific tonal, structural, thematic, or audience parallel>" },
    { "title": "<comp>", "reason": "<parallel>" },
    { "title": "<comp>", "reason": "<parallel>" }
  ],
  "commercialOutlook": [
    "<Market positioning: streamer fit, demographic, binge potential, or budget tier>",
    "<Episodic sustainability or tonal accessibility>",
    "<Competitive positioning or franchise potential>"
  ],
  "premiseFeedback": "<One paragraph. Commercial viability of the concept. Hook clarity. Pitch strength. What works and what muddies the concept. Specific and commercially minded.>",
  "strengths": [
    "<Anchored to primaryStrengths. Name the element, WHY it works, WHAT value it creates.>",
    "<strength with effect>",
    "<strength with effect>"
  ],
  "weaknesses": [
    "<Anchored to primaryWeaknesses. Name element, root cause, audience consequence.>",
    "<weakness with root cause>",
    "<weakness>"
  ],
  "structureNotes": {
    "working": ["<specific structural element: name it, explain function>", "<observation>"],
    "needsImprovement": ["<specific structural problem: name sequence and narrative consequence>", "<problem>"]
  },
  "characterNotes": {
    "working": ["<specific character behavior or dynamic: name the character>", "<observation>"],
    "needsImprovement": ["<specific character problem: name character, issue, dramatic consequence>", "<problem>"]
  },
  "dialogueNotes": {
    "working": ["<specific dialogue moment or voice: name scene or exchange>", "<observation>"],
    "needsImprovement": ["<specific dialogue problem: name pattern and effect on authenticity>", "<problem>"]
  },
  "pacingNotes": {
    "working": ["<specific sequence where momentum functions: name it>", "<observation>"],
    "needsImprovement": ["<specific pacing problem: name sequences and effect, distinct from structure notes>", "<problem>"]
  },
  "marketabilityNotes": {
    "working": ["<specific commercial hook or audience appeal: name it>", "<observation>"],
    "needsImprovement": ["<specific marketability limitation, distinct from commercialOutlook>", "<problem>"]
  }
}`;
}
