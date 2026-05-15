import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Champion Screenplays",
  description: "Answers to common questions about Champion Screenplays coverage reports.",
};

const faqs = [
  {
    q: "What do I get for $19?",
    a: "A full development coverage report covering: industry verdict and overall score, executive summary, reader reaction, strengths and weaknesses, premise and concept evaluation, commercial outlook, comparable titles, craft breakdowns across structure, characters, dialogue, pacing, and marketability, plus a priority rewrite roadmap. It is the same type of coverage professional development executives use to evaluate scripts.",
  },
  {
    q: "How long does it take?",
    a: "Most reports are ready in 2 to 4 minutes after payment. You will see a loading screen while your script is being evaluated. The report appears on screen immediately when complete, and you can also send it to your inbox from the report page.",
  },
  {
    q: "Is my screenplay private?",
    a: "Yes. Your file is read once during analysis and is never stored, shared, or used for any other purpose. It is not saved to any database and is not used for training. Once the analysis is complete, your script is gone.",
  },
  {
    q: "What file formats do you accept?",
    a: "PDF (text-based), TXT, Fountain, and FDX (Final Draft). PDFs must have a text layer — if your screenplay was scanned as an image, it will not extract correctly. Export directly from Final Draft, WriterDuet, or Highland for best results.",
  },
  {
    q: "What script formats do you cover?",
    a: "Feature films, TV pilots, and short films. Select your format when submitting and the analysis will be calibrated to the structure and market expectations of that format.",
  },
  {
    q: "My PDF failed to upload. What do I do?",
    a: "Make sure your PDF was exported from screenwriting software like Final Draft, WriterDuet, or Highland — not scanned from a physical page. If the file was scanned, it does not contain selectable text and cannot be processed. Export a fresh PDF from your writing app and try again.",
  },
  {
    q: "How is this different from hiring a script consultant?",
    a: "Professional script consultants typically charge $300 to $800 and take one to two weeks to return notes. Champion Screenplays delivers detailed development coverage in minutes for $19. It covers the same core areas a development reader evaluates. It is not a replacement for a long-term creative collaborator, but it is a fast, affordable way to get serious, structured feedback before a pitch or rewrite.",
  },
  {
    q: "Can I get a refund?",
    a: "If your report fails to generate due to a technical issue, we will refund your purchase or re-run the analysis — no questions asked. If your report delivered successfully but you disagree with the analysis or creative notes, that does not qualify for a refund. Coverage reflects a professional analytical perspective, and creative disagreement is a normal part of the development process. If something went wrong technically, email us at support@championscreenplays.com and we will make it right.",
  },
  {
    q: "Can I submit the same script more than once?",
    a: "Yes. Many writers submit a draft, rewrite based on the notes, and submit again to see how the scores change. Each submission is a separate $19 charge.",
  },
  {
    q: "Can I print or save my report?",
    a: "Yes. Every report has a print button in the toolbar that opens a clean, print-ready version. You can also send the full report to your email directly from the report page — just enter your address and hit Send Report.",
  },
  {
    q: "Do you cover international screenwriters?",
    a: "Yes. You can submit from anywhere. Payment is processed in USD through Stripe.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit and debit cards through Stripe. Stripe is one of the most trusted payment processors in the world. Your card information is never handled by Champion Screenplays directly.",
  },
];

export default function FAQPage() {
  return (
    <div className="py-16 sm:py-20">

      {/* Header */}
      <div className="mb-14 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-500">FAQ</p>
        <h1 className="text-4xl font-black text-white sm:text-5xl">Frequently Asked Questions</h1>
        <p className="mx-auto mt-4 max-w-lg text-zinc-400 leading-relaxed">
          Everything you need to know before submitting your script.
        </p>
      </div>

      {/* Questions */}
      <div className="mx-auto max-w-2xl space-y-4">
        {faqs.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-5 open:border-amber-700/30 open:bg-amber-950/10 transition-colors"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
              <span className="font-semibold text-white text-sm leading-relaxed pr-2">{q}</span>
              <span className="mt-0.5 shrink-0 text-amber-500 text-lg leading-none group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-4">
              {a}
            </p>
          </details>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <p className="text-zinc-400 mb-5">Still have a question?</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/analyze"
            className="rounded-lg bg-amber-500 px-7 py-3 font-bold text-black transition hover:bg-amber-400"
          >
            Get Your Coverage
          </Link>
          <a
            href="mailto:support@championscreenplays.com"
            className="text-sm text-zinc-500 underline underline-offset-4 transition hover:text-zinc-300"
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}
