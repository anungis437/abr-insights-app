import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal,
  Award,
  TrendingUp,
  Crown,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

export default function Leaderboard({ achievements = [], organization = null }) {
  const [timeframe, setTimeframe] = useState("all-time");

  const sortedByPoints = [...achievements].sort((a, b) => b.total_points - a.total_points);
  const sortedByCourses = [...achievements].sort((a, b) => b.courses_completed_count - a.courses_completed_count);
  const sortedByStreak = [...achievements].sort((a, b) => b.current_streak_days - a.current_streak_days);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

  const LeaderboardRow = ({ achievement, rank, metric, metricValue }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-lg ${
        rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-white'
      } border ${rank <= 3 ? 'border-yellow-200' : 'border-gray-200'} hover:shadow-md transition-all`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getRankBadge(rank)}`}>
        {getRankIcon(rank) || <span className="text-xl font-bold">#{rank}</span>}
      </div>

      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-lg font-bold">
          {achievement.user_email[0].toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 truncate">
          {achievement.user_email.split('@')[0]}
        </h4>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            Lvl {achievement.level}
          </span>
          <span className="flex items-center gap-1">
            <Award className="w-4 h-4" />
            {achievement.badges_earned?.length || 0} badges
          </span>
        </div>
      </div>

      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">{metricValue}</div>
        <div className="text-xs text-gray-600">{metric}</div>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Leaderboard
          </CardTitle>
          {organization && (
            <Badge variant="outline" className="border-purple-300 text-purple-700">
              {organization.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="points" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Points
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Streak
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-3">
            {sortedByPoints.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No achievements yet</p>
              </div>
            ) : (
              sortedByPoints.slice(0, 10).map((achievement, index) => (
                <LeaderboardRow
                  key={achievement.id}
                  achievement={achievement}
                  rank={index + 1}
                  metric="points"
                  metricValue={achievement.total_points}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-3">
            {sortedByCourses.slice(0, 10).map((achievement, index) => (
              <LeaderboardRow
                key={achievement.id}
                achievement={achievement}
                rank={index + 1}
                metric="courses"
                metricValue={achievement.courses_completed_count}
              />
            ))}
          </TabsContent>

          <TabsContent value="streak" className="space-y-3">
            {sortedByStreak.slice(0, 10).map((achievement, index) => (
              <LeaderboardRow
                key={achievement.id}
                achievement={achievement}
                rank={index + 1}
                metric="day streak"
                metricValue={achievement.current_streak_days}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}