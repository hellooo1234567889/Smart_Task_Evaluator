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

// Very simple parser: look for the word "function" and the next closing brace.
function splitOutCode(text: string) {
  // Try fenced block first: look for "```
  const firstFence = text.indexOf('```')
  if (firstFence !== -1) {
    const afterFirst = text.slice(firstFence + 3)
    const secondFence = afterFirst.indexOf('```

    let inner = afterFirst
    if (secondFence !== -1) {
      inner = afterFirst.slice(0, secondFence)
    }

    // Drop optional leading language token like "javascript "
    inner = inner.trim()
    if (inner.toLowerCase().startsWith('javascript ')) {
      inner = inner.slice('javascript '.length)
    }

    const before = text.slice(0, firstFence).trim()
    const after =
      secondFence !== -1
        ? afterFirst.slice(secondFence + 3).trim()
        : ''

    return { before, code: inner, after }
  }

  // Fallback: plain "function ..." block
  const fnIndex = text.indexOf('function')
  if (fnIndex !== -1) {
    const before = text.slice(0, fnIndex).trim()
    const rest = text.slice(fnIndex)

    // Naive brace-matching to find the end of the function
    let openBraces = 0
    let endIndex = -1
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i]
      if (ch === '{') openBraces++
      if (ch === '}') {
        openBraces--
        if (openBraces === 0) {
          endIndex = i
          break
        }
      }
    }

    if (endIndex !== -1) {
      const code = rest.slice(0, endIndex + 1).trim()
      const after = rest.slice(endIndex + 1).trim()
      return { before, code, after }
    }

    // If braces couldn’t be matched, just treat rest as code
    return { before, code: rest.trim(), after: '' }
  }

  // No code found
  return { before: text.trim(), code: '', after: '' }
}

function Section(props: { title: string; content: string }) {
  const { title, content } = props
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
