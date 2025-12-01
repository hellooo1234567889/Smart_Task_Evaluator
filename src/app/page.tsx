import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Code2, Sparkles, Lock, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Evaluator AI
          </h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Code Evaluation
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Submit your coding tasks and get instant, detailed AI feedback on code quality, 
            best practices, and improvements.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Start Evaluating Free
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <FeatureCard
            icon={<Code2 className="w-8 h-8" />}
            title="Submit Code"
            description="Upload your coding tasks in any language"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI Analysis"
            description="Get instant AI-powered evaluation"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Detailed Feedback"
            description="Receive scores, strengths, and improvements"
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8" />}
            title="Full Reports"
            description="Unlock in-depth analysis for $4.99"
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
