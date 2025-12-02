'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const evaluationId = searchParams.get('evaluation_id')
  const sessionId = searchParams.get('session_id')

  const [taskId, setTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusMsg, setStatusMsg] = useState('Verifying payment...')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    let cancelled = false
    if (!sessionId) {
      setStatusMsg('Missing session id in URL')
      setLoading(false)
      return
    }

    // Poll the server-side verification endpoint
    let attempts = 0
    const maxAttempts = 8
    const retryDelay = 2500 // ms

    const checkPayment = async () => {
      attempts += 1
      setStatusMsg(`Checking payment status (attempt ${attempts}/${maxAttempts})...`)

      try {
        const res = await fetch(
          `/api/checkout-session?session_id=${encodeURIComponent(sessionId)}&evaluation_id=${encodeURIComponent(evaluationId ?? '')}`
        )
        const json = await res.json()

        if (!res.ok) {
          // show server message but keep retrying a few times
          setStatusMsg(json?.error ?? 'Error verifying payment. Retrying...')
        } else {
          if (json.paid) {
            setStatusMsg('Payment confirmed. Unlocking your report...')
            // fetch evaluation to get task id (using anon key)
            if (json.evaluation_id ?? evaluationId) {
              try {
                const evalId = json.evaluation_id ?? evaluationId
                const { data: evalRow } = await supabase
                  .from('evaluations')
                  .select('task_id')
                  .eq('id', evalId)
                  .single()

                if (evalRow?.task_id) {
                  setTaskId(evalRow.task_id)
                  if (!cancelled) {
                    // short delay to show success message then redirect
                    setTimeout(() => {
                      router.push(`/dashboard/task/${evalRow.task_id}`)
                    }, 700)
                  }
                } else {
                  // If task_id not found, fallback to evaluation redirect
                  if (!cancelled) router.push(`/dashboard/task/${evalId}`)
                }
              } catch (err) {
                console.warn('Failed to fetch evaluation after payment:', err)
                if (!cancelled) router.push(`/dashboard/task/${json.evaluation_id ?? evaluationId}`)
              }
            } else {
              // no evaluation id available — go to dashboard
              if (!cancelled) router.push('/dashboard')
            }
            return
          }

          // Not paid yet
          setStatusMsg('Payment not yet confirmed. Waiting for confirmation...')
        }
      } catch (err) {
        console.warn('Network or server error checking payment:', err)
        setStatusMsg('Network error while verifying payment. Retrying...')
      }

      if (!cancelled) {
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, retryDelay)
        } else {
          setStatusMsg(
            'Payment still pending. If this continues, go to Dashboard or contact support.'
          )
          setLoading(false)
        }
      }
    }

    checkPayment()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, evaluationId])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-white/8 border border-white/20 backdrop-blur-xl rounded-3xl text-slate-50 shadow-2xl">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-300" />
          </div>
          <CardTitle className="text-center text-xl font-semibold">Payment Status</CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-sm text-slate-200/90">{statusMsg}</p>

          <div className="space-y-2">
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full rounded-full border-white/30 bg-white/5 text-slate-50 hover:bg-white/15"
              >
                Go to Dashboard
              </Button>
            </Link>

            {taskId ? (
              <Link href={`/dashboard/task/${taskId}`} className="block">
                <Button className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0">
                  View Full Report
                </Button>
              </Link>
            ) : (
              <div className="text-xs text-slate-300">If confirmed you'll be redirected to your report automatically.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
