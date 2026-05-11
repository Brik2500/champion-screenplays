"use client";

import { useState } from "react";
import ScriptForm from "@/components/ScriptForm";
import AnalysisReport from "@/components/AnalysisReport";
import LoadingStatus from "@/components/LoadingStatus";
import type { AnalysisReport as ReportType } from "@/lib/types";

export default function AnalyzePage() {
  const [report, setReport] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(false);

  if (loading) return <LoadingStatus />;

  if (report) {
    return <AnalysisReport report={report} onReset={() => setReport(null)} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Analyze Your Script</h1>
        <p className="mt-2 text-zinc-400">
          Upload your screenplay and receive professional development coverage in minutes.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <ScriptForm
          onLoadingChange={setLoading}
          onReport={(r) => { setLoading(false); setReport(r); }}
        />
      </div>
    </div>
  );
}
