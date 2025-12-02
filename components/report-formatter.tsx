'use client'

import React from 'react'

interface ReportData {
  code_quality?: string
  best_practices?: string
  performance?: string
  readability?: string
  security_considerations?: string
  recommendations?: {
    improved_function?: string
    informative_feedback?: string
  }
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="bg-[#020617] border border-slate-700/60 rounded-xl p-4 my-3 shadow-lg">
      <pre className="overflow-x-auto">
        <code className="block font-mono text-sm text-slate-100 leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  )
}

function Section({
  title,
  text,
  showAsCode = false,
}: {
  title: string
  text: string
  showAsCode?: boolean
}) {
  if (!text) return null

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-cyan-300 mb-2">
        {title}
      </h3>
      {showAsCode ? (
        <CodeBlock code={text} />
      ) : (
        <p className="text-sm text-slate-100/90 leading-relaxed">
          {text}
        </p>
      )}
    </div>
  )
}

export function ReportFormatter({ jsonReport }: { jsonReport: string }) {
  let data: ReportData

  try {
    data = JSON.parse(jsonReport)
  } catch {
    // Fallback: just show raw text if not valid JSON
    return (
      <p className="text-sm text-slate-100/90 whitespace-pre-wrap">
        {jsonReport}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {data.code_quality && (
        <Section title="Code Quality" text={data.code_quality} />
      )}

      {data.best_practices && (
        <Section title="Best Practices" text={data.best_practices} />
      )}

      {data.performance && (
        <Section title="Performance" text={data.performance} />
      )}

      {data.readability && (
        <Section title="Readability" text={data.readability} />
      )}

      {data.security_considerations && (
        <Section
          title="Security Considerations"
          text={data.security_considerations}
        />
      )}

      {data.recommendations && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">
            Recommendations
          </h3>

          {data.recommendations.improved_function && (
            <>
              <p className="text-sm text-slate-100/90 font-medium mb-1">
                Improved Function
              </p>
              <CodeBlock code={data.recommendations.improved_function} />
            </>
          )}

          {data.recommendations.informative_feedback && (
            <Section
              title="Informative Feedback"
              text={data.recommendations.informative_feedback}
            />
          )}
        </div>
      )}
    </div>
  )
}
