'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const evaluationId = searchParams.get('evaluation_id')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchTaskId = async () => {
      if (!evaluationId) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('evaluations')
        .select('task_id')
        .eq('id', evaluationId)
        .single()

      if (data) setTaskId(data.task_id)
      setLoading(false)
    }

    fetchTaskId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
        <p className="text-sm text-slate-100/80">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
      <Card className="max-w-md w-full bg-white/8 border border-white/20 backdrop-blur-xl rounded-3xl text-slate-50 shadow-2xl">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-emerald-300" />
          </div>
          <CardTitle className="text-center text-xl font-semibold">
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-xs text-slate-200/85">
            Your full evaluation report has been unlocked successfully.
          </p>
          <div className="space-y-2">
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                className="w-full rounded-full border-white/30 bg-white/5 text-slate-50 hover:bg-white/15"
              >
                Go to Dashboard
              </Button>
            </Link>
            {taskId && (
              <Link href={`/dashboard/task/${taskId}`} className="block">
                <Button className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0">
                  View Full Report
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
