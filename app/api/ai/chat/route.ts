import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * AI Chat API Endpoint
 * Handles chat requests to Azure OpenAI GPT-4o
 * POST /api/ai/chat
 */

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Verify Azure OpenAI configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    if (!endpoint || !apiKey) {
      console.error('Azure OpenAI credentials not configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Build system prompt with context
    const systemPrompt = `You are an expert AI assistant for the ABR Insights Platform - Canada's leading anti-Black racism education and case law analysis platform.

Your role is to:
1. Provide accurate, actionable guidance on anti-Black racism issues
2. Reference tribunal cases and legal precedents when relevant
3. Recommend appropriate courses for learning
4. Offer practical workplace solutions
5. Be empathetic, professional, and educational

Platform Context:
- ${context?.casesCount || 0} tribunal cases in database covering anti-Black racism decisions
- ${context?.coursesCount || 0} training courses available
- User has completed ${context?.completedCount || 0} courses

Guidelines:
- If asked about CASE LAW: Explain general patterns and principles from Canadian human rights tribunal cases
- If asked about LEARNING: Recommend topics to explore in our course catalog
- If asked about INVESTIGATIONS: Provide step-by-step guidance based on best practices
- If asked about POLICY: Offer evidence-based policy recommendations
- Always be respectful, informative, and action-oriented
- If you don't know something specific, acknowledge limitations and suggest general directions

Respond in a helpful, conversational tone with actionable insights.`;

    // Call Azure OpenAI
    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Azure OpenAI');
    }

    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      response: aiResponse,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process AI request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
