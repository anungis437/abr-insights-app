'use client'

/**
 * AI Assistant Page
 * Replaces legacy AIAssistant.jsx (429 lines)
 * Route: /ai-assistant
 * Features: AI chat for case law queries, learning guidance, investigation support
 * Note: Simplified version - Vector search/RAG to be added in future phase
 */

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  Scale,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Loader2,
  FileText,
  Award,
  Search,
  User,
  Info,
  AlertCircle,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import ReactMarkdown from 'react-markdown'

// Types
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

interface QuickPrompt {
  icon: any
  text: string
  prompt: string
}

export default function AIAssistantPage() {
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your AI assistant for anti-Black racism education and case law analysis. I can help you with:

• **Case Law Queries**: Ask me about tribunal cases or legal precedents
• **Learning Guidance**: Get personalized course recommendations
• **Investigation Support**: Guidance on conducting bias-free investigations
• **Policy Questions**: Help with developing anti-racist policies

What would you like to explore today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    casesCount: 0,
    coursesCount: 0,
    completedCount: 0,
  })

  // Quick prompts
  const quickPrompts: QuickPrompt[] = [
    {
      icon: Scale,
      text: 'Find cases about workplace harassment',
      prompt:
        "Can you show me tribunal cases specifically about workplace harassment against Black employees? I'm interested in understanding common patterns and outcomes.",
    },
    {
      icon: BookOpen,
      text: 'Recommend courses for me',
      prompt:
        'Based on my learning progress and role, what courses would you recommend I take next to deepen my understanding of anti-racism practices?',
    },
    {
      icon: Lightbulb,
      text: 'How to conduct fair investigations',
      prompt:
        'What are the key principles for conducting bias-free workplace investigations? Can you provide specific guidance with examples from case law?',
    },
    {
      icon: FileText,
      text: 'Create anti-racism policy',
      prompt:
        'I need to develop an anti-racism policy for my organization. What key elements should it include based on tribunal case learnings and best practices?',
    },
  ]

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    loadUser()
  }, [supabase.auth])

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      // Get cases count
      const { count: casesCount } = await supabase
        .from('tribunal_cases')
        .select('*', { count: 'exact', head: true })

      // Get courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })

      // Get user's completed courses
      let completedCount = 0
      if (user) {
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')

        completedCount = count || 0
      }

      setStats({
        casesCount: casesCount || 0,
        coursesCount: coursesCount || 0,
        completedCount,
      })
    }
    loadStats()
  }, [supabase, user])

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call AI API endpoint
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: {
            casesCount: stats.casesCount,
            coursesCount: stats.coursesCount,
            completedCount: stats.completedCount,
            userId: user?.id,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content:
          data.response || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AI Assistant</h1>
                <p className="text-gray-600">
                  Your intelligent guide for anti-racism education and case analysis
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Chat Area */}
            <div className="lg:col-span-2">
              <div className="flex h-[700px] flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Chat Header */}
                <div className="border-b bg-gradient-to-r from-purple-50 to-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-6 w-6 text-purple-600" />
                      <h2 className="text-xl font-bold text-gray-900">AI Chat Assistant</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                      <Sparkles className="h-3 w-3" />
                      Powered by AI
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}
                      >
                        <div
                          className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                              message.role === 'user'
                                ? 'bg-teal-500'
                                : message.isError
                                  ? 'bg-red-500'
                                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
                            }`}
                          >
                            {message.role === 'user' ? (
                              <User className="h-5 w-5 text-white" />
                            ) : (
                              <Bot className="h-5 w-5 text-white" />
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-teal-600 text-white'
                                : message.isError
                                  ? 'border border-red-200 bg-red-50 text-red-900'
                                  : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            <p className="mt-2 text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="rounded-2xl bg-gray-100 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span className="text-gray-600">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t bg-gray-50 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask me anything about anti-racism, case law, or training..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 text-white shadow-md transition-all hover:from-purple-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Press Enter to send • Shift + Enter for new line
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Prompts */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    Quick Prompts
                  </h3>
                </div>
                <div className="space-y-2 p-6">
                  {quickPrompts.map((prompt, index) => {
                    const Icon = prompt.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt.prompt)}
                        className="group w-full rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-purple-500 hover:bg-purple-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 transition-colors group-hover:bg-purple-200">
                            <Icon className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{prompt.text}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-sm">
                <div className="border-b border-purple-100 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Capabilities
                  </h3>
                </div>
                <div className="space-y-3 p-6 text-sm">
                  <div className="flex items-start gap-2">
                    <Scale className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Case Analysis</p>
                      <p className="text-xs text-gray-600">
                        Search and analyze tribunal cases with natural language
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BookOpen className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Learning Guidance</p>
                      <p className="text-xs text-gray-600">
                        Personalized course recommendations based on your progress
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Predictive Insights</p>
                      <p className="text-xs text-gray-600">
                        Understand case outcome patterns and trends
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Best Practices</p>
                      <p className="text-xs text-gray-600">
                        Evidence-based guidance for investigations and policies
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Stats */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-6">
                  <h3 className="text-lg font-bold text-gray-900">Your Learning Journey</h3>
                </div>
                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Courses Completed</span>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
                      {stats.completedCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cases Available</span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                      {stats.casesCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Courses Available</span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {stats.coursesCount}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/courses')}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <Award className="h-4 w-4" />
                    Browse Courses
                  </button>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-900">
                  <Lightbulb className="h-4 w-4" />
                  Pro Tip
                </p>
                <p className="text-xs text-yellow-800">
                  Be specific in your queries! Instead of &ldquo;tell me about
                  discrimination,&rdquo; try &ldquo;show me cases where Black employees were denied
                  promotions in tech companies.&rdquo;
                </p>
              </div>

              {/* Beta Notice */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Info className="h-4 w-4" />
                  Beta Feature
                </p>
                <p className="text-xs text-blue-800">
                  This AI assistant is continuously learning. Vector search and advanced RAG
                  capabilities will be added soon for even better responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>{' '}
    </div>
  )
}
