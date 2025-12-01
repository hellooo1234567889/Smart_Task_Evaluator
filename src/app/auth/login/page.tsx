'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Logged in successfully!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,#4f46e5_0,transparent_55%),radial-gradient(circle_at_bottom,#0ea5e9_0,transparent_55%),#020617]">
      <div className="max-w-md w-full">
        <Card className="bg-white/8 border border-white/20 backdrop-blur-xl rounded-3xl text-slate-50 shadow-2xl">
          <CardHeader className="pb-4">
            <p className="text-[11px] font-medium tracking-[0.18em] text-cyan-300 uppercase">
              Welcome back
            </p>
            <CardTitle className="mt-1 text-2xl font-semibold">
              Sign in
            </CardTitle>
            <CardDescription className="text-xs text-slate-200/80">
              Access your AI-powered task evaluations.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-slate-200">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900/40 border-white/25 text-slate-50 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-slate-200">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/40 border-white/25 text-slate-50 placeholder:text-slate-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border-0"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <p className="text-xs text-center mt-4 text-slate-200/80">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
