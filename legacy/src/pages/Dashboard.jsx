
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  TrendingUp,
  Award,
  Clock,
  Target,
  Users,
  BookOpen,
  CheckCircle,
  Trophy,
  Calendar,
  Sparkles,
  Database,
  GraduationCap,
  Flame,
  Zap,
  TrendingUp as TrendingUpIcon,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

import OnboardingChecklist from "../components/shared/OnboardingChecklist";
import OnboardingTour from "../components/shared/OnboardingTour";
import BadgeDisplay from "../components/gamification/BadgeDisplay";
import PointsAnimation from "../components/gamification/PointsAnimation";
import Leaderboard from "../components/gamification/Leaderboard"; // Added Leaderboard import as per outline
import CoachingInsights from "../components/coaching/CoachingInsights";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(0); // Changed to number to represent points
  const [pointsEarned, setPointsEarned] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(); // Changed to redirectToLogin
      }
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-dashboard'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress-dashboard', user?.email],
    queryFn: () => user ? base44.entities.Progress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates-dashboard', user?.email],
    queryFn: () => user ? base44.entities.Certificate.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: userAchievement } = useQuery({
    queryKey: ['user-achievement', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const achievements = await base44.entities.UserAchievement.filter({ user_email: user.email });
      return achievements[0] || null;
    },
    enabled: !!user,
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: () => base44.entities.UserAchievement.list('-total_points'),
    initialData: [],
  });

  const { data: onboarding } = useQuery({
    queryKey: ['onboarding', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const onboardingList = await base44.entities.Onboarding.filter({ user_email: user.email });
      return onboardingList[0] || null;
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const updateOnboardingMutation = useMutation({
    mutationFn: async (data) => {
      if (onboarding?.id) {
        return await base44.entities.Onboarding.update(onboarding.id, data);
      } else {
        return await base44.entities.Onboarding.create({
          user_email: user.email,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
    },
  });

  // Check if user is new (less than 7 days old or no progress)
  const isNewUser = user && (
    userProgress.length === 0 ||
    (new Date() - new Date(user.created_date)) < 7 * 24 * 60 * 60 * 1000 // Simplified date difference
  );

  const shouldShowOnboarding = isNewUser && !onboarding?.tour_completed && !onboarding?.dismissed;

  useEffect(() => {
    if (shouldShowOnboarding) {
      setShowOnboarding(true);
    }
  }, [shouldShowOnboarding]);

  const onboardingSteps = [
    {
      id: 'welcome',
      title: 'Welcome to ABR Insight! 👋',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      description: "Canada's leading platform for evidence-based anti-Black racism training. Let's take a quick tour to help you get started.",
      highlights: [
        'Access 20+ years of tribunal case data',
        'Take interactive evidence-based courses',
        'Earn professional certificates',
        'Get AI-powered insights and recommendations'
      ],
    },
    {
      id: 'data-explorer',
      title: 'Explore Tribunal Data',
      icon: <Database className="w-6 h-6 text-white" />,
      description: 'Access and analyze decades of Canadian tribunal decisions on anti-Black discrimination. Use advanced filters to find relevant cases.',
      highlights: [
        'Filter by tribunal, year, outcome, and more',
        'View detailed case summaries and analysis',
        'Identify patterns and precedents',
        'Export data for your reports'
      ],
      action: {
        description: 'Ready to explore the data?',
        button: {
          text: 'Go to Data Explorer',
          onClick: () => {
            window.location.href = createPageUrl('DataExplorer');
          }
        }
      }
    },
    {
      id: 'training-hub',
      title: 'Start Your Learning Journey',
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      description: 'Take structured courses built on real case law. Each course includes video lessons, interactive quizzes, and professional certificates.',
      highlights: [
        '12 comprehensive courses',
        'Self-paced learning',
        'Earn certificates of completion',
        'Track your progress'
      ],
      action: {
        description: 'Browse available courses',
        button: {
          text: 'Go to Training Hub',
          onClick: () => {
            window.location.href = createPageUrl('TrainingHub');
          }
        }
      }
    },
    {
      id: 'ai-assistant',
      title: 'Meet Your AI Assistant',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      description: 'Get instant answers, compare cases, and receive personalized course recommendations from our AI assistant.',
      highlights: [
        'Ask questions about case law',
        'Get smart course recommendations',
        'Compare similar cases',
        'Receive insights on patterns'
      ],
      action: {
        description: 'Try the AI Assistant',
        button: {
          text: 'Open AI Chat',
          onClick: () => {
            window.location.href = createPageUrl('AIAssistant');
          }
        }
      }
    },
    {
      id: 'complete',
      title: "You're All Set! 🚀",
      icon: <Trophy className="w-6 h-6 text-white" />,
      description: "You now know the key features of ABR Insight. Start exploring, learning, and making an impact in your workplace!",
      highlights: [
        'Use Cmd/Ctrl + K to search anytime',
        'Check notifications for updates',
        'Track your progress on this dashboard',
        'Contact support if you need help'
      ]
    }
  ];

  const checklistSteps = [
    {
      id: 'explore-data',
      title: 'Explore Tribunal Cases',
      description: 'Browse the data explorer to see real tribunal decisions',
      icon: <Database className="w-5 h-5 text-teal-600" />,
      estimatedTime: 5,
      priority: 'medium'
    },
    {
      id: 'start-course',
      title: 'Start Your First Course',
      description: 'Choose a course and begin your learning journey',
      icon: <BookOpen className="w-5 h-5 text-teal-600" />,
      estimatedTime: 3,
      priority: 'high'
    },
    {
      id: 'try-ai',
      title: 'Try the AI Assistant',
      description: 'Ask a question or get course recommendations',
      icon: <Sparkles className="w-5 h-5 text-teal-600" />,
      estimatedTime: 2,
      priority: 'medium'
    },
    {
      id: 'complete-profile',
      title: 'Complete Your Profile',
      description: 'Add your name and customize your account',
      icon: <Users className="w-5 h-5 text-teal-600" />,
      estimatedTime: 2,
      priority: 'low'
    }
  ];

  const handleChecklistStepClick = (step) => {
    if (step.id === 'explore-data') {
      navigate(createPageUrl('DataExplorer'));
    } else if (step.id === 'start-course') {
      navigate(createPageUrl('TrainingHub'));
    } else if (step.id === 'try-ai') {
      navigate(createPageUrl('AIAssistant'));
    } else if (step.id === 'complete-profile') {
      navigate(createPageUrl('Profile'));
    }
  };

  const handleDismissChecklist = async () => {
    await updateOnboardingMutation.mutateAsync({
      dismissed: true,
    });
  };

  const handleCompleteChecklist = () => {
    setShowOnboarding(false);
  };

  // Calculate user level based on points
  const calculateLevel = (points) => {
    return Math.floor(points / 100) + 1;
  };

  const getNextLevelPoints = (currentPoints) => {
    const currentLevel = calculateLevel(currentPoints);
    return currentLevel * 100;
  };

  const completedCourses = userProgress.filter(p => p.completion_percentage === 100);
  const inProgressCourses = userProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100);
  const totalLearningHours = courses
    .filter(c => userProgress.some(p => p.course_id === c.id))
    .reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / 60;

  const overallProgress = userProgress.length > 0
    ? userProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / userProgress.length
    : 0;

  const learningData = userProgress.map(p => {
    const course = courses.find(c => c.id === p.course_id);
    return {
      name: course?.title_en?.substring(0, 20) + "..." || "Course",
      progress: p.completion_percentage,
    };
  }).slice(0, 5);

  const recentActivity = userProgress
    .sort((a, b) => new Date(b.last_accessed) - new Date(a.last_accessed))
    .slice(0, 5);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <LayoutDashboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view your personal dashboard and track your learning progress.
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin()}
              className="teal-gradient text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userLevel = userAchievement ? calculateLevel(userAchievement.total_points) : 1;
  const nextLevelPoints = getNextLevelPoints(userAchievement?.total_points || 0);
  const progressToNextLevel = userAchievement
    ? ((userAchievement.total_points % 100) / 100) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      {/* Points Animation */}
      <PointsAnimation
        points={pointsEarned}
        show={showPointsAnimation > 0} // Check if pointsEarned is greater than 0
        onComplete={() => setShowPointsAnimation(0)} // Reset to 0 when animation completes
      />

      {/* Onboarding Tour */}
      {showOnboarding && shouldShowOnboarding && (
        <OnboardingTour
          user={user}
          onboarding={onboarding}
          steps={onboardingSteps}
          onComplete={() => {
            updateOnboardingMutation.mutate({ tour_completed: true }); // Mark tour as complete
            setShowOnboarding(false);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Level Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 teal-gradient rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-gray-900">Welcome back, {user.full_name || user.email}</h1>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-1">
                    <Zap className="w-5 h-5 mr-1" />
                    Level {userLevel}
                  </Badge>
                </div>
                <p className="text-gray-600">Track your learning journey and achievements</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Onboarding Checklist */}
        {isNewUser && !onboarding?.is_complete && !onboarding?.dismissed && (
          <div className="mb-8">
            <OnboardingChecklist
              user={user}
              onboarding={onboarding}
              steps={checklistSteps}
              onStepClick={handleChecklistStepClick}
              onDismiss={handleDismissChecklist}
              onComplete={handleCompleteChecklist}
              // updateOnboardingMutation prop removed as per outline
            />
          </div>
        )}

        {/* Gamification Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"> {/* Changed md:grid-cols-2 lg:grid-cols-4 to md:grid-cols-4 */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">
                    {userAchievement?.total_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Points</div>
                  <div className="mt-2">
                    <Progress value={progressToNextLevel} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {nextLevelPoints - (userAchievement?.total_points || 0)} pts to Level {userLevel + 1}
                    </p>
                  </div>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-700">
                    {userAchievement?.current_streak_days || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Day Streak</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Record: {userAchievement?.longest_streak_days || 0} days
                  </div>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-700">
                    {userAchievement?.badges_earned?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Badges Earned</div>
                  <Link to={createPageUrl("Achievements")}>
                    <Button variant="link" className="text-xs p-0 h-auto mt-1">
                      View All →
                    </Button>
                  </Link>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">
                    #{allAchievements.findIndex(a => a.user_email === user.email) + 1 || '—'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Leaderboard Rank</div>
                  <Link to={createPageUrl("Leaderboard")}>
                    <Button variant="link" className="text-xs p-0 h-auto mt-1">
                      View Rankings →
                    </Button>
                  </Link>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Coaching Insights - NEW */}
        {userProgress.length > 0 && (
          <div className="mb-8">
            <CoachingInsights
              userProgress={userProgress}
              userAchievement={userAchievement}
              courses={courses}
              onViewFullCoaching={() => navigate(createPageUrl("AICoach"))}
            />
          </div>
        )}

        {/* Recent Badges */}
        {userAchievement?.badges_earned && userAchievement.badges_earned.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Recent Badges
                </CardTitle>
                <Link to={createPageUrl("Achievements")}>
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <BadgeDisplay
                badges={userAchievement.badges_earned.slice(0, 8)}
                size="small"
                showLocked={false}
              />
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle> {/* Removed icons from CardTitle */}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Completion</span> {/* Changed text from "Overall Completion" */}
                      <span className="text-sm font-semibold text-gray-900">{overallProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">{completedCourses.length}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{inProgressCourses.length}</div> {/* Changed color to blue-600 */}
                      <div className="text-xs text-gray-600">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{totalLearningHours.toFixed(1)}h</div> {/* Changed to totalLearningHours */}
                      <div className="text-xs text-gray-600">Total Time</div> {/* Changed text to "Total Time" */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress Chart and Continue Learning cards removed as per outline */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Learners
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allAchievements.slice(0, 5).map((achievement, index) => (
                  <div key={achievement.id} className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-400' :
                      index === 1 ? 'bg-gray-300' :
                      index === 2 ? 'bg-orange-400' :
                      'bg-gray-100'
                    }`}>
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {achievement.user_email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {achievement.total_points} pts • Lvl {calculateLevel(achievement.total_points)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link to={createPageUrl("Leaderboard")}>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Full Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Your Certificates, Recent Activity, and Quick Actions cards removed as per outline */}
          </div>
        </div>
      </div>
    </div>
  );
}
