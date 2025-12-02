import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskId, title, description, code, language } = await request.json()

    // Validate inputs
    if (!taskId || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if already evaluated
    const { data: existingEval } = await supabase
      .from('evaluations')
      .select('id')
      .eq('task_id', taskId)
      .single()

    if (existingEval) {
      return NextResponse.json(
        { error: 'Task already evaluated' },
        { status: 400 }
      )
    }

    const prompt = `You are an expert code reviewer. Evaluate the following coding task:

Task Title: ${title}
Description: ${description}
Programming Language: ${language}

Code:
\`\`\`${language}
${code}
\`\`\`

Return Only a JSON object with this exact structutre (no extra keys, no markdown):


{
  "score": <number between 0 and 100>,
  "strengths": "<brief summary of strengths in 2-3 sentences>",
  "improvements": "<brief suggestions for improvement in 2-3 sentences>",
  "full_report": {
      "code_quality": "<2-3 sentences,  
      "best_practices": "<2-3 sentences,
      "performance": "<2-3 sentences,
      "readability": "<2-3 sentences,
      "security_considerations": "<2-3 sentences,
      "recommendations": {
      "improved_function_explanation": "<1-2 sentences explaning the improved version >", 
      "improved_function_code": "<JUST the improved function code block , no backticks>",
      "informative_feedback_explanation": "<1-2 sentences explaining how to give richer feedback >",
      "informative_feedback_code": "<JUST the example function code block , no backticks>"
      }
  }
  

Be constructive, specific, and actionable in your feedback. DO NOT wrap the JSON in backticks or any markdown.`;

    let chatCompletion
    try {
      chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      })
    } catch (groqError: any) {
      if (groqError.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a few moments.' },
          { status: 429 }
        )
      }
      throw groqError
    }

    const content = chatCompletion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const evaluation = JSON.parse(content)

    // Validate response structure
    if (
      typeof evaluation.score !== 'number' ||
      !evaluation.strengths ||
      !evaluation.improvements ||
      !evaluation.full_report ||
      typeof evaluation.full_report !== 'object'
    ) {
      throw new Error('Invalid AI response format')
    }

    // Save evaluation to database
    const { data: evalData, error: evalError } = await supabase
      .from('evaluations')
      .insert({
        task_id: taskId,
        user_id: user.id,
        score: Math.min(100, Math.max(0, evaluation.score)),
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        full_report: JSON.stringify(evaluation.full_report),
        is_paid: false,
      })
      .select()
      .single()

    if (evalError) {
      console.error('Database error:', evalError)
      return NextResponse.json({ error: 'Failed to save evaluation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        id: evalData.id,
        score: evaluation.score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      },
    })
  } catch (error: any) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export const maxDuration = 30
