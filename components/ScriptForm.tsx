"use client";

import { useState, useRef, DragEvent } from "react";

const GENRES = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Musical", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "Western",
];

const FORMATS = ["Feature", "Short", "TV Pilot"] as const;

const ACCEPTED = ".pdf,.txt,.fountain,.fdx";

export default function ScriptForm() {
  const [title, setTitle] = useState("");
  const [writerName, setWriterName] = useState("");
  const [genre, setGenre] = useState("");
  const [secondaryGenre, setSecondaryGenre] = useState("");
  const [format, setFormat] = useState<"Feature" | "Short" | "TV Pilot">("Feature");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    const supported = ["pdf", "txt", "fountain", "fdx"];
    if (!supported.includes(ext ?? "")) {
      setError("Unsupported file type. Please upload a PDF, TXT, Fountain, or FDX file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large. Please upload a file under 10 MB.");
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
    if (!file) { setError("Please upload a script file."); return; }
    setError(null);
    setLoading(true);

    try {
      const base64 = await fileToBase64(file);

      sessionStorage.setItem(
        "cs_pending_analysis",
        JSON.stringify({
          title,
          writerName,
          genre,
          secondaryGenre: secondaryGenre || undefined,
          format,
          email: email.toLowerCase().trim(),
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileBase64: base64,
        })
      );

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, writerName, genre, secondaryGenre: secondaryGenre || undefined, format, email: email.toLowerCase().trim() }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Could not start checkout.");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Script Title</label>
          <input
            required type="text" placeholder="e.g. The Last Horizon"
            value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Writer Name</label>
          <input
            required type="text" placeholder="e.g. Jane Smith"
            value={writerName} onChange={(e) => setWriterName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Primary Genre</label>
          <select required value={genre} onChange={(e) => { setGenre(e.target.value); if (e.target.value === secondaryGenre) setSecondaryGenre(""); }} className={inputClass}>
            <option value="" disabled>Select genre...</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Secondary Genre <span className="text-zinc-500 font-normal">— optional</span>
          </label>
          <select
            value={secondaryGenre}
            onChange={(e) => setSecondaryGenre(e.target.value)}
            className={inputClass}
          >
            <option value="">None (single genre)</option>
            {GENRES.filter((g) => g !== genre).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <p className="mt-1.5 text-[11px] text-zinc-500 leading-relaxed">
            Pick this if your script has a meaningful second genre layer — e.g. a Crime script with a strong Romance thread, or a Horror with Comedy woven throughout. Skip it if the second genre is minor.
          </p>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className={inputClass}>
            {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Your Email <span className="text-zinc-600 font-normal">— report will be sent here automatically</span>
        </label>
        <input
          required type="email" placeholder="your@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* File Upload Zone */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">Script File</label>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
            dragging
              ? "border-amber-500 bg-amber-500/10"
              : file
              ? "border-emerald-600 bg-emerald-950/30"
              : "border-zinc-700 bg-zinc-800/50 hover:border-amber-500/60 hover:bg-zinc-800"
          }`}
        >
          {file ? (
            <>
              <span className="text-3xl">✅</span>
              <p className="font-medium text-emerald-400">{file.name}</p>
              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(0)} KB · Ready for analysis ·{" "}
                <span className="text-amber-500 underline">Replace</span>
              </p>
            </>
          ) : (
            <>
              <span className="text-3xl">📄</span>
              <div>
                <p className="font-medium text-white">Drop your script here</p>
                <p className="mt-1 text-sm text-zinc-400">or click to browse</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {["PDF", "FDX", "Fountain", "TXT"].map((f) => (
                  <span key={f} className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{f}</span>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600">Up to 10 MB · Features, Shorts, TV Pilots</p>
            </>
          )}
        </div>
        <input
          ref={inputRef} type="file" accept={ACCEPTED} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <span>🔒</span>
        <span>Secured by Stripe. Your script is never stored. One-time payment, no subscription.</span>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full rounded-lg bg-amber-500 px-6 py-3.5 text-base font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Preparing checkout..." : "Get Coverage — $19"}
      </button>

      {/* What happens next */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">What happens next</p>
        <div className="flex items-start gap-6 flex-wrap">
          {[
            { icon: "💳", label: "Secure $19 checkout via Stripe" },
            { icon: "⚡", label: "Analysis runs in minutes" },
            { icon: "📋", label: "Report delivered on-screen" },
            { icon: "📧", label: "PDF sent to your email" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-sm">{icon}</span>
              <span className="text-[11px] text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
