
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  UserPlus,
  Settings,
  BarChart3,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";
import OnboardingChecklist from "../components/shared/OnboardingChecklist";
import OnboardingTour from "../components/shared/OnboardingTour";

export default function OrgDashboard() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const orgs = await base44.entities.Organization.list();
      return orgs.filter(org => org.admin_email === user.email || org.member_emails?.includes(user.email));
    },
    enabled: !!user,
    initialData: [],
  });

  useEffect(() => {
    if (organizations.length > 0) {
      setOrganization(organizations[0]);
    }
  }, [organizations]);

  const { data: allProgress = [] } = useQuery({
    queryKey: ['org-progress', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const memberEmails = [...(organization.member_emails || []), organization.admin_email];
      const progress = await base44.entities.Progress.list();
      return progress.filter(p => memberEmails.includes(p.user_email));
    },
    enabled: !!organization,
    initialData: [],
  });

  const { data: allCertificates = [] } = useQuery({
    queryKey: ['org-certificates', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const memberEmails = [...(organization.member_emails || []), organization.admin_email];
      const certs = await base44.entities.Certificate.list();
      return certs.filter(c => memberEmails.includes(c.user_email));
    },
    enabled: !!organization,
    initialData: [],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-org'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  const { data: onboarding } = useQuery({
    queryKey: ['org-onboarding', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const onboardingList = await base44.entities.Onboarding.filter({ user_email: user.email });
      return onboardingList[0] || null;
    },
    enabled: !!user,
  });

  const isNewAdmin = user && organization && (
    !onboarding?.role_specific_completed?.admin ||
    (organization.created_date && (new Date() - new Date(organization.created_date)) < 7 * 24 * 60 * 60 * 1000)
  );

  const shouldShowAdminOnboarding = isNewAdmin && !onboarding?.role_specific_completed?.admin && !onboarding?.dismissed;

  useEffect(() => {
    if (shouldShowAdminOnboarding) {
      setShowOnboarding(true);
    }
  }, [shouldShowAdminOnboarding]);

  const adminOnboardingSteps = [
    {
      id: 'admin-welcome',
      title: 'Welcome, Administrator! 👋',
      icon: <Building2 className="w-6 h-6 text-white" />,
      description: "As an organization admin, you have powerful tools to manage your team's anti-racism training. Let's explore what you can do.",
      highlights: [
        'Invite and manage team members',
        'Track team progress and compliance',
        'View detailed analytics and reports',
        'Customize training paths'
      ],
    },
    {
      id: 'org-dashboard',
      title: 'Your Organization Dashboard',
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      description: 'Get a complete overview of your team\'s progress, completion rates, and certificate achievements in one place.',
      highlights: [
        'Real-time team metrics',
        'License utilization tracking',
        'Compliance status monitoring',
        'Recent certifications feed'
      ],
    },
    {
      id: 'team-management',
      title: 'Manage Your Team',
      icon: <Users className="w-6 h-6 text-white" />,
      description: 'Invite team members, assign seats, and track individual progress. Keep your team engaged and on track.',
      highlights: [
        'Invite members via email',
        'Monitor individual progress',
        'View seat availability',
        'Export team reports'
      ],
      action: {
        description: 'Ready to invite your first team member?',
        button: {
          text: 'Go to Team Management',
          onClick: () => {
            navigate(createPageUrl('TeamManagement'));
          }
        }
      }
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      description: 'Access detailed analytics on team performance, engagement patterns, and identify learners who need support.',
      highlights: [
        'Multi-dimensional analysis',
        'Course completion breakdowns',
        'Learner segmentation',
        'Benchmark comparisons'
      ],
      action: {
        description: 'Explore your analytics dashboard',
        button: {
          text: 'View Analytics',
          onClick: () => {
            navigate(createPageUrl('Analytics'));
          }
        }
      }
    },
    {
      id: 'resources',
      title: 'Resource Library',
      icon: <FileText className="w-6 h-6 text-white" />,
      description: 'Access templates, guides, and toolkits to support your anti-racism initiatives.',
      highlights: [
        'Investigation templates',
        'Policy frameworks',
        'Training toolkits',
        'Best practice guides'
      ],
    },
    {
      id: 'admin-complete',
      title: "You're Ready to Lead! 🚀",
      icon: <Award className="w-6 h-6 text-white" />,
      description: "You now have the tools to drive meaningful change in your organization. Start by inviting your team and tracking their progress!",
      highlights: [
        'Invite team members first',
        'Set up regular check-ins',
        'Review analytics weekly',
        'Contact support anytime'
      ]
    }
  ];

  const adminChecklistSteps = [
    {
      id: 'invite-first-member',
      title: 'Invite Your First Team Member',
      description: 'Add members to start tracking team progress',
      icon: <UserPlus className="w-5 h-5 text-teal-600" />,
      estimatedTime: 3,
      priority: 'high'
    },
    {
      id: 'explore-analytics',
      title: 'Explore Team Analytics',
      description: 'View detailed insights on team performance',
      icon: <BarChart3 className="w-5 h-5 text-teal-600" />,
      estimatedTime: 5,
      priority: 'high'
    },
    {
      id: 'download-resources',
      title: 'Download Resources',
      description: 'Get templates and toolkits for your organization',
      icon: <FileText className="w-5 h-5 text-teal-600" />,
      estimatedTime: 3,
      priority: 'medium'
    },
    {
      id: 'review-settings',
      title: 'Review Organization Settings',
      description: 'Customize notifications and preferences',
      icon: <Settings className="w-5 h-5 text-teal-600" />,
      estimatedTime: 5,
      priority: 'low'
    }
  ];

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
      queryClient.invalidateQueries({ queryKey: ['org-onboarding'] });
    },
  });

  const handleAdminTourComplete = async () => {
    await updateOnboardingMutation.mutateAsync({
      role_specific_completed: {
        ...onboarding?.role_specific_completed,
        admin: true
      }
    });
    setShowOnboarding(false);
  };

  const handleChecklistStepClick = (stepId) => {
    if (stepId === 'invite-first-member') {
      navigate(createPageUrl('TeamManagement'));
    } else if (stepId === 'explore-analytics') {
      navigate(createPageUrl('Analytics'));
    } else if (stepId === 'download-resources') {
      // Assuming a page for resources exists, if not, create one or link to external
      // For now, let's navigate to home or a placeholder.
      navigate(createPageUrl('Resources')); 
    } else if (stepId === 'review-settings') {
      navigate(createPageUrl('OrgSettings'));
    }
    updateOnboardingMutation.mutate({
      checklist_completed_steps: [...(onboarding?.checklist_completed_steps || []), stepId]
    });
  };

  const handleDismissChecklist = async () => {
    await updateOnboardingMutation.mutateAsync({
      dismissed: true,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Organization Found</h2>
            <p className="text-gray-600 mb-6">
              You're not part of any organization yet. Contact your administrator or upgrade to Enterprise.
            </p>
            <Link to={createPageUrl("Home")}>
              <Button className="teal-gradient text-white">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = organization?.admin_email === user.email;
  const memberEmails = [...(organization.member_emails || []), organization.admin_email];
  const totalMembers = memberEmails.length;
  const seatsAvailable = organization.seat_count - totalMembers;
  const completedCourses = allProgress.filter(p => p.completion_percentage === 100).length;
  const totalCertificates = allCertificates.length;
  const avgCompletion = allProgress.length > 0 
    ? allProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / allProgress.length 
    : 0;

  // Team progress by course
  const courseProgress = courses.map(course => {
    const courseProgressRecords = allProgress.filter(p => p.course_id === course.id);
    const avgProgress = courseProgressRecords.length > 0
      ? courseProgressRecords.reduce((sum, p) => sum + p.completion_percentage, 0) / courseProgressRecords.length
      : 0;
    return {
      name: course.title_en.substring(0, 25) + (course.title_en.length > 25 ? "..." : ""),
      progress: avgProgress.toFixed(0),
      enrolled: courseProgressRecords.length,
    };
  }).slice(0, 6);

  // Engagement data
  const engagementData = [
    { name: "Active Learners", value: allProgress.filter(p => p.completion_percentage > 0).length },
    { name: "Not Started", value: totalMembers - allProgress.filter(p => p.completion_percentage > 0).length },
  ];

  const COLORS = ['#0d9488', '#e5e7eb'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      {/* Admin Onboarding Tour */}
      {showOnboarding && shouldShowAdminOnboarding && (
        <OnboardingTour
          user={user}
          onboarding={onboarding}
          steps={adminOnboardingSteps}
          onComplete={handleAdminTourComplete}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-gray-600">Organization Dashboard</p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-3">
                <Link to={createPageUrl("TeamManagement")}>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </Link>
                <Link to={createPageUrl("OrgSettings")}>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Admin Onboarding Checklist */}
        {isAdmin && isNewAdmin && !onboarding?.role_specific_completed?.admin && !onboarding?.dismissed && (
          <div className="mb-8">
            <OnboardingChecklist
              user={user}
              onboarding={onboarding}
              steps={adminChecklistSteps}
              onStepClick={handleChecklistStepClick}
              onDismiss={handleDismissChecklist}
              onComplete={handleAdminTourComplete} // Complete the tour if checklist is completed.
            />
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{totalMembers}</div>
                  <div className="text-sm text-gray-600 mt-1">Team Members</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {seatsAvailable} seats available
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-700">{completedCourses}</div>
                  <div className="text-sm text-gray-600 mt-1">Courses Completed</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-700">{totalCertificates}</div>
                  <div className="text-sm text-gray-600 mt-1">Certificates Issued</div>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{avgCompletion.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600 mt-1">Avg Completion</div>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Status */}
        {isAdmin && (
          <Card className="mb-8 border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-indigo-100 text-indigo-700">
                      {organization.license_type}
                    </Badge>
                    {organization.is_active ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">Inactive</Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Seat Usage</span>
                        <span className="font-semibold text-gray-900">
                          {totalMembers} / {organization.seat_count}
                        </span>
                      </div>
                      <Progress value={(totalMembers / organization.seat_count) * 100} className="h-2" />
                    </div>
                    {organization.license_end_date && (
                      <p className="text-sm text-gray-600">
                        License expires: {format(new Date(organization.license_end_date), 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                {seatsAvailable <= 2 && (
                  <div className="ml-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600 mb-1" />
                    <p className="text-xs text-orange-700">Only {seatsAvailable} seats left</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Team Course Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courseProgress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={courseProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#0d9488" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No course activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={engagementData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {engagementData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    {engagementData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Completions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recent Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allCertificates.length > 0 ? (
                  <div className="space-y-3">
                    {allCertificates.slice(0, 5).map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{cert.user_name}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{cert.course_title_en}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {cert.completion_score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No certifications yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to={createPageUrl("TeamManagement")}>
                    <Button variant="outline" className="w-full justify-start">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Team Members
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Analytics")}>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Compliance Status */}
            <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
              <CardHeader>
                <CardTitle className="text-lg">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Team Training Completion</span>
                      <span className="font-semibold text-gray-900">{avgCompletion.toFixed(0)}%</span>
                    </div>
                    <Progress value={avgCompletion} className="h-2" />
                  </div>
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Certified Members</span>
                      <span className="font-semibold text-gray-900">
                        {allCertificates.length} / {totalMembers}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Learners</span>
                      <span className="font-semibold text-gray-900">
                        {engagementData[0]?.value || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-600">
                  Our team is here to support your organization's anti-racism training journey.
                </p>
                <Button className="w-full teal-gradient text-white">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full">
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
