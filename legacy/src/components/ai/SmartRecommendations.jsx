import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  BookOpen,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SmartRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-recommendations'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress-recommendations', user?.email],
    queryFn: () => user ? base44.entities.Progress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['cases-recommendations'],
    queryFn: () => base44.entities.TribunalCase.list(),
    initialData: [],
  });

  const generateRecommendations = async () => {
    setIsLoading(true);
    try {
      const completedCourses = progress
        .filter(p => p.completion_percentage === 100)
        .map(p => courses.find(c => c.id === p.course_id))
        .filter(Boolean);

      const inProgressCourses = progress
        .filter(p => p.completion_percentage > 0 && p.completion_percentage < 100)
        .map(p => courses.find(c => c.id === p.course_id))
        .filter(Boolean);

      const prompt = `As an AI learning advisor for anti-Black racism education, generate personalized recommendations for this learner:

LEARNER PROFILE:
- Name: ${user.full_name || user.email}
- Courses Completed: ${completedCourses.map(c => c.title_en).join(', ') || 'None'}
- Courses In Progress: ${inProgressCourses.map(c => c.title_en).join(', ') || 'None'}
- Total Courses Available: ${courses.length}
- Total Cases Available: ${cases.length}

AVAILABLE COURSES:
${courses.slice(0, 12).map(c => `- ${c.title_en} (${c.level}, ${c.category})`).join('\n')}

Please provide recommendations in the following JSON format:
{
  "next_courses": [
    {
      "course_name": "Course Title",
      "reason": "Why this course is recommended",
      "priority": "High/Medium/Low"
    }
  ],
  "learning_path": "Suggested progression path description",
  "cases_to_review": ["Case focus area 1", "Case focus area 2"],
  "skill_gaps": ["Identified gap 1", "Identified gap 2"],
  "estimated_completion_time": "Time estimate"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            next_courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_name: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            learning_path: { type: "string" },
            cases_to_review: { type: "array", items: { type: "string" } },
            skill_gaps: { type: "array", items: { type: "string" } },
            estimated_completion_time: { type: "string" }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && courses.length > 0) {
      generateRecommendations();
    }
  }, [user, courses.length]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">Please sign in to get personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your learning journey...</p>
          <p className="text-sm text-gray-500 mt-2">Generating personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Personalized Learning Path</h2>
          <p className="text-gray-600">AI-powered recommendations based on your progress</p>
        </div>
      </div>

      {/* Learning Path Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{recommendations.learning_path}</p>
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Estimated completion: {recommendations.estimated_completion_time}</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            Recommended Next Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.next_courses?.map((rec, index) => {
            const course = courses.find(c => c.title_en === rec.course_name);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{rec.course_name}</h3>
                      <Badge className={
                        rec.priority === "High" 
                          ? "bg-red-100 text-red-700"
                          : rec.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }>
                        {rec.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                  </div>
                </div>
                {course && (
                  <Link to={createPageUrl(`CoursePlayer?id=${course.id}`)}>
                    <Button size="sm" className="teal-gradient text-white">
                      Start Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Skill Gaps */}
      {recommendations.skill_gaps && recommendations.skill_gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.skill_gaps.map((gap, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-700 text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{gap}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Case Studies to Review */}
      {recommendations.cases_to_review && recommendations.cases_to_review.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recommended Case Studies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Review these types of cases to reinforce your learning:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {recommendations.cases_to_review.map((caseType, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">{caseType}</p>
                </div>
              ))}
            </div>
            <Link to={createPageUrl("DataExplorer")}>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Browse Case Library
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Regenerate Button */}
      <div className="text-center">
        <Button
          onClick={generateRecommendations}
          variant="outline"
          disabled={isLoading}
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Regenerate Recommendations
        </Button>
      </div>
    </div>
  );
}