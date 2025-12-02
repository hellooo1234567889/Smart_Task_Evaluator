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

function extractCode(text: string) {
  const parts = text.split('```
  
  if (parts.length >= 3) {
    const before = parts.trim()
    let code = parts.trim()[1]
    const after = parts.trim()
    
    if (code.startsWith('javascript')) {
      code = code.substring(10).trim()
    }
    
    return { before, code, after }
  }
  
  const fnStart = text.indexOf('function')
  if (fnStart === -1) {
    return { before: text, code: '', after: '' }
  }
  
  const before = text.substring(0, fnStart).trim()
  let braceCount = 0
  let fnEnd = -1
  
  for (let i = fnStart; i < text.length; i++) {
    if (text[i] === '{') braceCount++
    if (text[i] === '}') {
      braceCount--
      if (braceCount === 0) {
        fnEnd = i + 1
        break
      }
    }
  }
  
  if (fnEnd === -1) {
    return { before, code: text.substring(fnStart), after: '' }
  }
  
  const code = text.substring(fnStart, fnEnd).trim()
  const after = text.substring(fnEnd).trim()
  
  return { before, code, after }
}

function Section({ title, content }: { title: string; content: string }) {
  const { before, code, after } = extractCode(content)
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-cyan-300 mb-3">{title}</h3>
      
      {before && (
        <p className="text-sm text-slate-100/90 mb-3 leading-relaxed">{before}</p>
      )}
      
      {code && (
        <div className="bg-[#020617] border border-slate-700/60 rounded-xl p-4 mb-3 shadow-lg">
          <pre className="overflow-x-auto">
            <code className="block font-mono text-sm text-slate-100 leading-relaxed whitespace-pre">{code}</code>
          </pre>
        </div>
      )}
      
      {after && (
        <p className="text-sm text-slate-100/90 leading-relaxed">{after}</p>
      )}
    </div>
  )
}

export function ReportFormatter({ jsonReport }: { jsonReport: string }) {
  let data: ReportData
  
  try {
    data = JSON.parse(jsonReport)
  } catch {
    return <p className="text-red-400 text-sm">Error parsing report</p>
  }
  
  return (
    <div className="space-y-6">
      {data.code_quality && <Section title="Code Quality" content={data.code_quality} />}
      {data.best_practices && <Section title="Best Practices" content={data.best_practices} />}
      {data.performance && <Section title="Performance" content={data.performance} />}
      {data.readability && <Section title="Readability" content={data.readability} />}
      {data.security_considerations && <Section title="Security Considerations" content={data.security_considerations} />}
      
      {data.recommendations && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Recommendations</h3>
          <div className="space-y-6 pl-1">
            {data.recommendations.improved_function && (
              <Section title="Improved Function" content={data.recommendations.improved_function} />
            )}
            {data.recommendations.informative_feedback && (
              <Section title="Informative Feedback" content={data.recommendations.informative_feedback} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
