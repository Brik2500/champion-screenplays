"use client";

import { useEffect, useState, useRef } from "react";

// ── Content ────────────────────────────────────────────────────────────────────

const STAGES = [
  "Uploading screenplay…",
  "Extracting screenplay text…",
  "Identifying story structure…",
  "Evaluating character arcs…",
  "Analyzing dialogue patterns…",
  "Measuring pacing and tension…",
  "Evaluating commercial potential…",
  "Generating coverage report…",
  "Finalizing analysis…",
];

// Each stage holds for this many seconds before advancing
const STAGE_DURATIONS = [3, 5, 9, 9, 9, 9, 9, 12, 999];

const INSIGHTS = [
  "Strong second acts are where most scripts are won or lost.",
  "Successful pilots establish conflict within the first 10 pages.",
  "Dialogue is strongest when characters avoid saying exactly what they mean.",
  "High-concept scripts are significantly easier to market internationally.",
  "Great antagonists believe they are the hero of their own story.",
  "Coverage readers form their opinion within the first 15 pages.",
  "Scene economy is one of the most underrated professional screenwriting skills.",
  "The best character arcs are earned through action, not exposition.",
  "Clear protagonist goals improve reader engagement throughout.",
  "Genre clarity dramatically increases a script's commercial pitch-ability.",
];

// ── Decorative background cards ────────────────────────────────────────────────

const BG_CARDS = [
  { top: "12%",  left: "6%",   w: 120, h: 80,  rot: "-8deg",  op: 0.04, delay: "0s"    },
  { top: "22%",  right: "5%",  w: 100, h: 70,  rot: "6deg",   op: 0.04, delay: "0.8s"  },
  { top: "55%",  left: "4%",   w: 90,  h: 60,  rot: "-5deg",  op: 0.03, delay: "1.4s"  },
  { top: "65%",  right: "6%",  w: 110, h: 75,  rot: "9deg",   op: 0.03, delay: "0.4s"  },
  { top: "80%",  left: "12%",  w: 80,  h: 55,  rot: "-12deg", op: 0.025, delay: "1s"   },
  { top: "75%",  right: "12%", w: 95,  h: 65,  rot: "4deg",   op: 0.025, delay: "1.6s" },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function LoadingStatus() {
  const [stageIndex, setStageIndex] = useState(0);
  const [stageKey, setStageKey]     = useState(0);   // remount text for animation
  const [progress, setProgress]     = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [insightKey, setInsightKey]     = useState(0);

  const elapsed = useRef(0);

  // ── Progress + stage advancement ──────────────────────────────────────────
  useEffect(() => {
    const TARGET_SECONDS = 75; // approx total time
    let totalElapsed = 0;
    let currentStage = 0;
    let stageElapsed = 0;

    const tick = setInterval(() => {
      totalElapsed += 0.8;
      stageElapsed += 0.8;
      elapsed.current = totalElapsed;

      // Progress: ease toward 92%, slow near end
      setProgress((p) => {
        const target = Math.min((totalElapsed / TARGET_SECONDS) * 92, 92);
        return p + (target - p) * 0.07;
      });

      // Advance stage
      if (
        currentStage < STAGES.length - 1 &&
        stageElapsed >= STAGE_DURATIONS[currentStage]
      ) {
        currentStage += 1;
        stageElapsed = 0;
        setStageIndex(currentStage);
        setStageKey((k) => k + 1);
      }
    }, 800);

    return () => clearInterval(tick);
  }, []);

  // ── Insights rotation ──────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setInsightIndex((i) => (i + 1) % INSIGHTS.length);
      setInsightKey((k) => k + 1);
    }, 7000);
    return () => clearInterval(iv);
  }, []);

  const pct = Math.round(progress);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-16">

      {/* ── Decorative blurred bg cards ── */}
      {BG_CARDS.map((c, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-lg border border-amber-500/10 bg-zinc-800/20 backdrop-blur-sm"
          style={{
            top: c.top,
            left: "left" in c ? c.left : undefined,
            right: "right" in c ? (c as { right?: string }).right : undefined,
            width: c.w,
            height: c.h,
            ["--rot" as string]: c.rot,
            ["--op" as string]: c.op,
            transform: `rotate(${c.rot})`,
            opacity: c.op,
            animation: `card-drift ${5 + i * 0.7}s ease-in-out infinite ${c.delay}`,
          }}
        />
      ))}

      {/* ── Ambient glow background ── */}
      <div
        className="glow-breathe pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-10 text-center">

        {/* Trophy emblem */}
        <div className="relative">
          {/* Outer pulse ring */}
          <div className="ring-pulse absolute inset-0 rounded-full border border-amber-500/30" />
          {/* Second slower ring */}
          <div
            className="ring-pulse absolute inset-[-8px] rounded-full border border-amber-500/15"
            style={{ animationDelay: "1.2s" }}
          />
          {/* Glow halo */}
          <div
            className="glow-breathe absolute inset-[-16px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(245,158,11,0.18) 0%, transparent 70%)",
            }}
          />
          {/* Circle */}
          <div
            className="trophy-float relative flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)",
              boxShadow: "0 0 40px rgba(245,158,11,0.15), inset 0 1px 0 rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            <span
              className="text-5xl select-none"
              style={{ filter: "drop-shadow(0 0 16px rgba(245,158,11,0.55))" }}
            >
              🏆
            </span>
          </div>
        </div>

        {/* Stage label */}
        <div className="flex flex-col items-center gap-2">
          <p
            key={stageKey}
            className="stage-in text-lg font-semibold tracking-tight text-white"
          >
            {STAGES[stageIndex]}
          </p>
          <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
            Our analysis engine is evaluating story structure, pacing,
            character development, and marketability.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-72 sm:w-96">
          <div className="mb-2.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-zinc-600">
            <span>Analyzing</span>
            <span className="text-amber-600">{pct}%</span>
          </div>
          <div
            className="relative h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(39,39,42,0.8)" }}
          >
            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #92400e, #d97706, #fbbf24, #f59e0b)",
              }}
            />
            {/* Shimmer */}
            <div
              className="bar-shimmer absolute inset-y-0 w-1/3 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
              }}
            />
            {/* Glow layer */}
            <div
              className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-60 transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #d97706, #fbbf24)",
              }}
            />
          </div>

          {/* Stage dots */}
          <div className="mt-3 flex justify-between">
            {STAGES.slice(0, -1).map((_, i) => (
              <div
                key={i}
                className="h-1 w-1 rounded-full transition-all duration-500"
                style={{
                  background: i <= stageIndex ? "#f59e0b" : "#3f3f46",
                  opacity: i <= stageIndex ? 1 : 0.4,
                  boxShadow: i === stageIndex ? "0 0 6px rgba(245,158,11,0.7)" : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Script insight rotator */}
        <div className="h-8 flex items-center justify-center">
          <p
            key={insightKey}
            className="insight-in max-w-sm text-center text-xs italic leading-relaxed text-zinc-600"
          >
            &ldquo;{INSIGHTS[insightIndex]}&rdquo;
          </p>
        </div>

      </div>
    </div>
  );
}
