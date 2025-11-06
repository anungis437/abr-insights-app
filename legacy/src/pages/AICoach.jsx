
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Corrected import path
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Lightbulb, 
  TrendingUp,
  Target,
  Sparkles,
  BookOpen,
  Trophy,
  AlertCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Flame,
  Award,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import LearningPathRecommendations from "../components/coaching/LearningPathRecommendations";

export default function AICoach() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [customQuery, setCustomQuery] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: userProgress = [] } = useQuery({
    queryKey: ['coach-progress', user?.email],
    queryFn: () => user ? base44.entities.Progress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: userAchievement } = useQuery({
    queryKey: ['coach-achievement', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const achievements = await base44.entities.UserAchievement.filter({ user_email: user.email });
      return achievements[0] || null;
    },
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['coach-courses'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['coach-certificates', user?.email],
    queryFn: () => user ? base44.entities.Certificate.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: previousSessions = [] } = useQuery({
    queryKey: ['coaching-sessions', user?.email],
    queryFn: () => user ? base44.entities.AICoachingSession.filter({ user_email: user.email }, '-created_date') : [],
    enabled: !!user,
    initialData: [],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData) => {
      return await base44.entities.AICoachingSession.create({
        user_email: user.email,
        ...sessionData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.AICoachingSession.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
    },
  });

  const generateCoachingSession = async (type, query = null) => {
    setIsAnalyzing(true);

    try {
      // Prepare user data for analysis
      const completedCourses = userProgress.filter(p => p.completion_percentage === 100);
      const inProgressCourses = userProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100);
      const avgProgress = userProgress.length > 0 
        ? userProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / userProgress.length 
        : 0;

      const recentActivity = userProgress.filter(p => {
        const lastAccessed = new Date(p.last_accessed);
        const daysSince = (new Date() - lastAccessed) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });

      const stagnantCourses = userProgress.filter(p => {
        if (p.completion_percentage >= 100) return false;
        const lastAccessed = new Date(p.last_accessed);
        const daysSince = (new Date() - lastAccessed) / (1000 * 60 * 60 * 24);
        return daysSince > 14;
      });

      // Build context for AI
      let prompt = "";

      if (type === "comprehensive") {
        prompt = `You are an expert AI learning coach for anti-Black racism education. Analyze this learner's progress and provide comprehensive, actionable coaching.

**Learner Profile:**
- Total Courses Enrolled: ${userProgress.length}
- Completed Courses: ${completedCourses.length}
- In Progress: ${inProgressCourses.length}
- Average Completion: ${avgProgress.toFixed(0)}%
- Total Points: ${userAchievement?.total_points || 0}
- Current Streak: ${userAchievement?.current_streak_days || 0} days
- Badges Earned: ${userAchievement?.badges_earned?.length || 0}
- Certificates: ${certificates.length}
- Recent Activity (7 days): ${recentActivity.length} courses
- Stagnant Courses (14+ days): ${stagnantCourses.length}

**Course Progress Details:**
${userProgress.slice(0, 10).map(p => {
  const course = courses.find(c => c.id === p.course_id);
  return `- ${course?.title_en || 'Course'}: ${p.completion_percentage.toFixed(0)}% (Last accessed: ${new Date(p.last_accessed).toLocaleDateString()})`;
}).join('\n')}

**Provide:**
1. **Overall Assessment**: Honest evaluation of learning momentum and engagement
2. **Strengths**: What they're doing well
3. **Areas for Improvement**: Specific, actionable suggestions
4. **Motivation**: Encouraging message tailored to their situation
5. **Next Steps**: 3-5 concrete actions they should take this week

Be empathetic, encouraging, but also honest. If they're struggling, acknowledge it and provide supportive guidance.`;

      } else if (type === "at_risk") {
        prompt = `You are an AI learning coach providing intervention support for a learner who may be at risk of disengagement.

**Learner Situation:**
- Average Progress: ${avgProgress.toFixed(0)}%
- Recent Activity: ${recentActivity.length} courses in last 7 days
- Stagnant Courses: ${stagnantCourses.length}
- Current Streak: ${userAchievement?.current_streak_days || 0} days

**Your role:** Provide supportive, non-judgmental coaching to help them re-engage. Address potential barriers, offer flexibility strategies, and break down overwhelming goals into manageable steps.

Focus on:
1. Understanding potential barriers
2. Offering flexible re-engagement strategies
3. Setting small, achievable goals
4. Providing encouragement and perspective`;

      } else if (type === "learning_path") {
        prompt = `You are an AI learning coach creating a personalized learning path for anti-Black racism education.

**Current Status:**
- Completed: ${completedCourses.length} courses
- In Progress: ${inProgressCourses.length} courses
- Level: ${Math.floor((userAchievement?.total_points || 0) / 100) + 1}

**Available Courses:**
${courses.slice(0, 12).map(c => `- ${c.id}: ${c.title_en} (${c.level}, ${c.category})`).join('\n')}

**Already Completed:**
${completedCourses.map(p => {
  const course = courses.find(c => c.id === p.course_id);
  return course?.title_en;
}).join(', ')}

Create a recommended learning path of 4-6 courses that:
1. Builds progressively on their current knowledge
2. Fills identified gaps
3. Balances theory and practice
4. Aligns with adult learning principles

Provide the course IDs as a JSON array, plus explanation of the path's rationale.`;

      } else if (query) {
        prompt = `You are an AI learning coach for anti-Black racism education. The learner asks:

"${query}"

**Their Context:**
- Progress: ${completedCourses.length} completed, ${inProgressCourses.length} in progress
- Achievement Level: ${Math.floor((userAchievement?.total_points || 0) / 100) + 1}
- Recent Activity: ${recentActivity.length > 0 ? 'Active' : 'Low'}

Provide a helpful, personalized response that addresses their question with actionable guidance.`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
      });

      // Extract learning path if present
      let learningPath = [];
      let cleanedInsights = result;

      if (type === "learning_path") {
        const jsonMatch = result.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          try {
            learningPath = JSON.parse(jsonMatch[0]);
            cleanedInsights = result.replace(jsonMatch[0], '').trim();
          } catch (e) {
            console.error("Failed to parse learning path:", e);
          }
        }
      }

      // Generate recommendations based on analysis
      const recommendations = generateRecommendations(result, userProgress, courses, userAchievement); // Added userAchievement

      const sessionData = {
        session_type: type,
        insights_generated: cleanedInsights,
        recommendations,
        learning_path: learningPath,
      };

      const newSession = await createSessionMutation.mutateAsync(sessionData);
      setCurrentSession({ ...sessionData, id: newSession.id });

    } catch (error) {
      console.error("Error generating coaching session:", error);
      setCurrentSession({
        session_type: type,
        insights_generated: "I apologize, but I encountered an error generating your coaching session. Please try again or contact support if the issue persists.",
        recommendations: [],
        learning_path: [],
      });
    }

    setIsAnalyzing(false);
  };

  const generateRecommendations = (insights, progress, allCourses, achievement) => {
    const recommendations = [];
    const inProgress = progress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100);

    // Recommend completing in-progress courses
    if (inProgress.length > 0) {
      const course = allCourses.find(c => c.id === inProgress[0].course_id);
      if (course) {
        recommendations.push({
          type: "course",
          title: `Complete "${course.title_en}"`,
          description: `You're ${inProgress[0].completion_percentage.toFixed(0)}% done. Finish strong!`,
          priority: "high",
          action_url: `/CoursePlayer?id=${course.id}`,
        });
      }
    }

    // Recommend streak building
    if ((achievement?.current_streak_days || 0) < 7) {
      recommendations.push({
        type: "strategy",
        title: "Build a Learning Streak",
        description: "Commit to 15 minutes of learning daily. Consistency builds lasting knowledge.",
        priority: "medium",
      });
    }

    // Recommend exploring resources
    recommendations.push({
      type: "resource",
      title: "Explore Practice Resources",
      description: "Check out templates and toolkits to apply your learning in real scenarios.",
      priority: "low",
      action_url: "/Resources",
    });

    return recommendations;
  };

  const handleFeedback = async (feedbackType) => {
    if (currentSession?.id) {
      await updateSessionMutation.mutateAsync({
        id: currentSession.id,
        data: { user_feedback: feedbackType },
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">AI Learning Coach</h1>
              <p className="text-gray-600">Personalized guidance powered by artificial intelligence</p>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {userProgress.filter(p => p.completion_percentage === 100).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {userAchievement?.current_streak_days || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4" />
                    Day Streak
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {userAchievement?.total_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Points</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {userAchievement?.badges_earned?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" />
                    Badges
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coaching Session */}
            <AnimatePresence mode="wait">
              {currentSession ? (
                <motion.div
                  key="session"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Insights */}
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          Your Personalized Coaching
                        </CardTitle>
                        <Badge className="bg-purple-100 text-purple-700">
                          Just for You
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown>{currentSession.insights_generated}</ReactMarkdown>
                      </div>

                      {/* Feedback */}
                      <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-600 mb-3">Was this coaching helpful?</p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback("helpful")}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Helpful
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback("somewhat_helpful")}
                          >
                            Somewhat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFeedback("not_helpful")}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Not Helpful
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  {currentSession.recommendations && currentSession.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-teal-600" />
                          Recommended Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentSession.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 ${
                              rec.priority === 'high'
                                ? 'border-red-200 bg-red-50'
                                : rec.priority === 'medium'
                                ? 'border-yellow-200 bg-yellow-50'
                                : 'border-blue-200 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {rec.priority} priority
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700">{rec.description}</p>
                              </div>
                            </div>
                            {rec.action_url && (
                              <Button
                                size="sm"
                                className="mt-3 teal-gradient text-white"
                                onClick={() => navigate(rec.action_url)}
                              >
                                Take Action
                              </Button>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Learning Path */}
                  {currentSession.learning_path && currentSession.learning_path.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <LearningPathRecommendations
                          path={currentSession.learning_path}
                          courses={courses}
                          userProgress={userProgress}
                        />
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setCurrentSession(null)}
                    className="w-full"
                  >
                    Start New Session
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-2 border-purple-200">
                    <CardHeader>
                      <CardTitle>Choose Your Coaching Session</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <button
                        onClick={() => generateCoachingSession("comprehensive")}
                        disabled={isAnalyzing}
                        className="w-full text-left p-6 rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Comprehensive Progress Review</h3>
                            <p className="text-sm text-gray-600">
                              Get a complete analysis of your learning journey with personalized feedback and actionable next steps.
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => generateCoachingSession("learning_path")}
                        disabled={isAnalyzing}
                        className="w-full text-left p-6 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Create Learning Path</h3>
                            <p className="text-sm text-gray-600">
                              Generate a personalized course sequence optimized for your learning goals and current level.
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => generateCoachingSession("at_risk")}
                        disabled={isAnalyzing}
                        className="w-full text-left p-6 rounded-lg border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Re-engagement Support</h3>
                            <p className="text-sm text-gray-600">
                              Get supportive guidance if you're struggling with motivation or finding it hard to stay consistent.
                            </p>
                          </div>
                        </div>
                      </button>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-900 mb-3">Custom Question</h4>
                        <Textarea
                          placeholder="Ask me anything about your learning journey..."
                          value={customQuery}
                          onChange={(e) => setCustomQuery(e.target.value)}
                          rows={3}
                          className="mb-3"
                        />
                        <Button
                          onClick={() => generateCoachingSession("custom_query", customQuery)}
                          disabled={isAnalyzing || !customQuery.trim()}
                          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Get Coaching
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">How AI Coaching Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Analyzes your progress, patterns, and engagement
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Provides personalized, actionable recommendations
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Adapts guidance based on your learning style
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">
                    Tracks your progress and adjusts over time
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Previous Sessions */}
            {previousSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {previousSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setCurrentSession(session)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {session.session_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(session.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {session.insights_generated.substring(0, 80)}...
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                <p>💡 Check in with your AI coach weekly for best results</p>
                <p>🎯 Be specific in your questions for more targeted advice</p>
                <p>📈 Act on recommendations to see real progress</p>
                <p>🔥 Consistent small steps beat occasional big efforts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
