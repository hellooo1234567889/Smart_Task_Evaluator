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

// Safely split narrative + JS function code
function splitOutCode(text: string) {
  // First try fenced blocks ``````
  const fenceIndex = text.indexOf('```
  if (fenceIndex !== -1) {
    const afterFence = text.slice(fenceIndex + 3)
    const secondFence = afterFence.lastIndexOf('```')
    let inner = afterFence
    if (secondFence !== -1) {
      inner = afterFence.slice(0, secondFence)
    }
    // Remove optional language label like "javascript "
    inner = inner.replace(/^javascript\s*/i, '')

    const before = text.slice(0, fenceIndex).trim()
    const after =
      secondFence !== -1
        ? afterFence.slice(secondFence + 3).trim()
        : ''

    return { before, code: inner.trim(), after }
  }

  // Fallback: first "function ... }" block
  const fnMatch = text.match(
    /function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[\s\S]*?\}/
  )
  if (fnMatch && fnMatch.index !== undefined) {
    const before = text.slice(0, fnMatch.index).trim()
    const code = fnMatch[0].trim()
    const after = text
      .slice(fnMatch.index + fnMatch[0].length)
      .trim()
    return { before, code, after }
  }

  return { before: text.trim(), code: '', after: '' }
}

function Section({ title, content }: { title: string; content: string }) {
  const { before, code, after } = splitOutCode(content)

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-cyan-300 mb-3">
        {title}
      </h3>

      {before && (
        <p className="text-sm text-slate-100/90 mb-3 leading-relaxed">
          {before}
        </p>
      )}

      {code && (
        <div className="bg-[#020617] border border-slate-700/60 rounded-xl p-4 mb-3 shadow-lg">
          <pre className="overflow-x-auto">
            <code className="block font-mono text-sm text-slate-100 leading-relaxed whitespace-pre">
              {code}
            </code>
          </pre>
        </div>
      )}

      {after && (
        <p className="text-sm text-slate-100/90 leading-relaxed">
          {after}
        </p>
      )}
    </div>
  )
}

export function ReportFormatter({ jsonReport }: { jsonReport: string }) {
  let reportData: ReportData

  try {
    reportData = JSON.parse(jsonReport)
  } catch {
    return (
      <p className="text-red-400 text-sm">
        Error parsing report data
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {reportData.code_quality && (
        <Section title="Code Quality" content={reportData.code_quality} />
      )}
      {reportData.best_practices && (
        <Section
          title="Best Practices"
          content={reportData.best_practices}
        />
      )}
      {reportData.performance && (
        <Section title="Performance" content={reportData.performance} />
      )}
      {reportData.readability && (
        <Section title="Readability" content={reportData.readability} />
      )}
      {reportData.security_considerations && (
        <Section
          title="Security Considerations"
          content={reportData.security_considerations}
        />
      )}

      {reportData.recommendations && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">
            Recommendations
          </h3>
          <div className="space-y-6 pl-1">
            {reportData.recommendations.improved_function && (
              <Section
                title="Improved Function"
                content={reportData.recommendations.improved_function}
              />
            )}
            {reportData.recommendations.informative_feedback && (
              <Section
                title="Informative Feedback"
                content={
                  reportData.recommendations.informative_feedback
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
