import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Target,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LearningPathRecommendations({ path, courses, userProgress }) {
  if (!path || path.length === 0) return null;

  const getProgressForCourse = (courseId) => {
    const progress = userProgress.find(p => p.course_id === courseId);
    return progress?.completion_percentage || 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Your Personalized Learning Path</h3>
      </div>

      <div className="relative">
        {/* Path line */}
        <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-gradient-to-b from-purple-300 to-teal-300" />

        <div className="space-y-6">
          {path.map((courseId, index) => {
            const course = courses.find(c => c.id === courseId);
            if (!course) return null;

            const progress = getProgressForCourse(courseId);
            const isCompleted = progress === 100;
            const isInProgress = progress > 0 && progress < 100;
            const isNext = !isCompleted && index === path.findIndex(id => getProgressForCourse(id) < 100);

            return (
              <motion.div
                key={courseId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16"
              >
                {/* Step indicator */}
                <div className={`absolute left-0 top-4 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                  isCompleted
                    ? 'bg-green-500 border-green-300'
                    : isNext
                    ? 'bg-purple-500 border-purple-300 ring-4 ring-purple-100'
                    : isInProgress
                    ? 'bg-blue-500 border-blue-300'
                    : 'bg-gray-200 border-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">{index + 1}</span>
                  )}
                </div>

                <Card className={`${
                  isNext ? 'border-2 border-purple-500 shadow-lg' : isCompleted ? 'bg-green-50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-900">{course.title_en}</h4>
                          {isNext && (
                            <Badge className="bg-purple-100 text-purple-700">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Next Up
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-700">
                              Completed
                            </Badge>
                          )}
                          {isInProgress && !isNext && (
                            <Badge className="bg-blue-100 text-blue-700">
                              In Progress
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {course.description_en}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration_minutes} min
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {progress > 0 && progress < 100 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-600 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Link to={createPageUrl(`CoursePlayer?id=${courseId}`)}>
                      <Button 
                        size="sm" 
                        className={`w-full ${
                          isNext
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                            : isCompleted
                            ? 'bg-gray-300 text-gray-700'
                            : 'teal-gradient text-white'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review Course
                          </>
                        ) : isInProgress ? (
                          <>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Continue Learning
                          </>
                        ) : isNext ? (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Start This Course
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4 mr-2" />
                            View Course
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}