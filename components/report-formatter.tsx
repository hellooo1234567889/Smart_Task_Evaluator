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
        <h3 className="text-base font-semibold text-cyan-300 mb-3">{title}</h3>
        {codeBlock ? (
          <>
            {codeBlock.before && (
              <p className="text-sm text-slate-100/90 mb-4 leading-relaxed">
                {codeBlock.before.trim()}
              </p>
            )}
            <div className="bg-[#0f172a] border border-slate-700/50 rounded-xl p-5 mb-4 shadow-lg">
              <pre className="overflow-x-auto">
                <code className="text-sm text-slate-100 font-mono leading-relaxed block">
                  {codeBlock.code}
                </code>
              </pre>
            </div>
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
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Recommendations</h3>
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
