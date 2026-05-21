"use client";

import { useState, useRef, DragEvent } from "react";
import AnalysisReport from "@/components/AnalysisReport";
import LoadingStatus from "@/components/LoadingStatus";
import type { AnalysisReport as ReportType } from "@/lib/types";

const PASSPHRASE = "champion2025";

const GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Musical", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "Western",
];

const FORMATS = ["Feature", "Short", "TV Pilot"] as const;
const ACCEPTED = ".pdf,.txt,.fountain,.fdx";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DevPage() {
  // Gate
  const [unlocked, setUnlocked] = useState(false);
  const [pass, setPass] = useState("");
  const [passError, setPassError] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [writerName, setWriterName] = useState("");
  const [genre, setGenre] = useState("");
  const [secondaryGenre, setSecondaryGenre] = useState("");
  const [format, setFormat] = useState<"Feature" | "Short" | "TV Pilot">("Feature");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportType | null>(null);
  const ran = useRef(false);

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition";

  const acceptFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt", "fountain", "fdx"].includes(ext ?? "")) {
      setError("Unsupported file type.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB).");
      return;
    }
    setFile(f);
    setError(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Upload a script file."); return; }
    if (ran.current) return;
    ran.current = true;
    setError(null);
    setLoading(true);

    try {
      const body = new FormData();
      body.append("title", title);
      body.append("writerName", writerName);
      body.append("genre", genre);
      if (secondaryGenre) body.append("secondaryGenre", secondaryGenre);
      body.append("format", format);
      body.append("file", file);

      const res = await fetch("/api/analyze", { method: "POST", body });

      if (!res.ok) {
        let msg = "Analysis failed.";
        try { const d = await res.json(); if (d.error) msg = d.error; } catch {}
        throw new Error(msg);
      }

      const result = await res.json();
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      ran.current = false;
    } finally {
      setLoading(false);
    }
  };

  // ── Passphrase gate ──
  if (!unlocked) {
    return (
      <div className="mx-auto max-w-sm py-32 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-6">Dev Access</p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
          <p className="text-white font-semibold mb-4">Enter passphrase</p>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pass === PASSPHRASE) setUnlocked(true);
                else setPassError(true);
              }
            }}
            className={inputClass + " mb-3 text-center tracking-widest"}
            placeholder="••••••••"
            autoFocus
          />
          {passError && <p className="text-xs text-red-400 mb-3">Incorrect passphrase.</p>}
          <button
            onClick={() => {
              if (pass === PASSPHRASE) setUnlocked(true);
              else setPassError(true);
            }}
            className="w-full rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  // ── Report view ──
  if (report) {
    return (
      <AnalysisReport
        report={report}
        onReset={() => {
          setReport(null);
          setFile(null);
          setTitle("");
          setWriterName("");
          setGenre("");
          setSecondaryGenre("");
          setFormat("Feature");
          ran.current = false;
        }}
      />
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="mx-auto max-w-xl py-24 text-center">
        <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <LoadingStatus />
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Dev — No Payment</p>
        <h1 className="text-2xl font-black text-white">Test Run</h1>
        <p className="mt-1 text-sm text-zinc-500">Calls /api/analyze directly. No Stripe, no charge.</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Script Title</label>
              <input required type="text" placeholder="e.g. The Last Horizon"
                value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Writer Name</label>
              <input required type="text" placeholder="e.g. Jane Smith"
                value={writerName} onChange={(e) => setWriterName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Primary Genre</label>
              <select required value={genre}
                onChange={(e) => { setGenre(e.target.value); if (e.target.value === secondaryGenre) setSecondaryGenre(""); }}
                className={inputClass}>
                <option value="" disabled>Select genre...</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Secondary Genre <span className="text-zinc-500 font-normal">— optional</span>
              </label>
              <select value={secondaryGenre} onChange={(e) => setSecondaryGenre(e.target.value)} className={inputClass}>
                <option value="">None</option>
                {GENRES.filter((g) => g !== genre).map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className={inputClass}>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">Script File</label>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging ? "border-amber-500 bg-amber-500/10"
                : file ? "border-emerald-600 bg-emerald-950/30"
                : "border-zinc-700 bg-zinc-800/50 hover:border-amber-500/60 hover:bg-zinc-800"
              }`}
            >
              {file ? (
                <>
                  <span className="text-3xl">✅</span>
                  <p className="font-medium text-emerald-400">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(0)} KB · <span className="text-amber-500 underline">Replace</span></p>
                </>
              ) : (
                <>
                  <span className="text-3xl">📄</span>
                  <p className="font-medium text-white">Drop script here or click to browse</p>
                  <p className="text-xs text-zinc-500">PDF · FDX · Fountain · TXT · up to 10 MB</p>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }} />
          </div>

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-6 py-3.5 text-base font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Run Analysis (Free)
          </button>
        </form>
      </div>
    </div>
  );
}
