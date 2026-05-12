"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AnalysisReport from "@/components/AnalysisReport";
import LoadingStatus from "@/components/LoadingStatus";
import type { AnalysisReport as ReportType } from "@/lib/types";

type Stage = "verifying" | "analyzing" | "done" | "error";

function SuccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session_id");
  const [stage, setStage] = useState<Stage>("verifying");
  const [report, setReport] = useState<ReportType | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!sessionId || ran.current) return;
    ran.current = true;

    async function run() {
      try {
        // 1. Verify payment with Stripe
        const verifyRes = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        if (!verifyRes.ok) {
          let msg = "Payment verification failed. Please contact us with your order details.";
          try {
            const data = await verifyRes.json();
            if (data.error) msg = data.error;
          } catch { /* non-JSON response */ }
          throw new Error(msg);
        }

        // 2. Retrieve form data stored before checkout
        const storedRaw = sessionStorage.getItem("cs_pending_analysis");
        if (!storedRaw) {
          throw new Error(
            "Your session data was not found. This can happen if you opened the link in a different browser. Please return to the analyze page and try again."
          );
        }

        const stored = JSON.parse(storedRaw) as {
          title: string;
          writerName: string;
          genre: string;
          format: string;
          fileName: string;
          fileType: string;
          fileBase64: string;
        };

        // 3. Reconstruct the File from base64
        const binary = atob(stored.fileBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: stored.fileType });
        const file = new File([blob], stored.fileName, { type: stored.fileType });

        // 4. Run analysis
        setStage("analyzing");

        const body = new FormData();
        body.append("title", stored.title);
        body.append("writerName", stored.writerName);
        body.append("genre", stored.genre);
        body.append("format", stored.format);
        body.append("file", file);

        const analyzeRes = await fetch("/api/analyze", { method: "POST", body });
        if (!analyzeRes.ok) {
          let msg = "Analysis failed. Please return to the analyze page and try again.";
          try {
            const data = await analyzeRes.json();
            if (data.error) msg = data.error;
          } catch {
            if (analyzeRes.status === 504 || analyzeRes.status === 408) {
              msg = "Analysis timed out — your script may be very long. Please try again.";
            }
          }
          throw new Error(msg);
        }

        let result;
        try {
          result = await analyzeRes.json();
        } catch {
          throw new Error("Analysis returned an unexpected response. Please try again.");
        }

        // 5. Clean up session storage
        sessionStorage.removeItem("cs_pending_analysis");

        setReport(result);
        setStage("done");
      } catch (err) {
        console.error("[success]", err);
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
        setStage("error");
      }
    }

    run();
  }, [sessionId]);

  if (stage === "done" && report) {
    return <AnalysisReport report={report} onReset={() => router.push("/analyze")} />;
  }

  if (stage === "error") {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <div className="rounded-xl border border-red-800 bg-red-950/30 px-8 py-10">
          <p className="text-3xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">{errorMsg}</p>
          <a
            href="/analyze"
            className="inline-block rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition"
          >
            Return to Analyze
          </a>
          <p className="mt-4 text-xs text-zinc-600">
            Your payment was processed. Email us at{" "}
            <a href="mailto:support@championscreenplays.com" className="text-amber-500 underline underline-offset-2">
              support@championscreenplays.com
            </a>{" "}
            and we will make it right.
          </p>
        </div>
      </div>
    );
  }

  // verifying or analyzing
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <div className="mb-8">
        <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        {stage === "verifying" ? (
          <>
            <h2 className="text-lg font-semibold text-white mb-2">Confirming your payment...</h2>
            <p className="text-sm text-zinc-500">Just a moment.</p>
          </>
        ) : (
          <LoadingStatus />
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl py-24 text-center">
          <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
