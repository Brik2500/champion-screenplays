"use client";

import { useState, useRef } from "react";
import type { AnalysisReport, CraftNotes, ComparableTitle } from "@/lib/types";

interface Props {
  report: AnalysisReport;
  onReset: () => void;
}

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreLabel(score: number) {
  if (score >= 90) return "Outstanding";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Promising";
  if (score >= 60) return "Developing";
  return "Needs Work";
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 70) return "bg-amber-500";
  if (score >= 60) return "bg-orange-500";
  return "bg-red-500";
}

// ── Verdict config ────────────────────────────────────────────────────────────

const VERDICT_STYLES = {
  Recommend: { border: "border-emerald-700", bg: "bg-emerald-950/30", badge: "bg-emerald-500 text-black",  dot: "bg-emerald-400" },
  Consider:  { border: "border-amber-700",   bg: "bg-amber-950/30",   badge: "bg-amber-500 text-black",    dot: "bg-amber-400"   },
  Develop:   { border: "border-blue-800",    bg: "bg-blue-950/25",    badge: "bg-blue-600 text-white",     dot: "bg-blue-400"    },
};

// ── Copy text formatter ───────────────────────────────────────────────────────

function formatReportAsText(r: AnalysisReport): string {
  const cs = r.categoryScores;
  const craft = (title: string, notes: CraftNotes) =>
    `${title}\nWhat's Working:\n${notes.working.map((b) => `• ${b}`).join("\n")}\nNeeds Improvement:\n${notes.needsImprovement.map((b) => `• ${b}`).join("\n")}`;

  return `CHAMPION SCREENPLAYS: ANALYSIS REPORT
${"=".repeat(40)}
${r.title} by ${r.writerName}

INDUSTRY VERDICT: ${r.industryVerdict.label.toUpperCase()}
${r.industryVerdict.rationale}

WHAT THIS SCRIPT IS TRYING TO BE
${r.scriptIntent}

QUICK SNAPSHOT
${r.quickSnapshot.map((b) => `• ${b}`).join("\n")}

OVERALL SCORE: ${r.overallScore}/100 (${scoreLabel(r.overallScore).toUpperCase()})
${r.scoreJustification}

TOP PRIORITY FIXES
${r.topFixes.map((f, i) => `${i + 1}. ${f}`).join("\n")}

EXECUTIVE SUMMARY
${r.executiveSummary}

READER REACTION
${r.readerReaction}

CATEGORY SCORES
Concept        ${cs.concept}/100
Structure      ${cs.structure}/100
Characters     ${cs.characters}/100
Dialogue       ${cs.dialogue}/100
Pacing         ${cs.pacing}/100
Marketability  ${cs.marketability}/100

COMPARABLE TITLES
${r.comparableTitles.map((c) => `• ${c.title}: ${c.reason}`).join("\n")}

COMMERCIAL OUTLOOK
${r.commercialOutlook.map((b) => `• ${b}`).join("\n")}

PREMISE EVALUATION
${r.loglineFeedback}

STRENGTHS
${r.strengths.map((s) => `• ${s}`).join("\n")}

WEAKNESSES
${r.weaknesses.map((w) => `• ${w}`).join("\n")}

${craft("STRUCTURE", r.structureNotes)}
${craft("CHARACTERS", r.characterNotes)}
${craft("DIALOGUE", r.dialogueNotes)}
${craft("PACING", r.pacingNotes)}
${craft("MARKETABILITY", r.marketabilityNotes)}
`.trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900 p-5 print:border-zinc-300 print:bg-white print:p-4 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: string; title: string }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500 print:text-zinc-600">
      <span>{icon}</span>{title}
    </p>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="flex-1 h-1 overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200">
        <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`w-8 text-right text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score}</span>
    </div>
  );
}

function CraftSection({ notes }: { notes: CraftNotes }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-1">
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-emerald-500">What's Working</p>
        <ul className="space-y-2">
          {notes.working.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-400 print:text-zinc-700">
              <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-none" />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-red-500">Needs Improvement</p>
        <ul className="space-y-2">
          {notes.needsImprovement.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-400 print:text-zinc-700">
              <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-red-500 flex-none" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Accordion({
  icon, title, score, children,
}: {
  icon: string; title: string; score?: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden print:border-zinc-300 print:bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-800/50"
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-300">
          {title}
        </span>
        {score !== undefined && (
          <span className={`mr-3 text-sm font-black tabular-nums ${scoreColor(score)}`}>
            {score}
          </span>
        )}
        <svg
          className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        style={{ height: open ? (bodyRef.current?.scrollHeight ?? "auto") : 0 }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div ref={bodyRef} className="border-t border-zinc-800/60 px-5 py-5 print:border-zinc-200">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnalysisReport({ report, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const cs = report.categoryScores;
  const vstyle = (VERDICT_STYLES as Record<string, typeof VERDICT_STYLES.Consider>)[report.industryVerdict.label] ?? VERDICT_STYLES.Consider;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatReportAsText(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const prev = document.title;
    document.title = `${report.title} - ${report.writerName}`;
    window.print();
    document.title = prev;
  };

  const handleEmail = async () => {
    if (!email || emailStatus === "sending" || emailStatus === "sent") return;
    setEmailStatus("sending");
    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, report }),
      });
      setEmailStatus(res.ok ? "sent" : "error");
    } catch {
      setEmailStatus("error");
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">{report.title}</h2>
          <p className="text-sm text-zinc-500">by {report.writerName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400">
            {copied ? "✓ Copied" : "Copy Text"}
          </button>
          <button onClick={handlePrint}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400">
            Save PDF
          </button>
          <button onClick={onReset}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400">
            ← New Analysis
          </button>
        </div>
      </div>

      {/* ── Email capture ── */}
      <div className="rounded-xl border border-amber-700/30 bg-amber-950/10 px-5 py-4 print:hidden">
        <p className="mb-3 text-xs font-semibold text-zinc-300">
          Send this report to your inbox so you never lose it.
        </p>
        {emailStatus === "sent" ? (
          <p className="text-sm font-semibold text-emerald-400">
            ✓ Report sent. Check your inbox.
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-amber-500"
            />
            <button
              onClick={handleEmail}
              disabled={emailStatus === "sending" || !email}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
            >
              {emailStatus === "sending" ? "Sending..." : "Send Report"}
            </button>
          </div>
        )}
        {emailStatus === "error" && (
          <p className="mt-2 text-xs text-red-400">Something went wrong. Please try again.</p>
        )}
        <p className="mt-2 text-[10px] text-zinc-600">Your email is only used to send this report. Never shared.</p>
      </div>

      {/* ── Print header ── */}
      <div className="hidden print:block print:mb-4">
        <p className="text-xl font-bold">🏆 Champion Screenplays: Analysis Report</p>
        <p className="text-sm text-zinc-500 mt-0.5">{report.title} by {report.writerName}</p>
        <hr className="mt-2" />
      </div>

      {/* ════════════════════════════════════════
          TIER 1: Most Important
      ════════════════════════════════════════ */}

      {/* Industry Verdict */}
      <div className={`rounded-xl border-2 ${vstyle.border} ${vstyle.bg} px-6 py-5`}>
        <p className="mb-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Industry Verdict</p>
        <div className="flex flex-wrap items-center gap-4">
          <span className={`inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-black uppercase tracking-widest ${vstyle.badge}`}>
            <span className={`h-2 w-2 rounded-full ${vstyle.dot}`} />
            {report.industryVerdict.label}
          </span>
          <p className="text-sm text-zinc-300 leading-relaxed">{report.industryVerdict.rationale}</p>
        </div>
      </div>

      {/* Script Intent — signature section */}
      {report.scriptIntent && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 px-5 py-5"
          style={{ boxShadow: "inset 0 0 0 1px rgba(245,158,11,0.08)" }}>
          <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-amber-500/70">
            What This Script Is Trying to Be
          </p>
          <p className="text-sm italic leading-relaxed text-zinc-300">{report.scriptIntent}</p>
        </div>
      )}

      {/* Quick Snapshot */}
      <Card className="!bg-zinc-950 border-zinc-700/60">
        <SectionLabel icon="⚡" title="Quick Read Snapshot" />
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {report.quickSnapshot.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* Overall Score + Top Fixes side by side on large screens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

        {/* Overall Score */}
        <Card className="lg:col-span-2 flex flex-col justify-center">
          <SectionLabel icon="🏆" title="Overall Score" />
          <div className="flex items-center gap-5">
            <span className={`text-7xl font-black tabular-nums leading-none ${scoreColor(report.overallScore)}`}>
              {report.overallScore}
            </span>
            <div>
              <p className={`text-sm font-bold uppercase tracking-widest ${scoreColor(report.overallScore)}`}>
                {scoreLabel(report.overallScore)}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{report.scoreJustification}</p>
            </div>
          </div>
        </Card>

        {/* Top Priority Fixes */}
        <Card className="lg:col-span-3 !bg-zinc-950/80">
          <SectionLabel icon="🔧" title="Top Priority Fixes" />
          <ol className="space-y-3">
            {report.topFixes.map((fix, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-black text-amber-400 ring-1 ring-amber-500/30">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-zinc-300">{fix}</span>
              </li>
            ))}
          </ol>
        </Card>

      </div>

      {/* ════════════════════════════════════════
          TIER 2: Secondary
      ════════════════════════════════════════ */}

      {/* Executive Summary */}
      <Card>
        <SectionLabel icon="📋" title="Executive Summary" />
        <p className="text-sm leading-7 text-zinc-300 print:text-zinc-800">{report.executiveSummary}</p>
      </Card>

      {/* Reader Reaction */}
      {report.readerReaction && (
        <Card className="!bg-zinc-950/70 border-zinc-700/50">
          <SectionLabel icon="👁" title="Reader Reaction" />
          <p className="text-sm leading-7 text-zinc-400 italic print:text-zinc-700">{report.readerReaction}</p>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <SectionLabel icon="📊" title="Category Breakdown" />
        <div className="space-y-3.5">
          <CategoryBar label="Concept" score={cs.concept} />
          <CategoryBar label="Structure" score={cs.structure} />
          <CategoryBar label="Characters" score={cs.characters} />
          <CategoryBar label="Dialogue" score={cs.dialogue} />
          <CategoryBar label="Pacing" score={cs.pacing} />
          <CategoryBar label="Marketability" score={cs.marketability} />
        </div>
      </Card>

      {/* ════════════════════════════════════════
          TIER 3: Tertiary
      ════════════════════════════════════════ */}

      {/* Comparable Titles + Commercial Outlook */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="!bg-zinc-950/60">
          <SectionLabel icon="🎬" title="Comparable Titles" />
          <ul className="space-y-3">
            {report.comparableTitles.map((comp: ComparableTitle, i) => (
              <li key={i}>
                <p className="text-sm font-semibold text-white">{comp.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{comp.reason}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="!bg-zinc-950/60">
          <SectionLabel icon="📈" title="Commercial Outlook" />
          <ul className="space-y-2">
            {report.commercialOutlook.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <SectionLabel icon="✅" title="Strengths" />
          <ul className="space-y-2">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionLabel icon="⚠️" title="Weaknesses" />
          <ul className="space-y-2">
            {report.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Logline */}
      <Card className="!bg-zinc-950/60">
        <SectionLabel icon="🎯" title="Premise Evaluation" />
        <p className="text-sm leading-7 text-zinc-400">{report.loglineFeedback}</p>
      </Card>

      {/* ── Collapsible Craft Sections ── */}
      <div className="pt-1">
        <p className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
          Detailed Analysis
        </p>
        <div className="space-y-2">
          <Accordion icon="🧱" title="Structure" score={cs.structure}>
            <CraftSection notes={report.structureNotes} />
          </Accordion>
          <Accordion icon="🎭" title="Characters" score={cs.characters}>
            <CraftSection notes={report.characterNotes} />
          </Accordion>
          <Accordion icon="💬" title="Dialogue" score={cs.dialogue}>
            <CraftSection notes={report.dialogueNotes} />
          </Accordion>
          <Accordion icon="⚡" title="Pacing" score={cs.pacing}>
            <CraftSection notes={report.pacingNotes} />
          </Accordion>
          <Accordion icon="📈" title="Marketability" score={cs.marketability}>
            <CraftSection notes={report.marketabilityNotes} />
          </Accordion>
        </div>
      </div>

      {/* ── Feedback ── */}
      <FeedbackWidget title={report.title} />

    </div>
  );
}

// ── Feedback Widget ───────────────────────────────────────────────────────────

function FeedbackWidget({ title }: { title: string }) {
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async () => {
    if (!rating) return;
    setStatus("sending");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, rating, comment }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-8 text-center">
        <p className="text-2xl mb-2">🙏</p>
        <p className="text-sm font-semibold text-white">Thanks for the feedback.</p>
        <p className="text-xs text-zinc-500 mt-1">It helps us improve every report.</p>
      </div>
    );
  }

  const stars = [1, 2, 3, 4, 5];
  const labels: Record<number, string> = {
    1: "Missed the mark",
    2: "Somewhat useful",
    3: "Pretty accurate",
    4: "Very accurate",
    5: "Spot on",
  };
  const active = hovered ?? rating;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
        Rate This Report
      </p>
      <p className="text-sm text-zinc-400 mb-6">
        How accurately did this coverage reflect your script?
      </p>

      {/* Stars */}
      <div className="flex items-center gap-1.5 mb-1">
        {stars.map((s) => (
          <button
            key={s}
            onClick={() => setRating(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(null)}
            className="text-3xl transition-transform hover:scale-110 focus:outline-none leading-none"
          >
            <span className={active !== null && s <= active ? "text-amber-400" : "text-zinc-700"}>
              ★
            </span>
          </button>
        ))}
        {active && (
          <span className="ml-3 text-xs text-zinc-400">{labels[active]}</span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What could have been more accurate or useful? (optional)"
        rows={3}
        className="mt-5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500 focus:outline-none resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={!rating || status === "sending"}
        className="mt-3 rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black hover:bg-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Sending…" : "Submit Feedback"}
      </button>

      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">Something went wrong — please try again.</p>
      )}
    </div>
  );
}
