import type { AnalyzeRequest } from "./types";

// ── Format rules ──────────────────────────────────────────────────────────────

const FORMAT_RULES: Record<string, string> = {
  "Feature": `FORMAT: FEATURE FILM
- Standalone narrative. Evaluate three-act structure, midpoint, earned resolution.
- Flag scenes that advance neither character nor plot.
- COMPS: Feature films only. No TV, no shorts.
- Commercial outlook: evaluate as a FILM. Use theatrical language — wide release, limited release, platform release, awards positioning, indie vs. mid-budget vs. studio tier, audience quadrant (four-quadrant, genre, niche). Streaming is a secondary landing spot, not the primary lens.
- BANNED in feature coverage: "binge potential", "binge-worthy", "episodic sustainability", "season", "episodes". These are TV metrics. Never apply them to a feature.`,

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
- Submitted Primary Genre: ${req.genre}${req.secondaryGenre ? `\n- Submitted Secondary Genre (writer-flagged blend): ${req.secondaryGenre}` : ""}
- Format: ${req.format}

SCRIPT PROFILE DETECTION (critical — complete this before all other analysis):
Read the full script and build a precise profile from its content alone. The submitted genre(s) above are writer-provided labels — treat them as signals to investigate, not as ground truth.${req.secondaryGenre ? ` The writer has flagged this as a genre blend (${req.genre} / ${req.secondaryGenre}) — actively look for both layers in the content and confirm or contradict that blend based on what is on the page.` : " Ignore the submitted genre completely during this step."}

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
- BLEND ORDERING RULE: When a primary and secondary genre are both submitted, investigate BOTH with equal initial weight from the content before assigning analytical primacy. The user-submitted ordering reflects their perception — content determines which engine is actually dominant. Do not let the label order suppress detection of either layer.

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
  "antagonistEngine": "<the primary antagonist or threat, their specific role, and — critically — what genre layer they unlock that the surface premise alone does not reveal. E.g. 'Monty, a tap-dancing assassin hired by The Commission, transforms the body-swap comedy into serialized assassination mythology with political conspiracy stakes.' If no distinct antagonist exists, describe the primary external force driving conflict.>",
  "spectacleElements": "<any kinetic sequences, meme-able moments, visually outrageous set pieces, or social clip-worthy scenes — name them specifically. These are streaming-era commercial assets. Omit if none present.>",
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

INTENTIONAL CHAOS RULE: Before penalizing pacing or structure, determine whether rapid velocity, tonal whiplash, or escalating absurdism is the script's intentional mode. A script designed for "what happens next?" urgency should be evaluated on whether that urgency is controlled and purposeful — not whether it meets classical escalation expectations. Controlled tonal anarchy is a legitimate storytelling philosophy. Only flag chaos as a flaw if it loses the audience's orientation entirely, not merely because it is unconventional.
REFRAME THE QUESTION: The evaluative question is never "Is this confusing?" It is: "Is the audience still emotionally and narratively compelled despite the disorientation?" Shows like Barry, Russian Doll, Atlanta, and Search Party weaponize instability intentionally. Evaluate whether the chaos serves the script's emotional grip — not whether it would be easier to follow if it were more conventional.

VERDICT:
  RECOMMEND: 90+: submission or market ready.
  CONSIDER:  75-89: real merit, revision needed before going out.
  DEVELOP:   Below 75: promising foundation, substantial refinement required.
Exception: CONSIDER may apply below 75 if the concept is highly commercial and execution is weaker than the idea.

ROOT-CAUSE HIERARCHY (do this before writing any section):
Identify the 2–3 dominant script problems from the observations. For each one, name the root cause.
Then assign each root cause a DIFFERENT analytical lens across sections — never the same lens twice.

Example — root cause: "overuse of flashbacks"
  Structure lens    → how flashbacks disrupt narrative architecture and act progression
  Pacing lens       → how flashback-to-present transitions kill scene momentum
  Reader Reaction   → where the audience loses emotional thread because of time jumps
  Commercial lens   → how structural fragmentation affects acquisition pitch clarity

Every section sees the same root problem through a completely different window.
This is what separates analysis from repetition.

SELF-AUDIT RULE (apply before writing each section):
Before writing any section, ask: "Have I already named this observation in a previous section?"
If yes — do NOT restate it. Find a different angle or leave it out.
Repeating the same observation in different words is the most detectable sign of AI-generated coverage.
Real analysts vary angle, emphasis, vocabulary, and focus — even when discussing connected problems.

OBSERVATION BUDGET (hard cap — applies to BOTH strengths AND weaknesses — enforce mechanically):
Every named observation — positive or negative — gets a MENTION BUDGET of 3 sections maximum across the entire report.
Once an observation (e.g. "the sisterly relationship creates a compelling emotional core," "inconsistent tone," "authentic dialogue") has appeared in 3 sections, ALL subsequent sections MUST identify something genuinely different through their specific analytical lens.

A single observation appearing in more than 4 sections without new analytical manifestation significantly weakens report quality and must be avoided.

NO SENTENCE CLONING: Never repeat the same sentence or near-identical phrasing across sections. Each section must contribute a new idea. Paraphrasing the same observation is not acceptable — it must be a different observation.
  WRONG: "The sisterly relationship between Adena and Sarai creates a compelling emotional core" in the snapshot, summary, strengths, structure notes, AND character notes.
  RIGHT: Each section finds a different angle:
    Snapshot          → one-line hook ("two sisters navigating competing definitions of family loyalty")
    Strengths         → WHY it works and what value it creates for the audience
    Character notes   → HOW the dynamic is constructed on the page — behavioral specifics, want vs. need, moment of rupture
    Structure notes   → WHERE the relationship drives narrative architecture — which act turns it anchors
  Each section teaches something new. Restating the same observation teaches nothing.

CRAFT NOTE SPECIFICITY: Each bullet in structureNotes, characterNotes, dialogueNotes, pacingNotes, and marketabilityNotes must be a genuinely distinct observation. Do NOT follow an observation with a "This X" consequence sentence and count it as a second bullet — that is one observation dressed as two. Each bullet must identify a different element, scene, character, or pattern.
  WRONG: "The body swap premise sets up recurring conflict. This creates a strong episodic engine." ← one observation, not two.
  RIGHT: Two bullets that each name a different structural element with its own specific function or problem.

MANIFESTATION RULE: When a critique DOES recur across sections, each instance must describe the SPECIFIC MANIFESTATION in that domain — not just repeat the label.
  WRONG: "tone is inconsistent" in structure notes, dialogue notes, AND pacing notes.
  RIGHT:
    Structure notes   → "the cold open establishes a grounded domestic register that the third-act tonal pivot hasn't been architecturally prepared for"
    Dialogue notes    → "characters shift from naturalistic family speech to heightened dramatic declaration without clear emotional trigger"
    Pacing notes      → "the tonal pivot arrives mid-scene rather than at a structural beat, creating a rhythm disruption the reader feels before they can name it"
  Each instance teaches something new. Repeating the label teaches nothing.

SECTION IDENTITY (each section owns a unique analytical territory — enforce strictly):

quickSnapshot →
  IDENTITY: Executive skimming layer. What a busy reader needs in 10 seconds.
  VOCABULARY: Hook, premise strength, character appeal, tonal clarity, market position.
  BANNED: Deep analysis, structural terminology, craft observations, repeated weakness lists.

executiveSummary →
  IDENTITY: Development memo. Overall viability verdict with specific evidence.
  VOCABULARY: Development readiness, narrative ambition, execution gap, commercial positioning.
  BANNED: Plot summary, emotional reader reactions, granular craft notes.

readerReaction →
  IDENTITY: The human experience of reading this script. Emotion only.
  VOCABULARY: Curiosity, engagement, confusion, frustration, anticipation, investment, surprise, fatigue.
  BANNED: Commercial language, structural terminology ("act two", "midpoint"), market positioning.
  RULE: Reference character names and specific story moments. Never speak in abstractions.

scriptIntent →
  IDENTITY: What this script is trying to be. One-pager positioning voice.
  VOCABULARY: Platform fit, audience target, tonal ambition, storytelling identity.
  BANNED: Execution notes, weaknesses, craft observations.

premiseFeedback →
  IDENTITY: Is the concept itself strong, pitchable, and commercially viable?
  VOCABULARY: Hook clarity, concept uniqueness, pitch strength, scalability, thematic potential.
  BANNED: Execution notes, character arcs, craft observations. Concept only.

categoryScores →
  IDENTITY: Independent numerical calibration of each craft domain.
  All scores calibrated to: ${effectiveGenre}${secondaryGenre ? ` / ${secondaryGenre}` : ""}, ${tone.join(" / ") || "as detected"}, ${mode || "as detected"}.
  CHARACTER SCORE CALIBRATION: Score "characters" on arc depth and behavioral specificity, not cast size. A script with 3 fully realized characters with complete, credible arcs should score higher than a script with 10 thin ones. Ask: does the most important character travel a meaningful emotional and behavioral distance from first appearance to final scene? Do they have a coherent want, a revealed need, and a moment of genuine change? Strong character scores (80+) require that the script's central characters feel irreplaceable — not interchangeable with any other character in any other script.
  PACING SCORE CALIBRATION: Score "pacing" on whether scenes earn their duration through revelation, reversal, or emotional escalation — not on raw scene length. A script where every long scene delivers new information, character turns, or stakes escalation should score strongly even if individual scenes run long. Penalize scenes that occupy runtime without delivering any of the three — not scenes that are long but dramatically justified.

comparableTitles →
  IDENTITY: Market positioning through specific analogues.
  Must match primary genre (${effectiveGenre})${tone.length ? ` and tone (${tone.join(" / ")})` : ""}.
  RULE: Name the specific tonal, structural, thematic, or audience parallel — not "similar themes."
  BLEND RULE: When analyzing a genre blend, every comp must honor BOTH genre layers AND the full tonal register. A dark/surreal/kinetic comedy-thriller requires comps that are dark, surreal, and thriller-adjacent — not broad network comedies. If the tone is elevated, edgy, or absurdist, comps must reflect that register. Defaulting to a broad comedy comp because "comedy" appears in the genre label is a category error.
  EXAMPLES of tonal-register-aware comps for dark/surreal comedy-thrillers: Barry, Russian Doll, Dead to Me, Search Party, The Flight Attendant, Fleabag, Killing Eve. Brooklyn Nine-Nine, Parks and Recreation, or similar broad/warm network comedies do NOT belong in this register.

commercialOutlook →
  IDENTITY: Screenplay-industry market positioning. How this gets bought, positioned, and sold.
  VOCABULARY: Use specific industry positioning language — prestige streaming, elevated genre, actor-driven, mid-budget psychological thriller, festival-to-streaming crossover, contained neo-noir, platform release, awards-adjacent, four-quadrant, niche adult demographic.
  BANNED: Generic filler — "wide release," "dedicated fan base," "broad audience," "streaming platforms generally." These phrases say nothing. Name the specific platform tier, the specific audience, the specific acquisition context.
  BANNED ALSO: Emotional reactions, structural notes, craft observations, character analysis.
  RULE: Only reference execution problems if they create a specific, nameable commercial consequence.

strengths →
  IDENTITY: What works and why it creates value.
  RULE: Anchored to primaryStrengths from observations. Name the element, explain WHY it works, state WHAT value it creates for the audience or market.
  BANNED: Restating weaknesses. Each bullet must be a genuine positive with a specific effect.
  VOICE RULE: Distinctive narrative voice — specific, alive-on-the-page language that feels like no other script — is a commercially significant strength and one of the hardest qualities to develop. If the script has it, name it explicitly: identify the lines, exchanges, or scenes that carry it and explain why they work commercially and creatively.
  SPECTACLE RULE: Kinetic sequences, meme-able moments, visually outrageous set pieces, and social clip-worthy scenes are streaming-era commercial assets — they drive discovery, social sharing, and audience retention in ways traditional coverage metrics don't capture. When present (from the antagonistEngine and spectacleElements observations), name them explicitly as strengths with specific commercial value.

weaknesses →
  IDENTITY: Root causes and their audience consequences.
  RULE: Anchored to primaryWeaknesses. Name the element, its root cause, and its consequence on the audience experience.
  BANNED: The word "pacing" — if pacing is a weakness, describe its audience consequence instead (e.g. "the second act loses urgency," not "pacing is slow"). Also banned: language already used in structureNotes, pacingNotes, or other craft sections.

structureNotes →
  IDENTITY: Narrative architecture only.
  VOCABULARY: Act progression, escalation, scene sequencing, turning points, midpoint, transitions, narrative logic, cause-and-effect chain.
  BANNED: The word "pacing" — if a structural problem affects rhythm, describe the architectural cause, not the felt result. Emotional audience reactions (those belong in readerReaction).
  EXAMPLE: Say "the scene sequencing breaks the cause-and-effect chain in act two" — NOT "the pacing feels slow."

characterNotes →
  IDENTITY: Who these people are and how they behave on the page.
  VOCABULARY: Motivation clarity, internal arc, want vs. need, relationship dynamics, behavioral consistency, emotional truth.
  BANNED: Dialogue quality (belongs in dialogueNotes), structural observations, the word "pacing."
  ARC DEPTH RULE: A small cast with deep, fully realized arcs scores higher than a large cast with thin ones. Never penalize a script for having fewer named characters — reward it for how far each character travels. Evaluate the arc of the most important character: how far do they move emotionally and behaviorally from page 1 to final scene? A character who undergoes a complete, credible transformation — especially through an unexpected behavioral reversal or revelation moment — is exceptional craft and must be named explicitly. If a character initially reads as antagonist and reveals unexpected vulnerability or complexity, that arc is a significant structural and emotional asset.

dialogueNotes →
  IDENTITY: How characters speak and what the words reveal or obscure.
  VOCABULARY: Voice differentiation, subtext, exposition handling, register, naturalism, tonal consistency, word economy.
  BANNED: Character arc observations (belongs in characterNotes), structural notes, the word "pacing."

pacingNotes →
  IDENTITY: The felt rhythm of reading — momentum, drag, propulsion.
  VOCABULARY: Scene duration, tension rhythm, momentum, drag, propulsion, narrative interruption, beat spacing, flow, urgency, lull.
  BANNED: Structural architecture — do not say "the scene sequencing" or "act structure" (those belong in structureNotes). Emotional reader reactions (belongs in readerReaction).
  RULE: Calibrate against ${effectiveGenre} / ${mode || "detected mode"} conventions. A contained character study has different rhythm expectations than a thriller.
  RULE: This is the ONLY section that owns the word "pacing." All other sections must describe the consequence, not name the cause.
  SCENE LENGTH RULE: Scene duration alone is never evidence of drag. Before flagging any scene as slow, evaluate whether it is earning its runtime through: (1) revelation — new information that changes our understanding of a character or situation; (2) reversal — a power dynamic or situation that shifts unexpectedly; (3) emotional escalation — the stakes become personal in a new way. A courtroom sequence, sustained dialogue exchange, or confrontation scene that delivers revelation, reversal, and emotional escalation is NOT slow — it is doing exactly what drama requires. Only flag a scene as a pacing problem if it delivers none of these three. Long scenes that earn their length are an asset, not a liability.

marketabilityNotes →
  IDENTITY: How this specific script positions against the current market — distinct from commercialOutlook bullets.
  VOCABULARY: Genre accessibility, marketing hooks, logline clarity, title strength, poster concept, audience entry point, comp title positioning, pitch angle.
  BANNED: Distribution strategy (belongs in commercialOutlook), craft observations, generic filler language.

---

BEFORE YOU WRITE A SINGLE FIELD: List your 3 dominant observations (strengths) and 3 dominant critiques (weaknesses) mentally. Assign each one to its PRIMARY section. Every other section must find a different angle or go deeper — never restate. No sentence may appear more than once across the entire report.

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
