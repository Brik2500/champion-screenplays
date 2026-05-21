import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { title, writerName, genre, format, email } = await req.json();

    if (!title || !writerName || !genre || !format) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      return NextResponse.json({ error: "Stripe key not configured." }, { status: 500 });
    }

    const params = new URLSearchParams({
      "payment_method_types[0]": "card",
      mode: "payment",
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][unit_amount]": "1900",
      "line_items[0][price_data][product_data][name]": "Champion Screenplays Coverage",
      "line_items[0][price_data][product_data][description]": `Development Coverage for "${title}" by ${writerName}`,
      "line_items[0][quantity]": "1",
      "payment_intent_data[statement_descriptor]": "CHAMPION SCREENPLAYS",
      "metadata[title]": title,
      "metadata[writerName]": writerName,
      "metadata[genre]": genre,
      "metadata[format]": format,
      ...(email ? { customer_email: email } : {}),
      success_url: `${origin}/analyze/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/analyze`,
    });

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json() as { url?: string; error?: { message: string } };

    if (!response.ok) {
      const msg = data.error?.message ?? "Stripe error";
      console.error("[create-checkout]", msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ url: data.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[create-checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
