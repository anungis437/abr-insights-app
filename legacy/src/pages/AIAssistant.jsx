import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI assistant for anti-Black racism education and case law analysis. I can help you with:\n\n• **Case Law Queries**: Ask me about specific tribunal cases or legal precedents\n• **Learning Guidance**: Get personalized course recommendations\n• **Investigation Support**: Guidance on conducting bias-free investigations\n• **Policy Questions**: Help with developing anti-racist policies\n\nWhat would you like to explore today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("chat");
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: cases = [] } = useQuery({
    queryKey: ['cases-ai'],
    queryFn: () => base44.entities.TribunalCase.list(),
    initialData: [],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-ai'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress-ai', user?.email],
    queryFn: () => user ? base44.entities.Progress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    {
      icon: Scale,
      text: "Find cases about workplace harassment",
      prompt: "Can you show me tribunal cases specifically about workplace harassment against Black employees? I'm interested in understanding common patterns and outcomes.",
    },
    {
      icon: BookOpen,
      text: "Recommend courses for me",
      prompt: "Based on my learning progress and role, what courses would you recommend I take next to deepen my understanding of anti-racism practices?",
    },
    {
      icon: Lightbulb,
      text: "How to conduct fair investigations",
      prompt: "What are the key principles for conducting bias-free workplace investigations? Can you provide specific guidance with examples from case law?",
    },
    {
      icon: FileText,
      text: "Create anti-racism policy",
      prompt: "I need to develop an anti-racism policy for my organization. What key elements should it include based on tribunal case learnings and best practices?",
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context for the AI
      const contextPrompt = `You are an expert AI assistant for the ABR Insight Platform - Canada's leading anti-Black racism education and case law analysis platform.

User Query: ${input}

Available Context:
- ${cases.length} tribunal cases in database covering anti-Black racism decisions
- ${courses.length} training courses available
- User has completed ${progress.filter(p => p.completion_percentage === 100).length} courses

Your role:
1. Provide accurate, actionable guidance on anti-Black racism issues
2. Reference specific tribunal cases when relevant
3. Recommend appropriate courses for learning
4. Offer practical workplace solutions
5. Be empathetic, professional, and educational

If the query is about:
- CASE LAW: Search through available cases and provide relevant examples with case numbers
- LEARNING: Recommend specific courses from our catalog
- INVESTIGATIONS: Provide step-by-step guidance based on best practices
- POLICY: Offer evidence-based policy recommendations

Respond in a helpful, conversational tone with actionable insights.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false,
      });

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorMessage = {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Your intelligent guide for anti-racism education and case analysis</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-6 h-6 text-purple-600" />
                    AI Chat Assistant
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Powered by AI
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-teal-500' 
                              : message.isError 
                              ? 'bg-red-500'
                              : 'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}>
                            {message.role === 'user' ? (
                              <span className="text-white text-sm font-semibold">
                                {user?.full_name?.[0] || 'U'}
                              </span>
                            ) : (
                              <Bot className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className={`rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-teal-600 text-white'
                              : message.isError
                              ? 'bg-red-50 text-red-900 border border-red-200'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                          <span className="text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about anti-racism, case law, or training..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send • Shift + Enter for new line
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Icon className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{prompt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Scale className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Case Analysis</p>
                    <p className="text-gray-600 text-xs">Search and analyze tribunal cases with natural language</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Learning Guidance</p>
                    <p className="text-gray-600 text-xs">Personalized course recommendations based on your progress</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Predictive Insights</p>
                    <p className="text-gray-600 text-xs">Understand case outcome patterns and trends</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Best Practices</p>
                    <p className="text-gray-600 text-xs">Evidence-based guidance for investigations and policies</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Learning Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Courses Completed</span>
                  <Badge>{progress.filter(p => p.completion_percentage === 100).length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <Badge variant="outline">
                    {progress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length}
                  </Badge>
                </div>
                <Link to={createPageUrl("Dashboard")}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Award className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Tip */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Pro Tip
              </p>
              <p className="text-xs text-yellow-800">
                Be specific in your queries! Instead of "tell me about discrimination," try "show me cases where Black employees were denied promotions in tech companies."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}