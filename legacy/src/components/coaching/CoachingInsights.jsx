import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Flame,
  Trophy,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CoachingInsights({ 
  userProgress = [], 
  userAchievement, 
  courses = [],
  onViewFullCoaching 
}) {
  const calculateInsights = () => {
    const completedCourses = userProgress.filter(p => p.completion_percentage === 100).length;
    const inProgressCourses = userProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
    const avgProgress = userProgress.length > 0 
      ? userProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / userProgress.length 
      : 0;
    
    const recentActivity = userProgress.filter(p => {
      const lastAccessed = new Date(p.last_accessed);
      const daysSince = (new Date() - lastAccessed) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    }).length;

    const stagnantCourses = userProgress.filter(p => {
      if (p.completion_percentage >= 100) return false;
      const lastAccessed = new Date(p.last_accessed);
      const daysSince = (new Date() - lastAccessed) / (1000 * 60 * 60 * 24);
      return daysSince > 14;
    });

    const currentStreak = userAchievement?.current_streak_days || 0;
    const totalPoints = userAchievement?.total_points || 0;

    // Generate insights
    const insights = [];

    // Momentum insight
    if (recentActivity > 0) {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        title: "Strong Learning Momentum",
        message: `You've been active in ${recentActivity} course${recentActivity > 1 ? 's' : ''} this week! Keep it up!`,
        color: "green"
      });
    } else if (currentStreak === 0) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Time to Re-engage",
        message: "You haven't logged any learning activity recently. Even 15 minutes can make a difference!",
        color: "orange"
      });
    }

    // Progress insight
    if (avgProgress >= 70) {
      insights.push({
        type: "positive",
        icon: Trophy,
        title: "Excellent Progress",
        message: `You're at ${avgProgress.toFixed(0)}% average completion across your courses. You're on track for success!`,
        color: "purple"
      });
    } else if (avgProgress < 30 && userProgress.length > 0) {
      insights.push({
        type: "suggestion",
        icon: Target,
        title: "Focus Opportunity",
        message: "Consider focusing on completing 1-2 courses fully rather than starting many. Quality over quantity!",
        color: "blue"
      });
    }

    // Stagnant courses
    if (stagnantCourses.length > 0) {
      insights.push({
        type: "actionable",
        icon: Lightbulb,
        title: "Courses Need Attention",
        message: `You have ${stagnantCourses.length} course${stagnantCourses.length > 1 ? 's' : ''} that haven't been accessed in 2+ weeks. Let's get back on track!`,
        color: "yellow",
        action: {
          text: "Review Progress",
          onClick: onViewFullCoaching
        }
      });
    }

    // Streak insight
    if (currentStreak >= 7) {
      insights.push({
        type: "celebration",
        icon: Flame,
        title: `${currentStreak}-Day Streak! 🔥`,
        message: "Your consistency is impressive! Daily learning builds lasting knowledge.",
        color: "orange"
      });
    }

    // Achievement insight
    if (completedCourses >= 3 && completedCourses < 5) {
      insights.push({
        type: "milestone",
        icon: Trophy,
        title: "Achievement Milestone Near",
        message: `Complete ${5 - completedCourses} more course${5 - completedCourses > 1 ? 's' : ''} to unlock the "Learning Enthusiast" badge!`,
        color: "gold"
      });
    }

    return insights.slice(0, 3); // Top 3 insights
  };

  const insights = calculateInsights();

  const getColorClasses = (color) => {
    const colors = {
      green: "from-green-50 to-green-100 border-green-300",
      orange: "from-orange-50 to-orange-100 border-orange-300",
      purple: "from-purple-50 to-purple-100 border-purple-300",
      blue: "from-blue-50 to-blue-100 border-blue-300",
      yellow: "from-yellow-50 to-yellow-100 border-yellow-300",
      gold: "from-yellow-50 to-orange-50 border-yellow-400"
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      green: "text-green-600",
      orange: "text-orange-600",
      purple: "text-purple-600",
      blue: "text-blue-600",
      yellow: "text-yellow-600",
      gold: "text-yellow-600"
    };
    return colors[color] || colors.blue;
  };

  if (insights.length === 0) {
    return (
      <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
        <CardContent className="p-8 text-center">
          <Lightbulb className="w-12 h-12 text-teal-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Coach Ready</h3>
          <p className="text-gray-600 mb-4">
            Start learning to receive personalized insights and coaching!
          </p>
          <Link to={createPageUrl("TrainingHub")}>
            <Button className="teal-gradient text-white">
              Browse Courses
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-teal-600" />
            AI Coach Insights
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700">
            Personalized for You
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 bg-gradient-to-r ${getColorClasses(insight.color)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(insight.color)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                  {insight.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={insight.action.onClick}
                      className="mt-3 border-2"
                    >
                      {insight.action.text}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="pt-4 border-t border-teal-200">
          <Button
            onClick={onViewFullCoaching}
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Full AI Coaching Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}