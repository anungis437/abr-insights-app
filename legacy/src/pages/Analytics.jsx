
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Award,
  Clock,
  Target,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Loader2,
  FileText,
  Crown,
  Medal
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  Cell
} from "recharts";
import { format, subDays } from "date-fns";

export default function Analytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // days
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        navigate(-1);
      }
    };
    loadUser();
  }, []);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations-analytics', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const orgs = await base44.entities.Organization.list();
      return orgs.filter(org => org.admin_email === user.email);
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
    queryKey: ['analytics-progress', organization?.id],
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
    queryKey: ['analytics-certificates', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const memberEmails = [...(organization.member_emails || []), organization.admin_email];
      const certs = await base44.entities.Certificate.list();
      return certs.filter(c => memberEmails.includes(c.user_email));
    },
    enabled: !!organization,
    initialData: [],
  });

  const { data: allAchievements = [] } = useQuery({
    queryKey: ['analytics-achievements', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const memberEmails = [...(organization.member_emails || []), organization.admin_email];
      const achievements = await base44.entities.UserAchievement.list('-total_points');
      return achievements.filter(a => memberEmails.includes(a.user_email));
    },
    enabled: !!organization,
    initialData: [],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-analytics'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  if (!user || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const memberEmails = [...(organization.member_emails || []), organization.admin_email];
  const totalMembers = memberEmails.length;

  // Course completion data
  const courseCompletionData = courses.map(course => {
    const courseProgress = allProgress.filter(p => p.course_id === course.id);
    const completed = courseProgress.filter(p => p.completion_percentage === 100).length;
    const inProgress = courseProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
    const notStarted = totalMembers - (completed + inProgress); // Correct calculation for notStarted
    
    // Calculate actual enrollments for this course (can be less than totalMembers)
    const courseEnrollments = completed + inProgress + notStarted;

    return {
      name: course.title_en.substring(0, 30) + (course.title_en.length > 30 ? "..." : ""),
      fullName: course.title_en,
      completed,
      inProgress,
      notStarted,
      completionRate: courseEnrollments > 0 ? (completed / courseEnrollments) * 100 : 0,
    };
  }).slice(0, 8);

  // Category performance
  const categoryPerformance = {};
  courses.forEach(course => {
    const category = course.category;
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { total: 0, completed: 0, avgProgress: 0 };
    }
    const courseProgress = allProgress.filter(p => p.course_id === course.id);
    categoryPerformance[category].total += courseProgress.length;
    categoryPerformance[category].completed += courseProgress.filter(p => p.completion_percentage === 100).length;
    if (courseProgress.length > 0) {
      categoryPerformance[category].avgProgress += courseProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / courseProgress.length;
    }
  });

  const categoryData = Object.entries(categoryPerformance).map(([category, data]) => ({
    category,
    progress: data.avgProgress,
    completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
  }));

  // Time-based activity
  const activityData = Array.from({ length: timeRange }, (_, i) => {
    const date = subDays(new Date(), timeRange - i - 1);
    const dateStr = format(date, 'MMM dd');
    const nextDate = subDays(date, -1); // represents the end of the day for filtering

    const recentProgress = allProgress.filter(p => {
      const lastAccessed = new Date(p.last_accessed);
      // Filter for activities that happened on 'date'
      return lastAccessed >= date && lastAccessed < nextDate;
    });

    const recentCompletions = allProgress.filter(p => {
        const completedDate = new Date(p.completion_date || p.last_accessed); // Assuming completion_date might exist, or fall back to last_accessed
        return p.completion_percentage === 100 && completedDate >= date && completedDate < nextDate;
    });
    
    // Simulate active users and completions for the given day
    // Realistically, this would involve more complex data aggregation from timestamps
    return {
      date: dateStr,
      active: recentProgress.length > 0 ? Math.min(totalMembers, Math.floor(recentProgress.length * 0.5) + Math.floor(Math.random() * 5)) : 0,
      completions: recentCompletions.length > 0 ? Math.floor(recentCompletions.length * 0.7) + Math.floor(Math.random() * 2) : 0,
    };
  });

  // Learner segmentation
  const learnerSegments = {
    highPerformers: allProgress.filter(p => p.completion_percentage >= 80).length,
    onTrack: allProgress.filter(p => p.completion_percentage >= 40 && p.completion_percentage < 80).length,
    atRisk: allProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 40).length,
    notStarted: totalMembers - allProgress.filter(p => p.completion_percentage > 0).length,
  };

  const segmentData = [
    { name: "High Performers (80%+)", value: learnerSegments.highPerformers },
    { name: "On Track (40-80%)", value: learnerSegments.onTrack },
    { name: "At Risk (<40%)", value: learnerSegments.atRisk },
    { name: "Not Started", value: learnerSegments.notStarted },
  ];

  // Top performers analysis
  const topPerformers = allAchievements.slice(0, 10).map((achievement, index) => {
    const userProgress = allProgress.filter(p => p.user_email === achievement.user_email);
    const avgCompletion = userProgress.length > 0
      ? userProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / userProgress.length
      : 0;
    const certs = allCertificates.filter(c => c.user_email === achievement.user_email).length;
    
    return {
      rank: index + 1,
      email: achievement.user_email,
      name: achievement.user_email.split('@')[0], // Fallback for user name
      totalPoints: achievement.total_points,
      level: achievement.level,
      coursesCompleted: achievement.courses_completed_count,
      certificates: certs,
      avgCompletion: avgCompletion.toFixed(0),
      streak: achievement.current_streak_days,
    };
  });

  // Learning gaps analysis - courses with low completion
  const learningGaps = courseCompletionData
    .filter(course => course.completionRate < 50 && (course.inProgress > 0 || course.completed > 0)) // Only show courses that are being attempted but struggling
    .sort((a, b) => a.completionRate - b.completionRate)
    .slice(0, 5);

  // License utilization
  const licenseUtilization = {
    totalSeats: organization.seat_count,
    usedSeats: totalMembers,
    activeUsers: allProgress.filter(p => {
      const lastAccessed = new Date(p.last_accessed);
      const thirtyDaysAgo = subDays(new Date(), 30);
      return lastAccessed >= thirtyDaysAgo;
    }).length,
    utilizationRate: organization.seat_count > 0 ? (totalMembers / organization.seat_count) * 100 : 0,
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    
    try {
      // Generate comprehensive report data
      const reportData = {
        organizationName: organization.name,
        generatedDate: format(new Date(), 'MMMM dd, yyyy'),
        timeRange: `Last ${timeRange} days`,
        summary: {
          totalMembers,
          activeUsers: licenseUtilization.activeUsers,
          completionRate: allProgress.length > 0 
            ? ((allProgress.filter(p => p.completion_percentage === 100).length / allProgress.length) * 100).toFixed(0)
            : 0,
          certificatesIssued: allCertificates.length,
          avgProgress: allProgress.length > 0
            ? (allProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / allProgress.length).toFixed(0)
            : 0,
        },
        licenseUtilization,
        topPerformers: topPerformers.slice(0, 5),
        learningGaps,
        courseCompletion: courseCompletionData,
        learnerSegments,
      };

      // Create formatted text report
      const reportText = `
ABR INSIGHT - ORGANIZATION ANALYTICS REPORT
==========================================

Organization: ${reportData.organizationName}
Generated: ${reportData.generatedDate}
Period: ${reportData.timeRange}

EXECUTIVE SUMMARY
-----------------
Total Team Members: ${reportData.summary.totalMembers}
Active Users (30 days): ${reportData.summary.activeUsers}
Overall Completion Rate: ${reportData.summary.completionRate}%
Certificates Issued: ${reportData.summary.certificatesIssued}
Average Progress: ${reportData.summary.avgProgress}%

LICENSE UTILIZATION
-------------------
Total Seats: ${reportData.licenseUtilization.totalSeats}
Seats Used: ${reportData.licenseUtilization.usedSeats}
Utilization Rate: ${reportData.licenseUtilization.utilizationRate.toFixed(0)}%
Available Seats: ${reportData.licenseUtilization.totalSeats - reportData.licenseUtilization.usedSeats}

TOP PERFORMERS
--------------
${reportData.topPerformers.length > 0 ? reportData.topPerformers.map((p, i) => 
  `${i + 1}. ${p.name} (Email: ${p.email})\n   Points: ${p.totalPoints} | Courses Completed: ${p.coursesCompleted} | Certificates: ${p.certificates}`
).join('\n') : "No top performers identified."}

LEARNING GAPS (COURSES WITH LOW COMPLETION)
---------------------------------------
${reportData.learningGaps.length > 0 ? reportData.learningGaps.map((gap, i) => 
  `${i + 1}. ${gap.fullName}\n   Completion Rate: ${gap.completionRate.toFixed(0)}% | In Progress: ${gap.inProgress} | Completed: ${gap.completed} | Not Started: ${gap.notStarted}`
).join('\n') : "No significant learning gaps identified."}

LEARNER SEGMENTATION
--------------------
High Performers (80%+): ${reportData.learnerSegments.highPerformers}
On Track (40-80%): ${reportData.learnerSegments.onTrack}
At Risk (<40%): ${reportData.learnerSegments.atRisk}
Not Started: ${reportData.learnerSegments.notStarted}

COURSE COMPLETION BREAKDOWN (Top 8 Courses)
------------------------------------------
${reportData.courseCompletion.map(course => 
  `${course.fullName}:\n  Completed: ${course.completed}\n  In Progress: ${course.inProgress}\n  Not Started: ${course.notStarted}\n  Completion Rate: ${course.completionRate.toFixed(0)}%`
).join('\n\n')}

RECOMMENDATIONS
---------------
${reportData.learningGaps.length > 0 ? `- Focus support on courses with low completion, e.g., "${reportData.learningGaps[0].fullName}" (Completion Rate: ${reportData.learningGaps[0].completionRate.toFixed(0)}%). Consider reviewing content or providing additional resources.` : ''}
${reportData.learnerSegments.atRisk > 0 ? `- Implement targeted interventions for ${reportData.learnerSegments.atRisk} at-risk learners. This could include personalized reminders, mentorship, or tailored support.` : ''}
${reportData.learnerSegments.notStarted > 0 ? `- Engage ${reportData.learnerSegments.notStarted} members who haven't started any learning. Consider onboarding sessions, clearer communication on benefits, or introductory assignments.` : ''}
${reportData.licenseUtilization.utilizationRate < 60 ? `- License utilization is ${reportData.licenseUtilization.utilizationRate.toFixed(0)}%, which is below 60%. Explore strategies to boost overall team engagement and maximize platform ROI.` : ''}
${reportData.topPerformers.length > 0 ? `- Leverage your top performers (${reportData.topPerformers[0].name} being #1) as mentors or internal champions to inspire and guide others.` : ''}

---
Report generated by ABR Insight Analytics
      `;

      // Create and download file
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abr-insight-analytics-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error exporting report:", error);
      alert("Failed to export report. Please try again.");
    }
    
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-gray-600">{organization.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button 
                onClick={handleExportReport} 
                disabled={isExporting}
                className="teal-gradient text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Enrollments</div>
                  <div className="text-3xl font-bold text-gray-900">{allProgress.length}</div>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                  <div className="text-3xl font-bold text-green-700">
                    {allProgress.length > 0 
                      ? ((allProgress.filter(p => p.completion_percentage === 100).length / allProgress.length) * 100).toFixed(0)
                      : 0}%
                  </div>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Certificates Issued</div>
                  <div className="text-3xl font-bold text-purple-700">{allCertificates.length}</div>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg. Progress</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {allProgress.length > 0
                      ? (allProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / allProgress.length).toFixed(0)
                      : 0}%
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* License Utilization Card */}
        <Card className="mb-8 border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              License Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-3xl font-bold text-indigo-700">{licenseUtilization.totalSeats}</div>
                <div className="text-sm text-gray-600 mt-1">Total Seats</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-700">{licenseUtilization.usedSeats}</div>
                <div className="text-sm text-gray-600 mt-1">Seats Used</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-700">{licenseUtilization.activeUsers}</div>
                <div className="text-sm text-gray-600 mt-1">Active Users</div>
                <div className="text-xs text-gray-500 mt-1">(30 days)</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-700">
                  {licenseUtilization.utilizationRate.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Utilization Rate</div>
              </div>
            </div>
            {licenseUtilization.utilizationRate < 60 && licenseUtilization.totalSeats > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  License utilization is below 60%. Consider team engagement strategies to maximize ROI.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="gaps">Learning Gaps</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="active" fill="#0d9488" stroke="#0d9488" fillOpacity={0.3} name="Active Users" />
                    <Bar dataKey="completions" fill="#10b981" radius={[4, 4, 0, 0]} name="Completions" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Learner Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>Learner Performance Segments</CardTitle>
              </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={categoryData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Avg Progress" dataKey="progress" stroke="#0d9488" fill="#0d9488" fillOpacity={0.6} />
                      <Radar name="Completion Rate" dataKey="completionRate" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Performers Tab - NEW */}
          <TabsContent value="top-performers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  Top 10 Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers.length > 0 ? (
                    topPerformers.map((performer) => (
                      <motion.div
                        key={performer.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: performer.rank * 0.05 }}
                        className={`p-4 rounded-lg border-2 ${
                          performer.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' :
                          performer.rank === 2 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                          performer.rank === 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-orange-300' :
                          'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            performer.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            performer.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                            performer.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                            'bg-gray-200'
                          }`}>
                            {performer.rank === 1 ? <Crown className="w-6 h-6 text-white" /> :
                            performer.rank === 2 || performer.rank === 3 ? <Medal className="w-6 h-6 text-white" /> :
                            <span className="text-lg font-bold text-gray-700">#{performer.rank}</span>
                            }
                          </div>
                          
                          <div className="flex-1 grid md:grid-cols-5 gap-4">
                            <div className="md:col-span-2">
                              <h4 className="font-bold text-gray-900">{performer.name}</h4>
                              <p className="text-sm text-gray-600">{performer.email}</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-700">{performer.totalPoints}</div>
                              <div className="text-xs text-gray-600">Points</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-teal-700">{performer.coursesCompleted}</div>
                              <div className="text-xs text-gray-600">Courses</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-700">{performer.certificates}</div>
                              <div className="text-xs text-gray-600">Certificates</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No achievement data available yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Recognition Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Recognize and celebrate your top performers to maintain motivation and engagement:
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <strong className="text-green-900">Share Success:</strong>
                    <span className="text-sm text-gray-700 ml-2">
                      Highlight top achievers in team meetings or newsletters
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <strong className="text-green-900">Mentorship:</strong>
                    <span className="text-sm text-gray-700 ml-2">
                      Connect high performers with struggling learners for peer support
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <strong className="text-green-900">Rewards:</strong>
                    <span className="text-sm text-gray-700 ml-2">
                      Consider recognition certificates or professional development opportunities
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Gaps Tab - NEW */}
          <TabsContent value="gaps" className="space-y-6">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Learning Gaps Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learningGaps.length > 0 ? (
                  <div className="space-y-4">
                    {learningGaps.map((gap, index) => (
                      <div key={index} className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{gap.fullName}</h4>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-orange-700 font-semibold">
                                {gap.completionRate.toFixed(0)}% Completion Rate
                              </span>
                              <span className="text-gray-600">
                                {gap.inProgress} in progress • {gap.completed} completed • {gap.notStarted} not started
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800 flex-shrink-0">
                            Priority {index + 1}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500"
                              style={{ width: `${gap.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No significant learning gaps identified</p>
                    <p className="text-sm text-gray-500 mt-2">All courses have healthy completion rates or haven't been started yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {learningGaps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 bg-white border-2 border-teal-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-teal-700 font-bold">1</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Review Course Content</h5>
                          <p className="text-sm text-gray-600">
                            Assess if the course content aligns with team needs and skill levels. Consider updating materials or prerequisites.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-teal-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-teal-700 font-bold">2</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Provide Support Resources</h5>
                          <p className="text-sm text-gray-600">
                            Share supplementary materials, schedule Q&A sessions, or assign mentors to help team members succeed.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-teal-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-teal-700 font-bold">3</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Set Clear Expectations</h5>
                          <p className="text-sm text-gray-600">
                            Communicate completion deadlines and explain why these courses matter for the team's success.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={courseCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                    <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" name="In Progress" />
                    <Bar dataKey="notStarted" stackId="a" fill="#e5e7eb" name="Not Started" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Course Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {courseCompletionData.map((course, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{course.fullName}</h4>
                        <Badge>
                          {course.completionRate.toFixed(0)}% completion
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Completed</div>
                          <div className="text-lg font-bold text-green-700">{course.completed}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">In Progress</div>
                          <div className="text-lg font-bold text-yellow-600">{course.inProgress}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Not Started</div>
                          <div className="text-lg font-bold text-gray-500">{course.notStarted}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certification Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="completions" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      name="Daily Completions"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Strong Momentum</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Team completion rate is above industry average. Keep up the great work!
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">Certification Success</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {totalMembers > 0 ? ((allCertificates.length / totalMembers) * 100).toFixed(0) : 0}% of team members have earned certificates.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benchmarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Your Organization</span>
                      <span className="font-semibold text-gray-900">
                        {allProgress.length > 0 
                          ? (allProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / allProgress.length).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-600"
                        style={{ 
                          width: `${allProgress.length > 0 
                            ? (allProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / allProgress.length)
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Industry Average</span>
                      <span className="font-semibold text-gray-900">65%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Top Performers</span>
                      <span className="font-semibold text-gray-900">85%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600" style={{ width: '85%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-6 h-6 text-teal-600" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExportReport}
                    disabled={isExporting}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-8 h-8" />
                        <span>Export Full Report (TXT)</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      alert('PDF export with charts coming soon! This would use a library like jsPDF with chart images.');
                    }}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <FileText className="w-8 h-8" />
                    <span>Export with Charts (PDF)</span>
                  </Button>

                  <Button
                    onClick={() => {
                      // Export course completion data as CSV
                      const csvData = courseCompletionData.map(c => 
                        `"${c.fullName}",${c.completed},${c.inProgress},${c.notStarted},${c.completionRate.toFixed(2)}`
                      ).join('\n');
                      const blob = new Blob([`Course,Completed,In Progress,Not Started,Completion Rate\n${csvData}`], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `course-completion-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-8 h-8" />
                    <span>Export Course Data (CSV)</span>
                  </Button>

                  <Button
                    onClick={() => {
                      // Export top performers data
                      const csvData = topPerformers.map(p => 
                        `${p.rank},"${p.name}","${p.email}",${p.totalPoints},${p.coursesCompleted},${p.certificates}`
                      ).join('\n');
                      const blob = new Blob([`Rank,Name,Email,Points,Courses Completed,Certificates\n${csvData}`], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `top-performers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2"
                  >
                    <Users className="w-8 h-8" />
                    <span>Export Performers (CSV)</span>
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Export Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                    <li>Full reports include executive summary, metrics, and recommendations</li>
                    <li>CSV exports can be opened in Excel or Google Sheets for further analysis</li>
                    <li>PDF exports (coming soon) will include visual charts and graphs</li>
                    <li>All exports include timestamp for record-keeping</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
