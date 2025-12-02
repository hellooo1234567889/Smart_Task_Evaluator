// src/app/api/checkout-session/route.ts
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

// Service-role Supabase client (server-only admin access)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // SUPER IMPORTANT
)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const session_id = url.searchParams.get("session_id")
    const eval_id_override = url.searchParams.get("evaluation_id") // fallback

    if (!session_id) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      )
    }

    // Fetch session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    })

    const paid =
      session.payment_status === "paid" ||
      (session.payment_intent &&
        (session.payment_intent as any).status === "succeeded")

    // evaluation_id from metadata or query param
    const evaluation_id =
      session.metadata?.evaluation_id ?? eval_id_override

    if (!evaluation_id) {
      console.warn("No evaluation_id found in session metadata")
      return NextResponse.json({ paid })
    }

    // If paid → update Supabase
    if (paid) {
      const paymentIntentId = (session.payment_intent as any)?.id ?? null
      const payment_id = session.metadata?.payment_id ?? null

      // Update evaluation
      const { error: evalErr } = await supabaseAdmin
        .from("evaluations")
        .update({
          is_paid: true,
          stripe_payment_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", evaluation_id)

      if (evalErr) {
        console.error("Failed updating evaluation:", evalErr)
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        )
      }

      // Update payments table (optional)
      if (payment_id) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "completed",
            stripe_payment_id: paymentIntentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment_id)
      }

      return NextResponse.json({ ok: true, paid: true, evaluation_id })
    }

    // Not paid yet
    return NextResponse.json({
      ok: true,
      paid: false,
      session_status: session.payment_status,
    })
  } catch (err: any) {
    console.error("checkout-session GET error:", err)
    return NextResponse.json(
      { error: "Server error", detail: String(err) },
      { status: 500 }
    )
  }
}
