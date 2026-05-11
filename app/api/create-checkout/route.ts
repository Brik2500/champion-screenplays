import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { title, writerName, genre, format } = await req.json();

    if (!title || !writerName || !genre || !format) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 1900,
            product_data: {
              name: "Champion Screenplays Coverage",
              description: `Development Coverage for "${title}" by ${writerName}`,
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: { title, writerName, genre, format },
      success_url: `${origin}/analyze/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/analyze`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[create-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
