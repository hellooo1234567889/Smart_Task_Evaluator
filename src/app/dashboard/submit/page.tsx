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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login first')
        router.push('/auth/login')
        return
      }

      // Insert task
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
      
      // Ask if user wants to evaluate now
      setLoading(false)
      const shouldEvaluate = confirm('Would you like to run AI evaluation now?')
      
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Coding Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Task Title</label>
                <Input
                  placeholder="e.g., Binary Search Implementation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Describe what this code is supposed to do..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Programming Language</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
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
                <label className="block text-sm font-medium mb-2">Your Code</label>
                <Textarea
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || evaluating}
              >
                {evaluating ? 'Evaluating...' : loading ? 'Submitting...' : 'Submit Task'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
