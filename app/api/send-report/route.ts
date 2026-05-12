import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { AnalysisReport } from "@/lib/types";
import { generateReportPdf } from "@/lib/generatePdf";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY);

const scoreLabel = (s: number) =>
  s >= 90 ? "Exceptional" : s >= 80 ? "Very Strong" : s >= 70 ? "Promising" : s >= 60 ? "Developing" : "Needs Work";

const verdictColor: Record<string, string> = {
  Recommend: "#10b981",
  Consider: "#f59e0b",
  Develop: "#3b82f6",
};

function buildEmailHTML(report: AnalysisReport): string {
  const cs = report.categoryScores;
  const vColor = verdictColor[report.industryVerdict.label] ?? "#f59e0b";

  const bar = (score: number) => {
    const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#f97316";
    return `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span style="width:100px;font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.05em;">${""}</span>
        <div style="flex:1;height:4px;background:#27272a;border-radius:2px;">
          <div style="width:${score}%;height:100%;background:${color};border-radius:2px;"></div>
        </div>
        <span style="width:24px;text-align:right;font-size:12px;font-weight:700;color:${color};">${score}</span>
      </div>`;
  };

  const categoryRows = [
    { label: "Concept", score: cs.concept },
    { label: "Structure", score: cs.structure },
    { label: "Characters", score: cs.characters },
    { label: "Dialogue", score: cs.dialogue },
    { label: "Pacing", score: cs.pacing },
    { label: "Marketability", score: cs.marketability },
  ]
    .map(
      ({ label, score }) => {
        const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#f97316";
        return `
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#a1a1aa;width:110px;">${label}</td>
          <td style="padding:6px 8px;">
            <div style="height:4px;background:#27272a;border-radius:2px;">
              <div style="width:${score}%;height:100%;background:${color};border-radius:2px;"></div>
            </div>
          </td>
          <td style="padding:6px 0;font-size:12px;font-weight:700;color:${color};width:28px;text-align:right;">${score}</td>
        </tr>`;
      }
    )
    .join("");

  const bullets = (items: string[], color = "#f59e0b") =>
    items
      .map(
        (item) =>
          `<li style="margin-bottom:8px;font-size:13px;color:#d4d4d8;line-height:1.6;">
            <span style="color:${color};margin-right:8px;">•</span>${item}
          </li>`
      )
      .join("");

  const craftSection = (title: string, notes: { working: string[]; needsImprovement: string[] }) => `
    <div style="margin-bottom:24px;">
      <h4 style="font-size:13px;font-weight:700;color:#f4f4f5;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.08em;">${title}</h4>
      <p style="font-size:11px;color:#10b981;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">What's Working</p>
      <ul style="margin:0 0 12px;padding:0;list-style:none;">${bullets(notes.working, "#10b981")}</ul>
      <p style="font-size:11px;color:#ef4444;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">Needs Improvement</p>
      <ul style="margin:0;padding:0;list-style:none;">${bullets(notes.needsImprovement, "#ef4444")}</ul>
    </div>`;

  const comps = report.comparableTitles
    .map(
      (c) => `
      <div style="margin-bottom:12px;">
        <p style="font-size:13px;font-weight:600;color:#f4f4f5;margin:0 0 2px;">${c.title}</p>
        <p style="font-size:12px;color:#71717a;margin:0;line-height:1.5;">${c.reason}</p>
      </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="border-bottom:1px solid #27272a;padding-bottom:24px;margin-bottom:32px;">
      <p style="font-size:11px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Champion Screenplays</p>
      <h1 style="font-size:22px;font-weight:900;color:#ffffff;margin:0 0 4px;">${report.title}</h1>
      <p style="font-size:13px;color:#71717a;margin:0;">by ${report.writerName}</p>
    </div>

    <!-- Verdict -->
    <div style="border:2px solid ${vColor}33;background:${vColor}11;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Industry Verdict</p>
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
        <span style="background:${vColor}22;border:1px solid ${vColor}55;color:${vColor};font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;padding:6px 14px;border-radius:8px;">
          ${report.industryVerdict.label}
        </span>
        <p style="font-size:13px;color:#d4d4d8;margin:0;line-height:1.6;flex:1;">${report.industryVerdict.rationale}</p>
      </div>
    </div>

    <!-- Score -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:20px;">
      <div>
        <p style="font-size:11px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Overall Score</p>
        <p style="font-size:52px;font-weight:900;color:#f59e0b;margin:0;line-height:1;">${report.overallScore}</p>
        <p style="font-size:12px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.08em;margin:4px 0 0;">${scoreLabel(report.overallScore)}</p>
      </div>
      <p style="font-size:12px;color:#71717a;margin:0;line-height:1.7;flex:1;">${report.scoreJustification}</p>
    </div>

    <!-- Quick Snapshot -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">Quick Snapshot</p>
      <ul style="margin:0;padding:0;list-style:none;">${bullets(report.quickSnapshot)}</ul>
    </div>

    <!-- Executive Summary -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Executive Summary</p>
      <p style="font-size:13px;color:#d4d4d8;margin:0;line-height:1.8;">${report.executiveSummary}</p>
    </div>

    <!-- Reader Reaction -->
    ${report.readerReaction ? `
    <div style="background:#0f0f11;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Reader Reaction</p>
      <p style="font-size:13px;color:#a1a1aa;margin:0;line-height:1.8;font-style:italic;">${report.readerReaction}</p>
    </div>` : ""}

    <!-- Category Breakdown -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Category Breakdown</p>
      <table style="width:100%;border-collapse:collapse;">${categoryRows}</table>
    </div>

    <!-- Top Fixes -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">Top Priority Fixes</p>
      <ol style="margin:0;padding:0;list-style:none;">
        ${report.topFixes.map((fix, i) => `
          <li style="display:flex;gap:12px;margin-bottom:12px;">
            <span style="min-width:20px;height:20px;background:#f59e0b22;border:1px solid #f59e0b44;color:#f59e0b;font-size:10px;font-weight:900;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">${i + 1}</span>
            <span style="font-size:13px;color:#d4d4d8;line-height:1.6;">${fix}</span>
          </li>`).join("")}
      </ol>
    </div>

    <!-- Strengths & Weaknesses -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;">
        <p style="font-size:10px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Strengths</p>
        <ul style="margin:0;padding:0;list-style:none;">${bullets(report.strengths, "#10b981")}</ul>
      </div>
      <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px;">
        <p style="font-size:10px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Weaknesses</p>
        <ul style="margin:0;padding:0;list-style:none;">${bullets(report.weaknesses, "#ef4444")}</ul>
      </div>
    </div>

    <!-- Comparable Titles -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Comparable Titles</p>
      ${comps}
    </div>

    <!-- Commercial Outlook -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">Commercial Outlook</p>
      <ul style="margin:0;padding:0;list-style:none;">${bullets(report.commercialOutlook)}</ul>
    </div>

    <!-- Premise Evaluation -->
    ${report.loglineFeedback ? `
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Premise Evaluation</p>
      <p style="font-size:13px;color:#a1a1aa;margin:0;line-height:1.8;">${report.loglineFeedback}</p>
    </div>` : ""}

    <!-- Detailed Craft Notes -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
      <p style="font-size:10px;font-weight:700;color:#71717a;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 20px;">Detailed Analysis</p>
      ${craftSection("Structure", report.structureNotes)}
      ${craftSection("Characters", report.characterNotes)}
      ${craftSection("Dialogue", report.dialogueNotes)}
      ${craftSection("Pacing", report.pacingNotes)}
      ${craftSection("Marketability", report.marketabilityNotes)}
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #27272a;padding-top:24px;text-align:center;">
      <p style="font-size:11px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px;">Champion Screenplays</p>
      <p style="font-size:11px;color:#52525b;margin:0;">Professional screenplay development coverage.</p>
      <p style="font-size:11px;color:#3f3f46;margin:8px 0 0;">Your screenplay was never stored or shared.</p>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, report } = (await req.json()) as { email: string; report: AnalysisReport };
    const email = rawEmail?.toLowerCase().trim();

    if (!email || !report) {
      return NextResponse.json({ error: "Email and report are required." }, { status: 400 });
    }

    const [html, pdfBuffer] = await Promise.all([
      Promise.resolve(buildEmailHTML(report)),
      generateReportPdf(report),
    ]);

    const fileName = `${report.title.replace(/[^a-z0-9]/gi, "_")}_Coverage_Report.pdf`;

    await resend.emails.send({
      from: "Champion Screenplays <coverage@mail.championscreenplays.com>",
      to: email,
      subject: `Your Coverage Report: ${report.title}`,
      html,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-report]", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
