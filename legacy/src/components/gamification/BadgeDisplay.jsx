import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  Flame,
  BookOpen,
  TrendingUp,
  Crown,
  Sparkles,
  Shield,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";

const BADGE_DEFINITIONS = {
  first_course: {
    id: "first_course",
    name: "First Steps",
    description: "Complete your first course",
    icon: BookOpen,
    color: "from-blue-400 to-blue-600",
    points: 50,
  },
  five_courses: {
    id: "five_courses",
    name: "Learning Enthusiast",
    description: "Complete 5 courses",
    icon: Trophy,
    color: "from-purple-400 to-purple-600",
    points: 250,
  },
  ten_courses: {
    id: "ten_courses",
    name: "Knowledge Master",
    description: "Complete 10 courses",
    icon: Crown,
    color: "from-yellow-400 to-yellow-600",
    points: 500,
  },
  perfect_quiz: {
    id: "perfect_quiz",
    name: "Quiz Ace",
    description: "Score 100% on a quiz",
    icon: Star,
    color: "from-green-400 to-green-600",
    points: 25,
  },
  five_perfect_quizzes: {
    id: "five_perfect_quizzes",
    name: "Perfect Scholar",
    description: "Score 100% on 5 quizzes",
    icon: Sparkles,
    color: "from-teal-400 to-teal-600",
    points: 150,
  },
  seven_day_streak: {
    id: "seven_day_streak",
    name: "Week Warrior",
    description: "7-day learning streak",
    icon: Flame,
    color: "from-orange-400 to-orange-600",
    points: 100,
  },
  thirty_day_streak: {
    id: "thirty_day_streak",
    name: "Dedicated Learner",
    description: "30-day learning streak",
    icon: Flame,
    color: "from-red-400 to-red-600",
    points: 500,
  },
  first_certificate: {
    id: "first_certificate",
    name: "Certified",
    description: "Earn your first certificate",
    icon: Award,
    color: "from-indigo-400 to-indigo-600",
    points: 100,
  },
  five_certificates: {
    id: "five_certificates",
    name: "Expert Certified",
    description: "Earn 5 certificates",
    icon: Shield,
    color: "from-pink-400 to-pink-600",
    points: 500,
  },
  early_adopter: {
    id: "early_adopter",
    name: "Early Adopter",
    description: "One of the first 100 users",
    icon: Rocket,
    color: "from-cyan-400 to-cyan-600",
    points: 200,
  },
  speed_learner: {
    id: "speed_learner",
    name: "Speed Learner",
    description: "Complete a course in one day",
    icon: Zap,
    color: "from-yellow-300 to-yellow-500",
    points: 75,
  },
  overachiever: {
    id: "overachiever",
    name: "Overachiever",
    description: "Reach 1000 points",
    icon: TrendingUp,
    color: "from-purple-500 to-pink-500",
    points: 0,
  },
};

export default function BadgeDisplay({ badges, size = "default", showLocked = true }) {
  const earnedBadgeIds = badges?.map(b => b.badge_id) || [];

  const getBadgeIcon = (BadgeIcon, color, isEarned) => {
    return (
      <div className={`w-full h-full rounded-full flex items-center justify-center ${
        isEarned ? `bg-gradient-to-br ${color}` : 'bg-gray-200'
      }`}>
        <BadgeIcon className={`${
          size === "small" ? "w-6 h-6" : size === "large" ? "w-12 h-12" : "w-8 h-8"
        } ${isEarned ? 'text-white' : 'text-gray-400'}`} />
      </div>
    );
  };

  const displayBadges = showLocked 
    ? Object.values(BADGE_DEFINITIONS)
    : Object.values(BADGE_DEFINITIONS).filter(badge => earnedBadgeIds.includes(badge.id));

  const sizeClasses = {
    small: "w-12 h-12",
    default: "w-16 h-16",
    large: "w-24 h-24",
  };

  return (
    <div className={`grid gap-4 ${
      size === "small" ? "grid-cols-6 md:grid-cols-8" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
    }`}>
      {displayBadges.map((badge) => {
        const isEarned = earnedBadgeIds.includes(badge.id);
        const BadgeIcon = badge.icon;
        const earnedBadge = badges?.find(b => b.badge_id === badge.id);

        return (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: size === "small" ? 1.1 : 1.05 }}
            className="group cursor-pointer"
          >
            <div className={`relative ${size === "small" ? '' : 'p-4 border rounded-lg'} ${
              isEarned 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                : 'bg-gray-50 border-gray-200'
            } transition-all hover:shadow-lg`}>
              <div className={`${sizeClasses[size]} mx-auto mb-2 relative`}>
                {getBadgeIcon(BadgeIcon, badge.color, isEarned)}
                {isEarned && size !== "small" && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
              </div>
              {size !== "small" && (
                <>
                  <h4 className={`text-center font-bold ${
                    isEarned ? 'text-gray-900' : 'text-gray-500'
                  } mb-1 text-sm`}>
                    {badge.name}
                  </h4>
                  <p className={`text-center text-xs ${
                    isEarned ? 'text-gray-600' : 'text-gray-400'
                  } line-clamp-2`}>
                    {badge.description}
                  </p>
                  {badge.points > 0 && (
                    <div className={`text-center mt-2 text-xs font-semibold ${
                      isEarned ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      +{badge.points} pts
                    </div>
                  )}
                  {earnedBadge && (
                    <div className="text-center mt-1 text-xs text-gray-500">
                      {new Date(earnedBadge.earned_date).toLocaleDateString()}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export { BADGE_DEFINITIONS };