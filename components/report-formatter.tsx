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

export function ReportFormatter({ jsonReport }: { jsonReport: string }) {
  let reportData: ReportData
  
  try {
    reportData = JSON.parse(jsonReport)
  } catch (error) {
    return <p className="text-red-400">Error parsing report data</p>
  }

  const extractCodeBlock = (text: string) => {
    // Updated regex to handle code blocks with or without newline after opening backticks
    const codeMatch = text.match(/``````/)
    if (codeMatch) {
      return {
        before: text.substring(0, codeMatch.index),
        code: codeMatch[2].trim(),
        language: codeMatch[1] || 'javascript',
        after: text.substring(codeMatch.index! + codeMatch[0].length)
      }
    }
    return null
  }

  const renderSection = (title: string, content: string) => {
    const codeBlock = extractCodeBlock(content)
    
    return (
      <div key={title} className="mb-6">
        <h3 className="text-base font-semibold text-cyan-300 mb-2">{title}</h3>
        {codeBlock ? (
          <>
            {codeBlock.before && (
              <p className="text-sm text-slate-100/90 mb-3 leading-relaxed">
                {codeBlock.before.trim()}
              </p>
            )}
            <pre className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 overflow-x-auto mb-3">
              <code className="text-xs sm:text-sm text-slate-100 font-mono">
                {codeBlock.code}
              </code>
            </pre>
            {codeBlock.after && codeBlock.after.trim() && (
              <p className="text-sm text-slate-100/90 leading-relaxed">
                {codeBlock.after.trim()}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-100/90 leading-relaxed">{content}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reportData.code_quality && renderSection('Code Quality', reportData.code_quality)}
      {reportData.best_practices && renderSection('Best Practices', reportData.best_practices)}
      {reportData.performance && renderSection('Performance', reportData.performance)}
      {reportData.readability && renderSection('Readability', reportData.readability)}
      {reportData.security_considerations && renderSection('Security Considerations', reportData.security_considerations)}
      
      {reportData.recommendations && (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-cyan-300 mb-4">Recommendations</h3>
          <div className="space-y-6 pl-2">
            {reportData.recommendations.improved_function && 
              renderSection('Improved Function', reportData.recommendations.improved_function)}
            {reportData.recommendations.informative_feedback && 
              renderSection('Informative Feedback', reportData.recommendations.informative_feedback)}
          </div>
        </div>
      )}
    </div>
  )
}
