'use client'

import React from 'react'

export function ReportFormatter({ jsonReport }: { jsonReport: string }) {
  let pretty = jsonReport

  try {
    const parsed = JSON.parse(jsonReport)
    pretty = JSON.stringify(parsed, null, 2)
  } catch {
    // if it's not valid JSON, just show raw text
    pretty = jsonReport
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#020617] border border-slate-700/60 rounded-xl p-4 shadow-lg">
        <pre className="overflow-x-auto">
          <code className="block font-mono text-sm text-slate-100 leading-relaxed whitespace-pre">
            {pretty}
          </code>
        </pre>
      </div>
    </div>
  )
}
