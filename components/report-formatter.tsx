'use client'

import React from 'react'

interface Recommendations {
  improved_function_explanation?: string
  improved_function_code?: string
  informative_feedback_explanation?: string
  informative_feedback_code?: string
}

interface ReportData {
  code_quality?: string
  best_practices?: string
  performance?: string
  readability?: string
  security_considerations?: string
  recommendations?: Recommendations
}

function CodeBlock({ code }: { code: string }) {
  if (!code) return null

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

function TextSection({ title, text }: { title: string; text?: string }) {
  if (!text) return null

  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-cyan-300 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-100/90 leading-relaxed">
        {text}
      </p>
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
      <TextSection title="Code Quality" text={data.code_quality} />
      <TextSection title="Best Practices" text={data.best_practices} />
      <TextSection title="Performance" text={data.performance} />
      <TextSection title="Readability" text={data.readability} />
      <TextSection
        title="Security Considerations"
        text={data.security_considerations}
      />

      {data.recommendations && (
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold text-cyan-300">
            Recommendations
          </h3>

          {(data.recommendations.improved_function_explanation ||
            data.recommendations.improved_function_code) && (
            <div className="mt-1">
              <p className="text-sm text-slate-100/90 font-medium mb-1">
                Improved Function
              </p>
              <TextSection
                title=""
                text={data.recommendations.improved_function_explanation}
              />
              <CodeBlock
                code={data.recommendations.improved_function_code || ''}
              />
            </div>
          )}

          {(data.recommendations.informative_feedback_explanation ||
            data.recommendations.informative_feedback_code) && (
            <div className="mt-2">
              <p className="text-sm text-slate-100/90 font-medium mb-1">
                Informative Feedback
              </p>
              <TextSection
                title=""
                text={data.recommendations.informative_feedback_explanation}
              />
              <CodeBlock
                code={data.recommendations.informative_feedback_code || ''}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
