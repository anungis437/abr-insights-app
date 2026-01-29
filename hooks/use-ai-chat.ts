'use client'

import { useState, useCallback } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isError?: boolean
}

export interface AIError {
  message: string
  code?: string
  details?: any
}

export function useAIChat() {
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Add user message
      const userMessage: Message = {
        role: 'user',
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get AI response')
        }

        const data = await response.json()

        // Add assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response || data.message || 'No response received',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch (err) {
        const error: AIError = {
          message: err instanceof Error ? err.message : 'An error occurred',
        }
        setError(error)

        // Add error message to chat
        const errorMessage: Message = {
          role: 'assistant',
          content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
          timestamp: new Date(),
          isError: true,
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [messages]
  )

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: `👋 Hello! I'm your AI assistant for anti-Black racism education and case law analysis. How can I help you today?`,
        timestamp: new Date(),
      },
    ])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}
