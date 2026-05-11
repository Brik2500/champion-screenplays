import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return NextResponse.json({ error: "Stripe key not configured." }, { status: 500 });
    }

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    const data = await response.json() as {
      payment_status?: string;
      metadata?: Record<string, string>;
      error?: { message: string };
    };

    if (!response.ok) {
      const msg = data.error?.message ?? "Stripe error";
      console.error("[verify-payment]", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    if (data.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
    }

    return NextResponse.json({ paid: true, metadata: data.metadata });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[verify-payment]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
