import type { AnalysisReport } from "./types";

const scoreLabel = (s: number) =>
  s >= 90 ? "Exceptional" : s >= 80 ? "Very Strong" : s >= 70 ? "Promising" : s >= 60 ? "Developing" : "Needs Work";

export async function generateReportPdf(report: AnalysisReport): Promise<Buffer> {
  const PDFDocument = (await import("pdfkit")).default;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 612 - 100; // usable width

    // ── Colors ──────────────────────────────────────────────────────────────────
    const AMBER = "#f59e0b";
    const WHITE = "#ffffff";
    const MUTED = "#71717a";
    const LIGHT = "#d4d4d8";
    const GREEN = "#10b981";
    const RED = "#ef4444";
    const BG = "#18181b";

    // ── Helpers ──────────────────────────────────────────────────────────────────
    const heading = (text: string, size = 11) => {
      doc.fontSize(8).fillColor(MUTED).font("Helvetica-Bold")
        .text(text.toUpperCase(), { characterSpacing: 1 });
      doc.moveDown(0.3);
    };

    const rule = () => {
      doc.moveDown(0.5);
      doc.strokeColor("#27272a").lineWidth(0.5)
        .moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.5);
    };

    const bullet = (text: string, color = AMBER) => {
      const x = doc.x;
      doc.fontSize(9).fillColor(color).text("•", x, doc.y, { continued: true, width: 12 });
      doc.fillColor(LIGHT).text(" " + text, { width: W - 12 });
    };

    const scoreBar = (label: string, score: number) => {
      const color = score >= 80 ? GREEN : score >= 65 ? AMBER : RED;
      const barW = W - 120;
      const y = doc.y;
      doc.fontSize(8).fillColor(MUTED).font("Helvetica").text(label, 50, y, { width: 100 });
      doc.roundedRect(155, y + 2, barW, 5, 2).fillColor("#27272a").fill();
      doc.roundedRect(155, y + 2, (barW * score) / 100, 5, 2).fillColor(color).fill();
      doc.fontSize(8).fillColor(color).font("Helvetica-Bold").text(String(score), 155 + barW + 6, y);
      doc.moveDown(0.9);
    };

    const verdictColor = report.industryVerdict.label === "Recommend" ? GREEN
      : report.industryVerdict.label === "Consider" ? AMBER : "#3b82f6";

    // ── HEADER ───────────────────────────────────────────────────────────────────
    doc.rect(50, 50, W, 70).fillColor(BG).fill();
    doc.fontSize(8).fillColor(AMBER).font("Helvetica-Bold")
      .text("CHAMPION SCREENPLAYS", 62, 62, { characterSpacing: 1.5 });
    doc.fontSize(18).fillColor(WHITE).font("Helvetica-Bold")
      .text(report.title, 62, 76);
    doc.fontSize(10).fillColor(MUTED).font("Helvetica")
      .text(`by ${report.writerName}`, 62, 100);
    doc.moveDown(3.5);

    // ── VERDICT ──────────────────────────────────────────────────────────────────
    heading("Industry Verdict");
    doc.fontSize(11).fillColor(verdictColor).font("Helvetica-Bold")
      .text(report.industryVerdict.label, { continued: true });
    doc.fontSize(9).fillColor(LIGHT).font("Helvetica")
      .text("   " + report.industryVerdict.rationale, { width: W });
    doc.moveDown(0.5);
    rule();

    // ── SCORE ────────────────────────────────────────────────────────────────────
    heading("Overall Score");
    doc.fontSize(36).fillColor(AMBER).font("Helvetica-Bold")
      .text(String(report.overallScore), { continued: true });
    doc.fontSize(11).fillColor(AMBER).font("Helvetica-Bold")
      .text(`  ${scoreLabel(report.overallScore)}`, { continued: false });
    doc.fontSize(9).fillColor(MUTED).font("Helvetica")
      .text(report.scoreJustification, { width: W });
    doc.moveDown(0.5);
    rule();

    // ── QUICK SNAPSHOT ────────────────────────────────────────────────────────────
    heading("Quick Snapshot");
    report.quickSnapshot.forEach((item) => bullet(item));
    doc.moveDown(0.5);
    rule();

    // ── EXECUTIVE SUMMARY ────────────────────────────────────────────────────────
    heading("Executive Summary");
    doc.fontSize(9).fillColor(LIGHT).font("Helvetica")
      .text(report.executiveSummary, { width: W, lineGap: 2 });
    doc.moveDown(0.5);
    rule();

    // ── READER REACTION ──────────────────────────────────────────────────────────
    if (report.readerReaction) {
      heading("Reader Reaction");
      doc.fontSize(9).fillColor(MUTED).font("Helvetica-Oblique")
        .text(report.readerReaction, { width: W, lineGap: 2 });
      doc.moveDown(0.5);
      rule();
    }

    // ── CATEGORY BREAKDOWN ───────────────────────────────────────────────────────
    heading("Category Breakdown");
    const cs = report.categoryScores;
    scoreBar("Concept", cs.concept);
    scoreBar("Structure", cs.structure);
    scoreBar("Characters", cs.characters);
    scoreBar("Dialogue", cs.dialogue);
    scoreBar("Pacing", cs.pacing);
    scoreBar("Marketability", cs.marketability);
    rule();

    // ── TOP FIXES ────────────────────────────────────────────────────────────────
    heading("Top Priority Fixes");
    report.topFixes.forEach((fix, i) => {
      doc.fontSize(9).fillColor(AMBER).font("Helvetica-Bold")
        .text(`${i + 1}.`, 50, doc.y, { continued: true, width: 18 });
      doc.fillColor(LIGHT).font("Helvetica").text(" " + fix, { width: W - 18 });
    });
    doc.moveDown(0.5);
    rule();

    // ── STRENGTHS & WEAKNESSES ───────────────────────────────────────────────────
    heading("Strengths");
    report.strengths.forEach((s) => bullet(s, GREEN));
    doc.moveDown(0.5);
    heading("Weaknesses");
    report.weaknesses.forEach((w) => bullet(w, RED));
    doc.moveDown(0.5);
    rule();

    // ── COMPARABLE TITLES ────────────────────────────────────────────────────────
    heading("Comparable Titles");
    report.comparableTitles.forEach((c) => {
      doc.fontSize(9).fillColor(WHITE).font("Helvetica-Bold").text(c.title);
      doc.fontSize(8).fillColor(MUTED).font("Helvetica").text(c.reason, { width: W });
      doc.moveDown(0.4);
    });
    rule();

    // ── COMMERCIAL OUTLOOK ───────────────────────────────────────────────────────
    heading("Commercial Outlook");
    report.commercialOutlook.forEach((item) => bullet(item));
    doc.moveDown(0.5);
    rule();

    // ── PREMISE EVALUATION ───────────────────────────────────────────────────────
    if (report.loglineFeedback) {
      heading("Premise Evaluation");
      doc.fontSize(9).fillColor(MUTED).font("Helvetica-Oblique")
        .text(report.loglineFeedback, { width: W, lineGap: 2 });
      doc.moveDown(0.5);
      rule();
    }

    // ── DETAILED CRAFT NOTES ─────────────────────────────────────────────────────
    heading("Detailed Analysis");

    const craftSection = (title: string, notes: { working: string[]; needsImprovement: string[] }) => {
      doc.fontSize(9).fillColor(WHITE).font("Helvetica-Bold").text(title);
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor(GREEN).font("Helvetica-Bold").text("What's Working");
      notes.working.forEach((item) => bullet(item, GREEN));
      doc.moveDown(0.2);
      doc.fontSize(8).fillColor(RED).font("Helvetica-Bold").text("Needs Improvement");
      notes.needsImprovement.forEach((item) => bullet(item, RED));
      doc.moveDown(0.5);
    };

    craftSection("Structure", report.structureNotes);
    craftSection("Characters", report.characterNotes);
    craftSection("Dialogue", report.dialogueNotes);
    craftSection("Pacing", report.pacingNotes);
    craftSection("Marketability", report.marketabilityNotes);

    rule();

    // ── FOOTER ───────────────────────────────────────────────────────────────────
    doc.fontSize(8).fillColor(MUTED).font("Helvetica")
      .text("Champion Screenplays · Professional screenplay development coverage.", {
        align: "center", width: W,
      });
    doc.fontSize(7).fillColor("#3f3f46")
      .text("Your screenplay was never stored or shared.", { align: "center", width: W });

    doc.end();
  });
}
