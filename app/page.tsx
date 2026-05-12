"use client";

import Link from "next/link";
import { useState } from "react";
import HeroPreview from "@/components/landing/HeroPreview";
import AnalysisReport from "@/components/AnalysisReport";
import { SAMPLE_REPORT } from "@/lib/sampleReport";

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-amber-500">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-zinc-800/60" />;
}

// ── Landing page ──────────────────────────────────────────────────────────────

export default function Home() {
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="space-y-0">

      {/* ══════════════════════════════════════
          SECTION 1: HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-2 pb-20 sm:pb-28">

        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />

        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">

          {/* Left: copy */}
          <div className="space-y-8">
            <div className="space-y-5">

              {/* Logo + label */}
              <div className="w-fit">
                <img src="/logo.png" alt="Champion Screenplays" className="h-72 w-auto -mt-10 -mb-8 -ml-6" style={{ mixBlendMode: "screen" }} />
                <p className="text-sm font-bold uppercase tracking-widest text-amber-500">
                  Platform-Ready Storytelling
                </p>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Industry-Level Coverage for Serious Screenwriters.
              </h1>

              {/* Subheadline */}
              <p className="text-lg leading-relaxed text-zinc-400 max-w-lg">
                Understand what is working, what is holding your script back, and what to fix first.
                Professional screenplay development coverage built for serious writers.
              </p>

              {/* Positioning lines */}
              <div className="space-y-2 pt-1">
                <p className="text-xl font-semibold text-zinc-100">
                  Built to evaluate scripts the way development teams do.
                </p>
                <p className="text-base text-zinc-400">
                  Inspired by professional screenplay development standards.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/analyze"
                  className="rounded-lg bg-amber-500 px-7 py-3.5 font-bold text-black transition hover:bg-amber-400"
                >
                  Get Your Coverage
                </Link>
                <button
                  onClick={() => {
                    setShowSample(true);
                    setTimeout(() => {
                      document.getElementById("sample")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className="rounded-lg border border-zinc-700 px-7 py-3.5 font-semibold text-zinc-300 transition hover:border-amber-500/60 hover:text-amber-400"
                >
                  See a Sample Report
                </button>
              </div>
              {/* Trust micro-copy */}
              <p className="text-xs text-zinc-600">
                Your screenplay remains private. Files are never shared or stored.
              </p>
            </div>
          </div>

          {/* Right: UI preview */}
          <div className="flex justify-center lg:justify-end">
            <HeroPreview />
          </div>

        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════
          SECTION 2: WHAT YOU GET
      ══════════════════════════════════════ */}
      <section className="py-20 sm:py-24">
        <div className="mb-12 text-center">
          <SectionLabel>What You Get</SectionLabel>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Development coverage built for serious writers.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-400">
            Every report reads your specific script. Not a template. Not a checklist.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "🧱",
              title: "Story & Structure",
              summary: "Turning points, scene escalation, act architecture, and pacing evaluated against the demands of your format.",
              points: [
                "Three-act structure & turning points",
                "Scene rhythm & sequence pacing",
                "Narrative escalation analysis",
              ],
            },
            {
              icon: "🎭",
              title: "Character & Voice",
              summary: "How your protagonist functions, whether your characters earn their scenes, and whether your dialogue carries weight.",
              points: [
                "Character arc & motivation clarity",
                "Dialogue voice & subtext",
                "Relationship dynamics & function",
              ],
            },
            {
              icon: "📈",
              title: "Commercial Positioning",
              summary: "Where your script sits in today's market. Platform fit, audience, comparable titles, and commercial viability.",
              points: [
                "Streaming platform positioning",
                "Format-matched comparable titles",
                "Budget tier & market readiness",
              ],
            },
            {
              icon: "🔧",
              title: "Rewrite Roadmap",
              summary: "Prioritized, root-cause fixes — not surface notes. Know exactly what to address and why it matters.",
              points: [
                "Root-cause diagnosis, not symptoms",
                "Priority-ordered rewrite guidance",
                "Development-ready next steps",
              ],
            },
          ].map(({ icon, title, summary, points }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-zinc-700"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="text-lg">{icon}</span>
                <h3 className="font-bold text-white">{title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 mb-4">{summary}</p>
              <ul className="space-y-1.5 border-t border-zinc-800 pt-4">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/50" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════
          SECTION 3: SAMPLE REPORT
      ══════════════════════════════════════ */}
      <section id="sample" className="py-20 sm:py-24">
        <div className="mb-10 text-center">
          <SectionLabel>Sample Report</SectionLabel>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            See the depth of analysis you will receive.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-400">
            Full development coverage on a sample TV pilot. This is exactly what your report looks like.
          </p>
        </div>

        {showSample ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
            <AnalysisReport report={SAMPLE_REPORT} onReset={() => {}} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800/80"
              style={{ boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}>

              {/* Blurred preview */}
              <div className="pointer-events-none select-none blur-sm opacity-50 p-6 sm:p-10 bg-zinc-950">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-2xl font-black text-white">Harbor</p>
                    <p className="text-sm text-zinc-500">by Elena Cruz · TV Pilot · Crime Drama</p>
                  </div>
                  <span className="rounded border border-amber-700/50 bg-amber-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    Consider
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                  <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Industry Verdict</p>
                    <p className="font-black text-amber-400 text-lg">CONSIDER</p>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">High-concept premise with streaming appeal...</p>
                  </div>
                  <div className="col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Executive Summary</p>
                    <div className="space-y-2">
                      <div className="h-2 w-full rounded bg-zinc-700" />
                      <div className="h-2 w-5/6 rounded bg-zinc-700" />
                      <div className="h-2 w-full rounded bg-zinc-700" />
                      <div className="h-2 w-4/5 rounded bg-zinc-700" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  {["Concept", "Structure", "Characters", "Dialogue", "Pacing", "Marketability"].map((cat) => (
                    <div key={cat} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-center">
                      <p className="text-[8px] text-zinc-600 mb-1">{cat}</p>
                      <div className="h-1 rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-amber-500/60 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5"
                style={{ background: "linear-gradient(to top, rgba(9,9,11,0.97) 0%, rgba(9,9,11,0.7) 50%, rgba(9,9,11,0.3) 100%)" }}>
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Sample Coverage</p>
                  <p className="text-xl font-black text-white">Harbor · TV Pilot</p>
                  <p className="text-sm text-zinc-400">by Elena Cruz</p>
                </div>
                <button
                  onClick={() => setShowSample(true)}
                  className="rounded-lg bg-amber-500 px-8 py-3 font-bold text-black transition hover:bg-amber-400"
                >
                  View Full Report
                </button>
                <p className="text-xs text-zinc-600">Full development coverage · No sign-in required</p>
              </div>
            </div>

          </div>
        )}
      </section>

      <Divider />

      {/* ══════════════════════════════════════
          SECTION 4: BUILT FOR
      ══════════════════════════════════════ */}
      <section className="py-20 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">

          <div>
            <SectionLabel>Built For</SectionLabel>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              For writers who take their work seriously.
            </h2>
            <p className="mt-4 text-zinc-400 leading-relaxed max-w-sm">
              Champion Screenplays is built for the streaming era, where development standards
              are higher, formats are more varied, and commercial awareness matters as much as craft.
            </p>
            <div className="mt-8 space-y-2 border-t border-zinc-800/60 pt-6">
              <p className="text-sm text-zinc-300 font-medium">Built to evaluate scripts the way development teams do.</p>
              <p className="text-xs text-zinc-600">Inspired by professional screenplay development standards.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { title: "Screenwriters", desc: "Development notes you would pay thousands for, before your first pitch." },
              { title: "Filmmakers", desc: "Understand what is working and what to address before you lock picture." },
              { title: "TV Creators", desc: "Evaluate your pilot's episodic engine, season sustainability, and platform fit." },
              { title: "Indie Producers", desc: "Assess commercial viability and streaming readiness before greenlight." },
              { title: "Feature Writers", desc: "Structural, character, and market-readiness analysis built around your format." },
              { title: "Writing Programs", desc: "Professional-grade coverage aligned with how the industry actually reads scripts." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700">
                <p className="font-semibold text-white text-sm mb-1.5">{title}</p>
                <p className="text-xs leading-relaxed text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ══════════════════════════════════════
          SECTION 5: PRICING
      ══════════════════════════════════════ */}
      <section id="pricing" className="py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-base font-bold uppercase tracking-widest text-amber-500">Pricing</p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            One Script. One Report.<br />No Subscription.
          </h2>
          <p className="mt-3 text-zinc-400">Pay per analysis. Cancel nothing.</p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <div
            className="rounded-xl border border-amber-600/40 p-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)" }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-xl" style={{
              background: "radial-gradient(ellipse at top right, rgba(245,158,11,0.08), transparent 55%)"
            }} />

            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">

              {/* Left: price + description + CTA */}
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Development Coverage</p>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-6xl font-black text-white leading-none">$19</span>
                    <span className="mb-1.5 text-sm text-zinc-500">per analysis</span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                    Full section-by-section development coverage. Everything you need to understand your script, identify what to fix, and move forward with confidence.
                  </p>
                </div>
                <Link
                  href="/analyze"
                  className="block rounded-lg bg-amber-500 py-3.5 text-center font-bold text-black transition hover:bg-amber-400"
                >
                  Get Your Coverage
                </Link>
              </div>

              {/* Right: feature list */}
              <div className="border-t border-zinc-800/60 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">What's included</p>
                <ul className="grid grid-cols-1 gap-y-2.5 sm:grid-cols-2">
                  {[
                    "Industry verdict & score",
                    "Executive summary",
                    "Reader reaction analysis",
                    "Strengths & weaknesses",
                    "Premise & concept evaluation",
                    "Commercial outlook",
                    "Format-matched comps",
                    "Craft breakdowns by section",
                    "Priority rewrite roadmap",
                    "PDF export & copy",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          Secure upload. Your screenplay is never shared, stored, or used for training.
        </p>
      </section>

      <Divider />

      {/* ══════════════════════════════════════
          SECTION 6: FINAL CTA
      ══════════════════════════════════════ */}
      <section className="py-24 sm:py-32 text-center">
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.05), transparent 70%)" }} />
          <p className="text-base font-bold uppercase tracking-widest text-amber-500">
            Ready When You Are
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Your script deserves serious feedback.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-zinc-400 leading-relaxed">
            Upload your screenplay and receive professional development coverage in minutes.
            Know what to fix. Know what is working. Move forward with clarity.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/analyze"
              className="rounded-lg bg-amber-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-amber-400"
            >
              Get Your Coverage
            </Link>
            <button
              onClick={() => {
                setShowSample(true);
                document.getElementById("sample")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-sm text-zinc-500 transition hover:text-zinc-300 underline underline-offset-4"
            >
              View a sample report first
            </button>
          </div>
          <p className="mt-6 text-xs text-zinc-600">Your screenplay remains private. Files are never shared.</p>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-zinc-800 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/faq" className="transition hover:text-zinc-400">FAQ</Link>
            <Link href="/#pricing" className="transition hover:text-zinc-400">Pricing</Link>
            <Link href="/#sample" className="transition hover:text-zinc-400">Sample Report</Link>
            <a href="mailto:support@championscreenplays.com" className="transition hover:text-zinc-400">Contact</a>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Champion Screenplays · Professional screenplay development coverage.
          </p>
          <p className="text-xs text-zinc-700">
            Your work stays private. Scripts are never stored or shared.
          </p>
        </div>
      </div>

    </div>
  );
}
