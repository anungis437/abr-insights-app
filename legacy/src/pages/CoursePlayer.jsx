import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Lock,
  BookOpen,
  Award,
  Home,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LessonContent from "../components/player/LessonContent";
import QuizPlayer from "../components/player/QuizPlayer";
import CertificateGenerator from "../components/player/CertificateGenerator";

export default function CoursePlayer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    loadUser();
  }, []);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.list();
      return courses.find(c => c.id === courseId);
    },
    enabled: !!courseId,
  });

  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order_index'),
    enabled: !!courseId,
    initialData: [],
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', courseId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const progressList = await base44.entities.Progress.filter({ 
        user_email: user.email, 
        course_id: courseId 
      });
      return progressList[0] || null;
    },
    enabled: !!user && !!courseId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, quizScore }) => {
      const completedLessons = [...(progress?.completed_lessons || [])];
      if (lessonId && !completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      const completionPercentage = (completedLessons.length / lessons.length) * 100;
      const quizScores = { ...(progress?.quiz_scores || {}), [lessonId]: quizScore };

      const progressData = {
        user_email: user.email,
        course_id: courseId,
        lesson_id: lessons[currentLessonIndex]?.id,
        completion_percentage: completionPercentage,
        completed_lessons: completedLessons,
        quiz_scores: quizScores,
        last_accessed: new Date().toISOString(),
        started_date: progress?.started_date || new Date().toISOString(),
      };

      if (completionPercentage === 100 && !progress?.completed_date) {
        progressData.completed_date = new Date().toISOString();
        progressData.certificate_issued = true;
      }

      if (progress?.id) {
        return await base44.entities.Progress.update(progress.id, progressData);
      } else {
        return await base44.entities.Progress.create(progressData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });

  const currentLesson = lessons[currentLessonIndex];
  const isLessonCompleted = progress?.completed_lessons?.includes(currentLesson?.id);
  const courseCompleted = progress?.completion_percentage === 100;

  const handleLessonComplete = async () => {
    if (currentLesson?.quiz_questions && currentLesson.quiz_questions.length > 0) {
      setShowQuiz(true);
    } else {
      await updateProgressMutation.mutateAsync({ lessonId: currentLesson.id, quizScore: null });
      handleNextLesson();
    }
  };

  const handleQuizComplete = async (score) => {
    setQuizScore(score);
    await updateProgressMutation.mutateAsync({ lessonId: currentLesson.id, quizScore: score });
    setShowQuiz(false);
    
    if (currentLessonIndex === lessons.length - 1) {
      setShowCertificate(true);
    } else {
      handleNextLesson();
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setShowQuiz(false);
    } else if (courseCompleted) {
      setShowCertificate(true);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setShowQuiz(false);
    }
  };

  if (!user || courseLoading || lessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
            <Link to={createPageUrl("TrainingHub")}>
              <Button className="mt-4 teal-gradient text-white">
                Back to Training Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCertificate) {
    return (
      <CertificateGenerator
        course={course}
        user={user}
        onClose={() => {
          setShowCertificate(false);
          navigate(createPageUrl("TrainingHub"));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col fixed lg:relative h-screen z-40"
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white line-clamp-2">{course.title_en}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-teal-400 font-semibold">
                    {progress?.completion_percentage?.toFixed(0) || 0}%
                  </span>
                </div>
                <Progress value={progress?.completion_percentage || 0} className="h-2" />
                <p className="text-xs text-gray-500">
                  {progress?.completed_lessons?.length || 0} of {lessons.length} lessons completed
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {lessons.map((lesson, index) => {
                  const isCompleted = progress?.completed_lessons?.includes(lesson.id);
                  const isCurrent = index === currentLessonIndex;
                  const isLocked = index > 0 && !progress?.completed_lessons?.includes(lessons[index - 1]?.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => !isLocked && setCurrentLessonIndex(index)}
                      disabled={isLocked}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrent 
                          ? 'bg-teal-600 text-white' 
                          : isCompleted
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : isLocked
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <div className={`w-5 h-5 rounded-full border-2 ${
                              isCurrent ? 'border-white' : 'border-gray-500'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium mb-1 opacity-75">
                            Lesson {index + 1}
                          </div>
                          <div className="text-sm font-semibold line-clamp-2">
                            {lesson.title_en}
                          </div>
                          {lesson.duration_minutes && (
                            <div className="text-xs opacity-75 mt-1">
                              {lesson.duration_minutes} min
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 space-y-2">
              <Link to={createPageUrl("TrainingHub")}>
                <Button variant="outline" className="w-full text-gray-300 border-gray-600 hover:bg-gray-700">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Courses
                </Button>
              </Link>
              {courseCompleted && (
                <Button 
                  onClick={() => setShowCertificate(true)}
                  className="w-full gold-gradient text-gray-900"
                >
                  <Award className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-400"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div>
                <Badge variant="outline" className="text-teal-400 border-teal-400 mb-2">
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </Badge>
                <h1 className="text-xl font-bold text-white">
                  {currentLesson?.title_en}
                </h1>
              </div>
            </div>
            {isLessonCompleted && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Lesson Content Area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {showQuiz ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <QuizPlayer
                  questions={currentLesson.quiz_questions}
                  onComplete={handleQuizComplete}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`lesson-${currentLessonIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <LessonContent lesson={currentLesson} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Bar */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousLesson}
              disabled={currentLessonIndex === 0 || showQuiz}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {!showQuiz && (
              <Button
                onClick={handleLessonComplete}
                disabled={isLessonCompleted}
                className="teal-gradient text-white"
              >
                {isLessonCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : currentLesson?.quiz_questions?.length > 0 ? (
                  <>
                    Take Quiz
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Mark Complete
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleNextLesson}
              disabled={currentLessonIndex === lessons.length - 1 || !isLessonCompleted || showQuiz}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}