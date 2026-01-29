import { NextRequest, NextResponse } from 'next/server'
import { guardedRoute, GuardedContext } from '@/lib/api/guard'
import { createClient } from '@/lib/supabase/server'
import { withMultipleRateLimits, RateLimitPresets } from '@/lib/security/rateLimit'

/**
 * AI Coach API Endpoint
 * Route: /api/ai/coach
 * Handles coaching session generation using Azure OpenAI
 *
 * Protected by:
 * - Authentication: Required (withAuth)
 * - Organization Context: Required (withOrg)
 * - Permission: 'ai.coach.use' or 'admin.ai.manage'
 */

async function coachHandler(request: NextRequest, context: GuardedContext) {
  try {
    const { sessionType, query, context: coachContext } = await request.json()

    // Validate required fields
    if (!sessionType) {
      return NextResponse.json({ error: 'Session type is required' }, { status: 400 })
    }

    // Get Azure OpenAI configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION

    if (!endpoint || !apiKey || !deployment || !apiVersion) {
      return NextResponse.json(
        { error: 'Azure OpenAI is not properly configured' },
        { status: 500 }
      )
    }

    // Build coaching prompt based on session type
    let systemPrompt = ''
    let userPrompt = ''

    const stats = coachContext?.stats || {}

    // Validate input length (rate limit abuse prevention)
    if (query && query.length > 2000) {
      return NextResponse.json({ error: 'Query too long (max 2000 characters)' }, { status: 400 })
    }

    switch (sessionType) {
      case 'comprehensive':
        systemPrompt = `You are an expert learning coach providing comprehensive progress analysis. 
Be encouraging, specific, and actionable.

User Stats:
- Completed Courses: ${stats.completed || 0}
- In Progress: ${stats.inProgress || 0}
- Total Points: ${stats.totalPoints || 0}
- Current Streak: ${stats.currentStreak || 0} days
- Badges Earned: ${stats.badgesEarned || 0}
- Average Progress: ${stats.avgProgress || 0}%

Provide:
1. Overall Assessment - Where they stand
2. Strengths - What they're doing well
3. Areas for Improvement - Growth opportunities
4. Motivation - Encouraging message
5. Next Steps - 3-5 specific actions`
        userPrompt = 'Provide a comprehensive review of my learning progress.'
        break

      case 'learning_path':
        systemPrompt = `You are an expert learning path designer creating personalized course sequences.

User Stats:
- Completed: ${stats.completed || 0}
- In Progress: ${stats.inProgress || 0}
- Average Progress: ${stats.avgProgress || 0}%

Create a learning path that:
1. Builds progressively on existing knowledge
2. Fills knowledge gaps
3. Balances theory with practical application
4. Aligns with adult learning principles

Suggest 4-6 courses in recommended order with brief rationale.`
        userPrompt = 'Design a personalized learning path for my development.'
        break

      case 'at_risk':
        systemPrompt = `You are a supportive learning coach helping re-engage struggling learners.

User Stats:
- Completed: ${stats.completed || 0}
- In Progress: ${stats.inProgress || 0}
- Streak: ${stats.currentStreak || 0} days

Focus on:
1. Understanding barriers and challenges
2. Flexible, achievable re-engagement strategies
3. Small, confidence-building goals
4. Encouraging, non-judgmental tone

Be empathetic and supportive.`
        userPrompt = 'I need help getting back on track with my learning.'
        break

      case 'custom_query':
        systemPrompt = `You are an AI learning coach providing personalized guidance on HR and employment law topics.

User Stats:
- Completed: ${stats.completed || 0}
- In Progress: ${stats.inProgress || 0}
- Points: ${stats.totalPoints || 0}
- Streak: ${stats.currentStreak || 0} days

Provide specific, actionable advice tailored to their learning context.`
        userPrompt = query || 'How can I improve my learning?'
        break

      default:
        return NextResponse.json({ error: 'Invalid session type' }, { status: 400 })
    }

    // Call Azure OpenAI
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 0.95,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const insights = data.choices?.[0]?.message?.content || 'Unable to generate insights.'

    // Log AI usage for audit trail and cost tracking
    const supabase = await createClient()
    try {
      await supabase.from('ai_usage_logs').insert({
        user_id: context.user!.id,
        organization_id: context.organizationId!,
        endpoint: 'coach',
        session_type: sessionType,
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        model: deployment,
        created_at: new Date().toISOString(),
      })
    } catch (err) {
      // Log error but don't fail the request
      console.error('Failed to log AI usage:', err)
    }

    // Generate recommendations based on stats
    const recommendations = generateRecommendations(stats, sessionType)

    return NextResponse.json({
      insights,
      recommendations,
      learningPath: [],
      usage: data.usage,
    })
  } catch (error) {
    console.error('AI Coach API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate coaching session',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(stats: any, sessionType: string) {
  const recommendations = []

  // High priority: Complete in-progress courses
  if (stats.inProgress > 0) {
    recommendations.push({
      type: 'course',
      title: 'Complete Your Current Courses',
      description: `You have ${stats.inProgress} course(s) in progress. Finishing what you've started builds momentum and confidence.`,
      priority: 'high' as const,
      action_url: '/courses',
    })
  }

  // Medium priority: Build streak
  if (stats.currentStreak < 7) {
    recommendations.push({
      type: 'strategy',
      title: 'Build Your Learning Streak',
      description:
        'Aim for 7+ consecutive days of learning. Daily consistency is more effective than occasional long sessions.',
      priority: 'medium' as const,
      action_url: '/courses',
    })
  }

  // Low priority: Explore resources
  if (stats.completed < 5) {
    recommendations.push({
      type: 'resource',
      title: 'Explore Practice Scenarios',
      description: 'Try interactive case studies to apply your knowledge in realistic situations.',
      priority: 'low' as const,
      action_url: '/cases',
    })
  }

  return recommendations
}

// Apply route guards with rate limiting
export const POST = withMultipleRateLimits(
  [RateLimitPresets.aiCoach, RateLimitPresets.aiCoachOrg],
  guardedRoute(coachHandler, {
    requireAuth: true,
    requireOrg: true,
    anyPermissions: ['ai.coach.use', 'admin.ai.manage'],
  })
)
