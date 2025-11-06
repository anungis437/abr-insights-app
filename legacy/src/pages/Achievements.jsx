import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Trophy,
  Zap,
  Flame,
  TrendingUp,
  Star,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import BadgeDisplay, { BADGE_DEFINITIONS } from "../components/gamification/BadgeDisplay";

export default function Achievements() {
  const [user, setUser] = useState(null);

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

  const { data: userAchievement } = useQuery({
    queryKey: ['user-achievement-page', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const achievements = await base44.entities.UserAchievement.filter({ user_email: user.email });
      return achievements[0] || null;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const calculateLevel = (points) => Math.floor(points / 100) + 1;
  const userLevel = userAchievement ? calculateLevel(userAchievement.total_points) : 1;
  const nextLevelPoints = userLevel * 100;
  const progressToNextLevel = userAchievement 
    ? ((userAchievement.total_points % 100) / 100) * 100 
    : 0;

  const earnedBadgeIds = userAchievement?.badges_earned?.map(b => b.badge_id) || [];
  const totalBadges = Object.keys(BADGE_DEFINITIONS).length;
  const earnedCount = earnedBadgeIds.length;
  const completionPercentage = (earnedCount / totalBadges) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Your Achievements</h1>
              <p className="text-gray-600">Track your progress and earn rewards</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-purple-700">
                    {userAchievement?.total_points || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 mb-3">Total Points</div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Level {userLevel}</span>
                      <span>Level {userLevel + 1}</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {nextLevelPoints - (userAchievement?.total_points || 0)} pts to next level
                    </p>
                  </div>
                </div>
                <Zap className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-orange-700">
                    {userAchievement?.current_streak_days || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Day Streak</div>
                  <div className="text-xs text-gray-500 mt-2">
                    🔥 Record: {userAchievement?.longest_streak_days || 0} days
                  </div>
                </div>
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-yellow-700">{earnedCount}</div>
                  <div className="text-sm text-gray-600 mt-1">Badges Earned</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {earnedCount} of {totalBadges} collected
                  </div>
                </div>
                <Award className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-green-700">
                    {userAchievement?.courses_completed_count || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Courses Completed</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {userAchievement?.quizzes_aced_count || 0} perfect quizzes
                  </div>
                </div>
                <Target className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Collection Progress */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Badge Collection
              </CardTitle>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                {completionPercentage.toFixed(0)}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Progress value={completionPercentage} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {earnedCount} of {totalBadges} badges earned • {totalBadges - earnedCount} to go!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* All Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              All Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay 
              badges={userAchievement?.badges_earned || []} 
              showLocked={true}
            />
          </CardContent>
        </Card>

        {/* Achievement Tips */}
        <Card className="mt-8 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              How to Earn More Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-teal-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Complete Courses
                </h4>
                <p className="text-sm text-gray-600">
                  Earn 100 points for each course you complete!
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-teal-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Ace Quizzes
                </h4>
                <p className="text-sm text-gray-600">
                  Score 100% on quizzes to earn bonus points!
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-teal-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Maintain Streaks
                </h4>
                <p className="text-sm text-gray-600">
                  Log in daily to build your learning streak!
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-teal-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  Collect Badges
                </h4>
                <p className="text-sm text-gray-600">
                  Unlock badges to earn milestone bonus points!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}