"use client";

// A pixel-faithful mockup of the actual report UI. No fake screenshots,
// just the real design language rendered as static HTML.
export default function HeroPreview() {
  return (
    <div
      className="relative w-full max-w-md select-none overflow-hidden rounded-2xl border border-zinc-700/60 shadow-2xl"
      style={{
        background: "linear-gradient(160deg, #18181b 0%, #09090b 100%)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.08)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="ml-3 text-[10px] text-zinc-600">Champion Screenplays: Analysis Report</span>
      </div>

      <div className="space-y-3 p-4">

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-black text-white">Harbor</p>
            <p className="text-[11px] text-zinc-500">by Elena Cruz · TV Pilot · Crime Drama</p>
          </div>
          <span className="rounded border border-amber-700/50 bg-amber-950/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400">
            Consider
          </span>
        </div>

        {/* Verdict */}
        <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 px-3 py-2.5">
          <p className="mb-1.5 text-[8px] font-bold uppercase tracking-widest text-zinc-500">Industry Verdict</p>
          <p className="text-[11px] leading-relaxed text-zinc-300">
            High-concept procedural premise with genuine streaming appeal, held back by a fragmented second act.
          </p>
        </div>

        {/* Score + snapshot row */}
        <div className="grid grid-cols-5 gap-3">

          {/* Score */}
          <div className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
            <p className="mb-1 text-[8px] font-bold uppercase tracking-widest text-zinc-600">Score</p>
            <p className="text-4xl font-black leading-none text-amber-400">76</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">Promising</p>
          </div>

          {/* Snapshot */}
          <div className="col-span-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
            <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-zinc-600">Quick Snapshot</p>
            <ul className="space-y-1.5">
              {[
                "Strong conspiracy engine with season potential",
                "Lead character established through action",
                "Act Two pacing fragments momentum",
                "Maritime setting reduces budget needs",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span className="text-[10px] leading-tight text-zinc-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Category bars */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
          <p className="mb-2.5 text-[8px] font-bold uppercase tracking-widest text-zinc-600">Category Breakdown</p>
          <div className="space-y-2">
            {[
              { label: "Concept", score: 85, color: "bg-emerald-500" },
              { label: "Structure", score: 65, color: "bg-orange-500" },
              { label: "Characters", score: 74, color: "bg-amber-500" },
              { label: "Dialogue", score: 78, color: "bg-amber-500" },
              { label: "Pacing", score: 62, color: "bg-orange-500" },
              { label: "Marketability", score: 82, color: "bg-emerald-500" },
            ].map(({ label, score, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[9px] text-zinc-500">{label}</span>
                <div className="flex-1 h-1 rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
                </div>
                <span className="w-5 text-right text-[9px] font-bold text-zinc-400">{score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial outlook */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3">
          <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-zinc-600">Commercial Outlook</p>
          <ul className="space-y-1.5">
            {[
              "Strong fit for premium streaming, adult drama audience",
              "10-episode arc with high binge potential if pacing corrected",
              "Contained setting reduces production overhead",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-amber-500/60" />
                <span className="text-[10px] leading-tight text-zinc-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}
