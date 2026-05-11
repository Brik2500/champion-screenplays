"use client";

import ScriptForm from "@/components/ScriptForm";

export default function AnalyzePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Get Your Coverage</p>
        <h1 className="text-3xl font-black text-white">Analyze Your Script</h1>
        <p className="mt-2 text-zinc-400">
          Fill in your script details, upload your file, and complete the one-time $19 payment. Your full coverage report will be ready in minutes.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <ScriptForm />
      </div>

      {/* Reassurance row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
        {[
          { icon: "⚡", label: "Results in Minutes", sub: "No waiting days for feedback" },
          { icon: "🔒", label: "Secure Payment", sub: "Processed by Stripe" },
          { icon: "🗑️", label: "Script Not Stored", sub: "Deleted after analysis" },
        ].map(({ icon, label, sub }) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-5">
            <p className="text-2xl mb-2">{icon}</p>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
