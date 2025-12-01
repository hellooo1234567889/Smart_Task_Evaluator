'use client'

import { useEffect, useState, use} from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  }, [])

  const fetchTaskDetails = async () => {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id) // Now using unwrapped id
      .single()

      const { data: evalData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('task_id', id) // Now using unwrapped id
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

    // Redirect to Stripe Checkout
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    const { error } = await stripe!.redirectToCheckout({
      sessionId: data.sessionId,
    })

    if (error) throw error
  } catch (error: any) {
    toast.error(error.message)
    setPaymentLoading(false)
  }
}


  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Task Code */}
          <Card>
            <CardHeader>
              <CardTitle>{task?.title}</CardTitle>
              <CardDescription>{task?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-100 text-sm">
                  <code className="whitespace-pre-wrap">{task?.code}</code>
                </pre>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {task?.language}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Results */}
          <div className="space-y-4">
            {!evaluation ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Evaluation Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Run AI evaluation to get detailed feedback
                  </p>
                  <Button onClick={runEvaluation} disabled={evaluating}>
                    {evaluating ? 'Evaluating...' : 'Run Evaluation'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Evaluation Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-blue-600">
                        {evaluation.score}
                      </div>
                      <p className="text-gray-600 mt-2">out of 100</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Free Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Strengths
                      </h4>
                      <p className="text-sm text-gray-700">{evaluation.strengths}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Areas for Improvement
                      </h4>
                      <p className="text-sm text-gray-700">{evaluation.improvements}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Full Report (Locked/Unlocked) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Full Detailed Report
                      {!evaluation.is_paid && (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {evaluation.is_paid ? (
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-sm">{evaluation.full_report}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="font-medium mb-2">Unlock Full Report</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Get detailed analysis, code quality metrics, best practices review, and actionable recommendations
                        </p>
                        <Button onClick={handlePayment} disabled={paymentLoading}>
                            {paymentLoading ? 'Loading...' : 'Unlock for $4.99'}
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
