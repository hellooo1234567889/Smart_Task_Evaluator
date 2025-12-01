import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { evaluation_id, payment_id } = session.metadata || {}

    if (!evaluation_id || !payment_id) {
      console.error('Missing metadata in checkout session')
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    try {
      // Update evaluation to paid
      const { error: evalError } = await supabaseAdmin
        .from('evaluations')
        .update({ is_paid: true })
        .eq('id', evaluation_id)

      if (evalError) throw evalError

      // Update payment status
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('id', payment_id)

      if (paymentError) throw paymentError

      console.log(`Payment successful for evaluation ${evaluation_id}`)
    } catch (error: any) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
