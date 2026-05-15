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

    const LEFT = 50;
    const RIGHT = 562;
    const W = RIGHT - LEFT;

    // ── Colors ─────────────────────────────────────────────────────────────────
    const AMBER  = "#f59e0b";
    const WHITE  = "#ffffff";   // header only (dark bg)
    const DARK   = "#1a1a1a";   // headings/titles on white bg
    const MUTED  = "#52525b";   // secondary text on white bg
    const LIGHT  = "#374151";   // body text on white bg
    const GREEN  = "#10b981";
    const RED    = "#ef4444";

    // Reset cursor to left margin
    const resetX = () => { doc.x = LEFT; };

    // Section label
    const sectionLabel = (text: string) => {
      resetX();
      doc.fontSize(7).fillColor(MUTED).font("Helvetica-Bold")
        .text(text.toUpperCase(), LEFT, doc.y, { width: W, characterSpacing: 1 });
      resetX();
      doc.moveDown(0.4);
    };

    // Horizontal rule
    const rule = () => {
      resetX();
      doc.moveDown(0.6);
      doc.strokeColor("#3f3f46").lineWidth(0.5)
        .moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke();
      resetX();
      doc.moveDown(0.6);
    };

    // Bullet point — single text call, no "continued"
    const bullet = (text: string, color = AMBER) => {
      resetX();
      doc.fontSize(9).fillColor(color).font("Helvetica")
        .text(`•  ${text}`, LEFT, doc.y, { width: W, lineGap: 2 });
      resetX();
      doc.moveDown(0.2);
    };

    // Score bar — resets x after drawing
    const scoreBar = (label: string, score: number) => {
      const color = score >= 80 ? GREEN : score >= 65 ? AMBER : RED;
      const BAR_X = 155;
      const BAR_W = W - 120;
      const y = doc.y;

      // Label
      doc.fontSize(8).fillColor(MUTED).font("Helvetica")
        .text(label, LEFT, y, { width: 100, lineBreak: false });

      // Bar background
      doc.roundedRect(BAR_X, y + 3, BAR_W, 5, 2).fillColor("#3f3f46").fill();
      // Bar fill
      const fillW = Math.max(2, (BAR_W * score) / 100);
      doc.roundedRect(BAR_X, y + 3, fillW, 5, 2).fillColor(color).fill();

      // Score number — positioned after bar
      doc.fontSize(8).fillColor(color).font("Helvetica-Bold")
        .text(String(score), BAR_X + BAR_W + 6, y, { width: 28, lineBreak: false });

      // Reset cursor below the bar row
      resetX();
      doc.moveDown(1.1);
    };

    // Numbered item
    const numberedItem = (n: number, text: string) => {
      resetX();
      doc.fontSize(9).fillColor(AMBER).font("Helvetica-Bold")
        .text(`${n}.`, LEFT, doc.y, { width: 18, lineBreak: false });
      doc.fontSize(9).fillColor(DARK).font("Helvetica")
        .text(text, LEFT + 20, doc.y - doc.currentLineHeight(), { width: W - 20, lineGap: 2 });
      resetX();
      doc.moveDown(0.3);
    };

    const craftSection = (title: string, notes: { working: string[]; needsImprovement: string[] }) => {
      resetX();
      doc.fontSize(10).fillColor(DARK).font("Helvetica-Bold").text(title, LEFT, doc.y, { width: W });
      resetX();
      doc.moveDown(0.4);

      doc.fontSize(8).fillColor(GREEN).font("Helvetica-Bold").text("WHAT'S WORKING", LEFT, doc.y, { width: W, characterSpacing: 0.5 });
      resetX();
      doc.moveDown(0.3);
      notes.working.forEach((item) => bullet(item, GREEN));

      doc.moveDown(0.3);
      doc.fontSize(8).fillColor(RED).font("Helvetica-Bold").text("NEEDS IMPROVEMENT", LEFT, doc.y, { width: W, characterSpacing: 0.5 });
      resetX();
      doc.moveDown(0.3);
      notes.needsImprovement.forEach((item) => bullet(item, RED));
      doc.moveDown(0.5);
    };

    const verdictColor = report.industryVerdict.label === "Recommend" ? GREEN
      : report.industryVerdict.label === "Consider" ? AMBER : "#3b82f6";

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════════
    doc.rect(LEFT, 50, W, 72).fillColor("#18181b").fill();
    resetX();

    doc.fontSize(7).fillColor(AMBER).font("Helvetica-Bold")
      .text("CHAMPION SCREENPLAYS", LEFT + 12, 62, { width: W - 24, characterSpacing: 1.5, lineBreak: false });
    resetX();

    doc.fontSize(20).fillColor(WHITE).font("Helvetica-Bold")
      .text(report.title, LEFT + 12, 74, { width: W - 24, lineBreak: false });
    resetX();

    doc.fontSize(10).fillColor(MUTED).font("Helvetica")
      .text(`by ${report.writerName}`, LEFT + 12, 100, { width: W - 24, lineBreak: false });

    resetX();
    doc.y = 138;

    // ═══════════════════════════════════════════════════════════════════════════
    // GENRE NOTE (only if genre was corrected)
    // ═══════════════════════════════════════════════════════════════════════════
    if (report.genreNote) {
      doc.rect(LEFT, doc.y, W, 1).fillColor("#f59e0b").fill();
      resetX();
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor(AMBER).font("Helvetica-Bold")
        .text("ℹ️  GENRE DETECTED", LEFT, doc.y, { width: W });
      resetX();
      doc.moveDown(0.2);
      doc.fontSize(8).fillColor(MUTED).font("Helvetica")
        .text(report.genreNote, LEFT, doc.y, { width: W, lineGap: 2 });
      resetX();
      doc.moveDown(0.5);
      doc.rect(LEFT, doc.y, W, 1).fillColor("#f59e0b").fill();
      resetX();
      doc.moveDown(0.8);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // VERDICT
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Industry Verdict");
    doc.fontSize(11).fillColor(verdictColor).font("Helvetica-Bold")
      .text(report.industryVerdict.label, LEFT, doc.y, { width: W, lineBreak: false });
    resetX();
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor(MUTED).font("Helvetica")
      .text(report.industryVerdict.rationale, LEFT, doc.y, { width: W, lineGap: 2 });
    resetX();
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // OVERALL SCORE
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Overall Score");
    doc.fontSize(36).fillColor(AMBER).font("Helvetica-Bold")
      .text(String(report.overallScore), LEFT, doc.y, { width: W });
    resetX();
    doc.fontSize(11).fillColor(AMBER).font("Helvetica-Bold")
      .text(scoreLabel(report.overallScore), LEFT, doc.y, { width: W });
    resetX();
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor(MUTED).font("Helvetica")
      .text(report.scoreJustification, LEFT, doc.y, { width: W, lineGap: 2 });
    resetX();
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // QUICK SNAPSHOT
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Quick Snapshot");
    report.quickSnapshot.forEach((item) => bullet(item));
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Executive Summary");
    doc.fontSize(9).fillColor(LIGHT).font("Helvetica-Oblique")
      .text(report.executiveSummary, LEFT, doc.y, { width: W, lineGap: 3 });
    resetX();
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // READER REACTION
    // ═══════════════════════════════════════════════════════════════════════════
    if (report.readerReaction) {
      sectionLabel("Reader Reaction");
      doc.fontSize(9).fillColor(MUTED).font("Helvetica-Oblique")
        .text(report.readerReaction, LEFT, doc.y, { width: W, lineGap: 3 });
      resetX();
      rule();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CATEGORY BREAKDOWN
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Category Breakdown");
    const cs = report.categoryScores;
    scoreBar("Concept",       cs.concept);
    scoreBar("Structure",     cs.structure);
    scoreBar("Characters",    cs.characters);
    scoreBar("Dialogue",      cs.dialogue);
    scoreBar("Pacing",        cs.pacing);
    scoreBar("Marketability", cs.marketability);
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // TOP FIXES
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Top Priority Fixes");
    report.topFixes.forEach((fix, i) => numberedItem(i + 1, fix));
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // STRENGTHS & WEAKNESSES
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Strengths");
    report.strengths.forEach((s) => bullet(s, GREEN));
    doc.moveDown(0.4);
    sectionLabel("Weaknesses");
    report.weaknesses.forEach((w) => bullet(w, RED));
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPARABLE TITLES
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Comparable Titles");
    report.comparableTitles.forEach((c) => {
      resetX();
      doc.fontSize(9).fillColor(DARK).font("Helvetica-Bold")
        .text(c.title, LEFT, doc.y, { width: W });
      resetX();
      doc.fontSize(8).fillColor(MUTED).font("Helvetica")
        .text(c.reason, LEFT, doc.y, { width: W, lineGap: 2 });
      resetX();
      doc.moveDown(0.5);
    });
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // COMMERCIAL OUTLOOK
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Commercial Outlook");
    report.commercialOutlook.forEach((item) => bullet(item));
    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // PREMISE EVALUATION
    // ═══════════════════════════════════════════════════════════════════════════
    if (report.loglineFeedback) {
      sectionLabel("Premise Evaluation");
      doc.fontSize(9).fillColor(MUTED).font("Helvetica-Oblique")
        .text(report.loglineFeedback, LEFT, doc.y, { width: W, lineGap: 3 });
      resetX();
      rule();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DETAILED ANALYSIS
    // ═══════════════════════════════════════════════════════════════════════════
    sectionLabel("Detailed Analysis");
    craftSection("Structure",      report.structureNotes);
    craftSection("Characters",     report.characterNotes);
    craftSection("Dialogue",       report.dialogueNotes);
    craftSection("Pacing",         report.pacingNotes);
    craftSection("Marketability",  report.marketabilityNotes);

    rule();

    // ═══════════════════════════════════════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════════════════════════════════════
    resetX();
    doc.fontSize(8).fillColor(MUTED).font("Helvetica")
      .text("Champion Screenplays · Professional screenplay development coverage.", LEFT, doc.y, { width: W, align: "center" });
    resetX();
    doc.fontSize(7).fillColor("#52525b")
      .text("Your screenplay was never stored or shared.", LEFT, doc.y, { width: W, align: "center" });

    doc.end();
  });
}
