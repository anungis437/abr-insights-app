import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Award,
  BookOpen,
  Settings,
  Mail,
  Calendar,
  Trophy,
  Download,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setFormData({ full_name: currentUser.full_name || "" });
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => user ? base44.entities.Certificate.filter({ user_email: user.email }, '-issue_date') : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['all-progress', user?.email],
    queryFn: () => user ? base44.entities.Progress.filter({ user_email: user.email }) : [],
    enabled: !!user,
    initialData: [],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-profile'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
    },
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync(formData);
  };

  const completedCourses = progress.filter(p => p.completion_percentage === 100);
  const inProgressCourses = progress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100);
  const totalLearningHours = progress.reduce((sum, p) => {
    const course = courses.find(c => c.id === p.course_id);
    return sum + (course?.duration_minutes || 0);
  }, 0) / 60;

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 teal-gradient rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account and view your achievements</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 teal-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.full_name || "User"}
                </h2>
                <p className="text-gray-600 mb-4 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <Badge className="mb-4" variant="outline">
                  {user.role === "admin" ? "Administrator" : "Learner"}
                </Badge>
                <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Member since</span>
                    <span className="font-semibold">
                      {format(new Date(user.created_date), 'MMM yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Certificates</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{certificates.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-500" />
                    <span className="text-sm text-gray-600">Courses Completed</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{completedCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Learning Hours</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{totalLearningHours.toFixed(1)}h</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="info" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                  <Settings className="w-4 h-4 mr-2" />
                  Info
                </TabsTrigger>
                <TabsTrigger value="certificates">
                  <Award className="w-4 h-4 mr-2" />
                  Certificates
                </TabsTrigger>
                <TabsTrigger value="courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Courses
                </TabsTrigger>
              </TabsList>

              {/* Account Info Tab */}
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Account Information</CardTitle>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input value={user.email} disabled className="bg-gray-100" />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit" className="teal-gradient text-white">
                            Save Changes
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({ full_name: user.full_name || "" });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-600">Full Name</Label>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.full_name || "Not set"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Email Address</Label>
                          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Account Type</Label>
                          <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Member Since</Label>
                          <p className="text-lg font-semibold text-gray-900">
                            {format(new Date(user.created_date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certificates Tab */}
              <TabsContent value="certificates">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Certificates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {certificates.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No certificates earned yet</p>
                        <p className="text-sm text-gray-500">
                          Complete courses to earn professional certificates
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="p-6 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:shadow-lg transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="w-12 h-12 gold-gradient rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-gray-900">{cert.course_title_en}</h3>
                                    <p className="text-sm text-gray-600">
                                      Issued: {format(new Date(cert.issue_date), 'MMMM d, yyyy')}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-15">
                                  <Badge variant="outline" className="text-xs">
                                    Certificate #{cert.certificate_number}
                                  </Badge>
                                  {cert.completion_score && (
                                    <Badge className="ml-2 bg-green-100 text-green-800">
                                      Score: {cert.completion_score}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <div className="space-y-6">
                  {/* In Progress */}
                  {inProgressCourses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">In Progress ({inProgressCourses.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {inProgressCourses.map((prog) => {
                          const course = courses.find(c => c.id === prog.course_id);
                          if (!course) return null;
                          return (
                            <div key={prog.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900">{course.title_en}</h4>
                                <Badge>{prog.completion_percentage.toFixed(0)}%</Badge>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-teal-600 h-2 rounded-full transition-all"
                                  style={{ width: `${prog.completion_percentage}%` }}
                                />
                              </div>
                              <p className="text-sm text-gray-600">
                                Last accessed: {format(new Date(prog.last_accessed), 'MMM d, yyyy')}
                              </p>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Completed */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Completed ({completedCourses.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {completedCourses.length === 0 ? (
                        <p className="text-center py-8 text-gray-600">No completed courses yet</p>
                      ) : (
                        <div className="space-y-3">
                          {completedCourses.map((prog) => {
                            const course = courses.find(c => c.id === prog.course_id);
                            if (!course) return null;
                            return (
                              <div key={prog.id} className="p-4 border rounded-lg bg-green-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                      <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{course.title_en}</h4>
                                      <p className="text-sm text-gray-600">
                                        Completed: {format(new Date(prog.completed_date), 'MMM d, yyyy')}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className="bg-green-600 text-white">Completed</Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}