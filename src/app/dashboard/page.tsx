'use client'

import { useEffect, useState } from 'react'
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
import { PlusCircle, FileCode, LogOut } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  created_at: string
  evaluations: any[]
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*, evaluations(*)')
      .order('created_at', { ascending: false })

    if (data) setTasks(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
      {/* Glass nav */}
      <nav className="sticky top-0 z-20 border-b border-white/15 bg-white/5 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-semibold text-white shadow-lg">
              TE
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-50">
                Task Evaluator
              </p>
              <p className="text-[11px] text-slate-300">
                AI-powered code review dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:inline text-[11px] text-slate-200/80 rounded-full px-3 py-1 bg-white/5 border border-white/10">
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-white/25 bg-white/5 text-slate-50 hover:bg-white/15"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] text-cyan-300 uppercase">
              Dashboard
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-50">
              Your code evaluations
            </h2>
            <p className="mt-1 text-sm text-slate-300/85 max-w-md">
              Submit your code and let the AI reviewer highlight strengths and
              improvements.
            </p>
          </div>
          <Link href="/dashboard/submit">
            <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 text-sm font-medium shadow-lg hover:from-indigo-400 hover:to-cyan-300 border-0">
              <PlusCircle className="w-4 h-4 mr-2" />
              New evaluation
            </Button>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-sm text-slate-200/80">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <Card className="bg-white/5 border border-white/15 backdrop-blur rounded-2xl text-slate-50">
            <CardContent className="py-16 text-center">
              <FileCode className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No tasks yet
              </h3>
              <p className="text-sm text-slate-300 mb-6">
                Submit your first coding task to get AI-powered feedback.
              </p>
              <Link href="/dashboard/submit">
                <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0">
                  Submit Task
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur p-4 sm:p-5 flex flex-col justify-between transition-transform hover:-translate-y-0.5 hover:bg-white/14"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-50 line-clamp-1">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-300/85">
                      {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      task.evaluations.length > 0
                        ? 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/30'
                        : 'bg-slate-100/5 text-slate-200 border border-slate-100/25'
                    }`}
                  >
                    {task.evaluations.length > 0 ? 'Evaluated' : 'Pending'}
                  </span>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/task/${task.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/40 bg-white/5 text-slate-50 hover:bg-white/20 px-4"
                    >
                      View details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
