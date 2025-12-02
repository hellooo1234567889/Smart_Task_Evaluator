import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature") || ""
  if (!sig) {
    console.error("Webhook: missing stripe-signature header")
    return new NextResponse("Missing signature", { status: 400 })
  }

  // Read raw body as ArrayBuffer -> Buffer (recommended by Stripe)
  let bodyBuffer: Buffer
  try {
    const ab = await request.arrayBuffer()
    bodyBuffer = Buffer.from(ab)
  } catch (err) {
    console.error("Webhook: failed to read raw body", err)
    return new NextResponse("Invalid body", { status: 400 })
  }

  // Verify signature & construct event
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      bodyBuffer,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message ?? err)
    return new NextResponse(`Webhook Error: ${err?.message ?? String(err)}`, { status: 400 })
  }

  try {
    // handle relevant events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata ?? {}
        const evaluation_id = metadata.evaluation_id ?? null
        const payment_id = metadata.payment_id ?? null
        const stripePaymentIntent = (session.payment_intent as string) ?? null

        console.log("Webhook: checkout.session.completed", {
          sessionId: session.id,
          evaluation_id,
          payment_id,
          stripePaymentIntent,
        })

        if (!evaluation_id) {
          // Log and return 200 to acknowledge event (avoid infinite retries)
          console.warn("Webhook: checkout.session.completed missing evaluation_id in metadata")
          break
        }

        // Update evaluation row to mark it paid
        const { error: evalError } = await supabaseAdmin
          .from("evaluations")
          .update({
            is_paid: true,
            stripe_payment_id: stripePaymentIntent,
            paid_at: new Date().toISOString(),
          })
          .eq("id", evaluation_id)

        if (evalError) {
          console.error("Webhook: failed to update evaluations:", evalError)
          // Return 500 so Stripe retries — only do this for DB write failures
          return new NextResponse("DB update failed", { status: 500 })
        }

        // Optionally update payments table if you store a payment record
        if (payment_id) {
          const { error: payErr } = await supabaseAdmin
            .from("payments")
            .update({
              status: "completed",
              stripe_payment_id: stripePaymentIntent,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment_id)

          if (payErr) {
            console.error("Webhook: failed to update payments:", payErr)
            // don't fail the whole webhook for payments table issues; log it
          }
        }

        break
      }

      case "payment_intent.succeeded":
      case "charge.succeeded": {
        // Optional handling; log for now
        console.log(`Webhook: received ${event.type}`, {
          id: (event.data.object as any).id,
        })
        break
      }

      default:
        // We intentionally ignore other events to keep the webhook fast.
        console.log("Webhook: unhandled event type", event.type)
    }

    // Acknowledge receipt
    return new NextResponse("ok", { status: 200 })
  } catch (err) {
    console.error("Webhook: unexpected processing error:", err)
    return new NextResponse("server error", { status: 500 })
  }
}

// Fallback for non-POST methods (Stripe uses POST)
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 })
}
