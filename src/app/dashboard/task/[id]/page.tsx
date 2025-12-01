'use client'

export const dynamic = 'force-dynamic'


import { useEffect, useState, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'

interface Evaluation {
  id: string
  score: number
  strengths: string
  improvements: string
  full_report: string
  is_paid: boolean
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [task, setTask] = useState<any>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTaskDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchTaskDetails = async () => {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    const { data: evalData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setTask(taskData)
    setEvaluation(evalData)
    setLoading(false)
  }

  const runEvaluation = async () => {
    if (!task) return
    setEvaluating(true)
    toast.info('Running AI evaluation...')

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          title: task.title,
          description: task.description,
          code: task.code,
          language: task.language,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      toast.success('Evaluation complete!')
      fetchTaskDetails()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setEvaluating(false)
    }
  }

  const handlePayment = async () => {
    if (!evaluation) return

    try {
      setPaymentLoading(true)

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationId: evaluation.id }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      )
      const { error } = await stripe!.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message)
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
        <p className="text-sm text-slate-100/80">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
      {/* Glass nav */}
      <nav className="sticky top-0 z-20 border-b border-white/15 bg-white/5 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-slate-100 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Task Code */}
          <Card className="bg-white/8 border border-white/20 backdrop-blur rounded-2xl text-slate-50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {task?.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-200/80">
                {task?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 overflow-x-auto">
                <pre className="text-slate-100 text-xs sm:text-sm">
                  <code className="whitespace-pre-wrap">{task?.code}</code>
                </pre>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-cyan-400/15 text-cyan-200 rounded-full text-xs border border-cyan-300/30">
                  {task?.language}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          <div className="space-y-4">
            {!evaluation ? (
              <Card className="bg-white/8 border border-white/20 backdrop-blur rounded-2xl text-slate-50 shadow-xl">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Evaluation Yet
                  </h3>
                  <p className="text-sm text-slate-300 mb-6">
                    Run AI evaluation to get detailed feedback on your code.
                  </p>
                  <Button
                    onClick={runEvaluation}
                    disabled={evaluating}
                    className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0"
                  >
                    {evaluating ? 'Evaluating...' : 'Run Evaluation'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score Card */}
                <Card className="bg-white/8 border border-white/20 backdrop-blur rounded-2xl text-slate-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      AI Evaluation Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-cyan-300">
                        {evaluation.score}
                      </div>
                      <p className="text-xs text-slate-200 mt-2">
                        out of 100
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Free Preview */}
                <Card className="bg-white/8 border border-white/20 backdrop-blur rounded-2xl text-slate-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">
                      Quick Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-emerald-200 mb-1.5 flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Strengths
                      </h4>
                      <p className="text-xs text-slate-100/90">
                        {evaluation.strengths}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-200 mb-1.5 flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Areas for Improvement
                      </h4>
                      <p className="text-xs text-slate-100/90">
                        {evaluation.improvements}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Report (Locked/Unlocked) */}
                <Card className="bg-white/8 border border-white/20 backdrop-blur rounded-2xl text-slate-50 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-sm font-semibold">
                      Full Detailed Report
                      {!evaluation.is_paid && (
                        <Lock className="w-5 h-5 text-slate-300" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {evaluation.is_paid ? (
                      <div className="prose prose-sm max-w-none prose-invert">
                        <p className="whitespace-pre-wrap text-xs sm:text-sm text-slate-50">
                          {evaluation.full_report}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        <h3 className="font-medium mb-2">
                          Unlock Full Report
                        </h3>
                        <p className="text-xs text-slate-200/90 mb-5 max-w-sm mx-auto">
                          Get detailed analysis, code quality metrics, best
                          practices review, and actionable recommendations.
                        </p>
                        <Button
                          onClick={handlePayment}
                          disabled={paymentLoading}
                          className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0"
                        >
                          {paymentLoading
                            ? 'Loading...'
                            : 'Unlock for $4.99'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
