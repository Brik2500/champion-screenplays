import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { title, rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    const labels: Record<number, string> = {
      1: "Missed the mark",
      2: "Somewhat useful",
      3: "Pretty accurate",
      4: "Very accurate",
      5: "Spot on",
    };

    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #18181b; color: #e4e4e7; border-radius: 12px;">
        <p style="font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #f59e0b; margin: 0 0 8px;">Champion Screenplays · Report Feedback</p>
        <h2 style="margin: 0 0 24px; font-size: 20px; color: #fff;">${title || "Untitled Script"}</h2>
        <div style="background: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #a1a1aa;">Rating</p>
          <p style="margin: 0; font-size: 28px; letter-spacing: 2px; color: #f59e0b;">${stars}</p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #e4e4e7; font-weight: 600;">${labels[rating]}</p>
        </div>
        ${comment ? `
        <div style="background: #27272a; border-radius: 8px; padding: 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #a1a1aa;">Comment</p>
          <p style="margin: 0; font-size: 14px; color: #e4e4e7; line-height: 1.6;">${comment}</p>
        </div>` : `<p style="color: #52525b; font-size: 13px;">No comment provided.</p>`}
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Champion Screenplays <coverage@mail.championscreenplays.com>",
        to: "aiproductsuite@gmail.com",
        subject: `${stars} Feedback: ${title || "Untitled"} (${labels[rating]})`,
        html,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[feedback]", err);
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
  }
}
