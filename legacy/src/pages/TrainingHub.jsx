import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  GraduationCap, 
  Clock, 
  Award, 
  Search,
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  TrendingUp,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Progress } from "@/components/ui/progress";

export default function TrainingHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
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

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('order_index'),
    initialData: [],
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => user ? base44.entities.Progress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === "" || 
      course.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getCourseProgress = (courseId) => {
    const progress = userProgress.find(p => p.course_id === courseId);
    return progress?.completion_percentage || 0;
  };

  const getCompletedCount = () => {
    return userProgress.filter(p => p.completion_percentage === 100).length;
  };

  const getTotalHours = () => {
    return courses.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / 60;
  };

  const canAccessCourse = (course) => {
    if (!user) return course.tier_required === "Free";
    if (user.role === "admin") return true;
    // In real implementation, check user subscription tier
    return true;
  };

  const categories = [...new Set(courses.map(c => c.category))];
  const levels = ["Introductory", "Intermediate", "Advanced", "Specialized"];

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
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Training Hub</h1>
              <p className="text-gray-600">Evidence-based courses to combat anti-Black racism</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-teal-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Courses</div>
                </div>
                <BookOpen className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">{getCompletedCount()}</div>
                  <div className="text-sm text-gray-600 mt-1">Completed</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{getTotalHours().toFixed(0)}h</div>
                  <div className="text-sm text-gray-600 mt-1">Content Hours</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">
                    {userProgress.filter(p => p.certificate_issued).length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Certificates</div>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Find Your Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Continue Learning Section */}
        {userProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              Continue Learning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProgress
                .filter(p => p.completion_percentage > 0 && p.completion_percentage < 100)
                .slice(0, 2)
                .map(progress => {
                  const course = courses.find(c => c.id === progress.course_id);
                  if (!course) return null;
                  return (
                    <Card key={course.id} className="hover:shadow-xl transition-all border-2 border-teal-200">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title_en}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 teal-gradient rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-12 h-12 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title_en}</h3>
                            <div className="space-y-2">
                              <Progress value={progress.completion_percentage} className="h-2" />
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{progress.completion_percentage.toFixed(0)}% Complete</span>
                                <Link to={createPageUrl(`CoursePlayer?id=${course.id}`)}>
                                  <Button size="sm" className="teal-gradient text-white">
                                    <Play className="w-4 h-4 mr-1" />
                                    Continue
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        {/* Course Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === "all" ? "All Courses" : selectedCategory}
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => {
                const progress = getCourseProgress(course.id);
                const hasAccess = canAccessCourse(course);
                const isCompleted = progress === 100;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-all group cursor-pointer">
                      <div className="relative">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title_en}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-48 teal-gradient rounded-t-lg flex items-center justify-center">
                            <GraduationCap className="w-20 h-20 text-white opacity-50" />
                          </div>
                        )}
                        {course.is_featured && (
                          <Badge className="absolute top-3 right-3 gold-gradient text-gray-900 border-0">
                            Featured
                          </Badge>
                        )}
                        {isCompleted && (
                          <div className="absolute top-3 left-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {!hasAccess && (
                          <div className="absolute inset-0 bg-black/60 rounded-t-lg flex items-center justify-center">
                            <Lock className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {course.duration_minutes} min
                          </Badge>
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {course.title_en}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {course.description_en}
                        </p>

                        {progress > 0 && (
                          <div className="mb-4">
                            <Progress value={progress} className="h-2 mb-1" />
                            <p className="text-xs text-gray-500">{progress.toFixed(0)}% complete</p>
                          </div>
                        )}

                        <Link to={createPageUrl(`CoursePlayer?id=${course.id}`)}>
                          <Button 
                            className={`w-full ${hasAccess ? 'teal-gradient text-white' : 'bg-gray-300 text-gray-600'}`}
                            disabled={!hasAccess}
                          >
                            {!hasAccess ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Upgrade to Access
                              </>
                            ) : progress > 0 ? (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Continue Course
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Course
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
          )}
        </div>
      </div>
    </div>
  );
}