import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})



export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { evaluationId } = await request.json()

    if (!evaluationId) {
      return NextResponse.json({ error: 'Evaluation ID required' }, { status: 400 })
    }

    // Verify evaluation exists and isn't already paid
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .eq('user_id', user.id)
      .single()

    if (evalError || !evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 })
    }

    if (evaluation.is_paid) {
      return NextResponse.json({ error: 'Report already unlocked' }, { status: 400 })
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        evaluation_id: evaluationId,
        amount: 499, // $4.99 in cents
        currency: 'usd',
        status: 'pending',
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Full AI Evaluation Report',
              description: 'Detailed code analysis with recommendations',
            },
            unit_amount: 499, // $4.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&evaluation_id=${evaluationId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/task/${evaluation.task_id}`,
      metadata: {
        payment_id: payment.id,
        evaluation_id: evaluationId,
        user_id: user.id,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
