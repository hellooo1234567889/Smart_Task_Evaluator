'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SubmitTaskPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please login first')
        router.push('/auth/login')
        return
      }

      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title,
          description,
          code,
          language,
        })
        .select()
        .single()

      if (taskError) throw taskError

      toast.success('Task submitted successfully!')

      setLoading(false)
      const shouldEvaluate = confirm(
        'Would you like to run AI evaluation now?'
      )

      if (shouldEvaluate) {
        await runEvaluation(task.id)
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  const runEvaluation = async (taskId: string) => {
    setEvaluating(true)
    toast.info('Running AI evaluation...')

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, title, description, code, language }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      toast.success('Evaluation complete!')
      router.push(`/dashboard/task/${taskId}`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
      {/* Glass nav */}
      <nav className="sticky top-0 z-20 border-b border-white/15 bg-white/5 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white/8 border border-white/20 backdrop-blur rounded-2xl text-slate-50 shadow-xl">
          <CardHeader>
            <p className="text-[11px] font-medium tracking-[0.18em] text-cyan-300 uppercase">
              New task
            </p>
            <CardTitle className="mt-1 text-xl font-semibold text-slate-50">
              Submit coding task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-medium mb-2 text-slate-200">
                  Task Title
                </label>
                <Input
                  placeholder="e.g., Binary Search Implementation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-slate-900/40 border-white/20 text-slate-50 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-slate-200">
                  Description
                </label>
                <Textarea
                  placeholder="Describe what this code is supposed to do..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="bg-slate-900/40 border-white/20 text-slate-50 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-slate-200">
                  Programming Language
                </label>
                <select
                  className="w-full px-3 py-2 rounded-md bg-slate-900/40 border border-white/20 text-sm text-slate-50"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-slate-200">
                  Your Code
                </label>
                <Textarea
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  rows={14}
                  className="font-mono text-xs sm:text-sm bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0"
                disabled={loading || evaluating}
              >
                {evaluating
                  ? 'Evaluating...'
                  : loading
                  ? 'Submitting...'
                  : 'Submit Task'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
