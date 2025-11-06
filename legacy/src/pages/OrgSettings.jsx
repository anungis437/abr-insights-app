
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Shield,
  ArrowLeft,
  Save,
  AlertCircle,
  Plus,
  Award,
  Target,
  Trash2,
  Edit,
  Check,
  X,
  Trophy,
  Star,
  Flame,
  Crown,
  Medal,
  Rocket,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function OrgSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [customBadgeForm, setCustomBadgeForm] = useState({
    badge_name: '',
    badge_description: '',
    badge_icon: 'trophy',
    badge_color: 'purple',
    criteria_type: 'course_completion',
    criteria_value: 1,
    points_reward: 50,
  });
  const [learningPathForm, setLearningPathForm] = useState({
    path_name: '',
    path_description: '',
    course_sequence: [],
    target_audience: 'all_team',
    assigned_emails: [],
    duration_days: 30,
    is_mandatory: false,
  });
  const [notificationPrefs, setNotificationPrefs] = useState({});
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [showPathDialog, setShowPathDialog] = useState(false);

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
    queryKey: ['organizations-settings', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const orgs = await base44.entities.Organization.list();
      return orgs.filter(org => org.admin_email === user.email);
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: customBadges = [] } = useQuery({
    queryKey: ['custom-badges', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      return await base44.entities.CustomBadge.filter({ organization_id: organization.id });
    },
    enabled: !!organization,
    initialData: [],
  });

  const { data: learningPaths = [] } = useQuery({
    queryKey: ['learning-paths', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      return await base44.entities.LearningPath.filter({ organization_id: organization.id });
    },
    enabled: !!organization,
    initialData: [],
  });

  const { data: notificationPreferences } = useQuery({
    queryKey: ['notification-prefs', organization?.id],
    queryFn: async () => {
      if (!organization) return null;
      const prefs = await base44.entities.NotificationPreference.filter({ organization_id: organization.id });
      return prefs[0] || null;
    },
    enabled: !!organization,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-settings'],
    queryFn: () => base44.entities.Course.list(),
    initialData: [],
  });

  useEffect(() => {
    if (organizations.length > 0) {
      const org = organizations[0];
      setOrganization(org);
      setFormData({
        name: org.name,
        industry: org.industry || "",
        admin_email: org.admin_email,
      });
    }
  }, [organizations]);

  useEffect(() => {
    if (notificationPreferences) {
      setNotificationPrefs(notificationPreferences);
    } else if (organization) {
      setNotificationPrefs({
        organization_id: organization.id,
        admin_email: user?.email,
        weekly_reports: true,
        completion_alerts: true,
        at_risk_alerts: true,
        license_expiry_alerts: true, // This was already in the old code's checkbox, so good to keep in initial state if no prefs found.
        milestone_celebrations: true,
        daily_digest: false,
        at_risk_threshold: 14,
        completion_notification_for: 'milestones_only',
        alert_channels: ['email', 'in_app'],
      });
    }
  }, [notificationPreferences, organization, user]);

  const updateOrganizationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Organization.update(organization.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations-settings'] });
      setHasChanges(false);
    },
  });

  const createBadgeMutation = useMutation({
    mutationFn: async (badgeData) => {
      return await base44.entities.CustomBadge.create({
        organization_id: organization.id,
        ...badgeData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-badges'] });
      setShowBadgeDialog(false);
      setCustomBadgeForm({
        badge_name: '',
        badge_description: '',
        badge_icon: 'trophy',
        badge_color: 'purple',
        criteria_type: 'course_completion',
        criteria_value: 1,
        points_reward: 50,
      });
    },
  });

  const createPathMutation = useMutation({
    mutationFn: async (pathData) => {
      return await base44.entities.LearningPath.create({
        organization_id: organization.id,
        ...pathData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      setShowPathDialog(false);
      setLearningPathForm({
        path_name: '',
        path_description: '',
        course_sequence: [],
        target_audience: 'all_team',
        assigned_emails: [],
        duration_days: 30,
        is_mandatory: false,
      });
    },
  });

  const updateNotificationPrefsMutation = useMutation({
    mutationFn: async (prefs) => {
      if (notificationPreferences?.id) {
        return await base44.entities.NotificationPreference.update(notificationPreferences.id, prefs);
      } else {
        return await base44.entities.NotificationPreference.create(prefs);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-prefs'] });
    },
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: async (badgeId) => {
      return await base44.entities.CustomBadge.delete(badgeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-badges'] });
    },
  });

  const deletePathMutation = useMutation({
    mutationFn: async (pathId) => {
      return await base44.entities.LearningPath.delete(pathId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    await updateOrganizationMutation.mutateAsync(formData);
  };

  const handleCreateBadge = () => {
    createBadgeMutation.mutate(customBadgeForm);
  };

  const handleCreatePath = () => {
    createPathMutation.mutate(learningPathForm);
  };

  const handleSaveNotificationPrefs = () => {
    updateNotificationPrefsMutation.mutate(notificationPrefs);
  };

  const getBadgeIconComponent = (iconName) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      flame: Flame,
      crown: Crown,
      shield: Shield,
      medal: Medal,
      rocket: Rocket,
      target: Target,
      award: Award,
      heart: Heart,
    };
    return icons[iconName] || Trophy;
  };

  const getBadgeColorClass = (color) => {
    const colors = {
      blue: 'from-blue-400 to-blue-600',
      purple: 'from-purple-400 to-purple-600',
      green: 'from-green-400 to-green-600',
      orange: 'from-orange-400 to-orange-600',
      pink: 'from-pink-400 to-pink-600',
      teal: 'from-teal-400 to-teal-600',
      red: 'from-red-400 to-red-600',
      yellow: 'from-yellow-400 to-yellow-600',
    };
    return colors[color] || colors.purple;
  };

  if (!user || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Organization Settings</h1>
              <p className="text-gray-600">{organization.name}</p>
            </div>
          </motion.div>
        </div>

        {/* Save Banner */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    name: organization.name,
                    industry: organization.industry || "",
                    admin_email: organization.admin_email,
                  });
                  setHasChanges(false);
                }}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                className="teal-gradient text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="badges">Custom Badges</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="admin-email">Administrator Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={formData.admin_email}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contact support to change the administrator
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* License Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  License & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">License Type</div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-100 text-indigo-700 text-base">
                        {organization.license_type}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    {organization.is_active ? (
                      <Badge className="bg-green-100 text-green-700 text-base">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-base">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Seats</div>
                    <div className="text-2xl font-bold text-gray-900">{organization.seat_count}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Seats Used</div>
                    <div className="text-2xl font-bold text-gray-900">{organization.seats_used || 0}</div>
                  </div>
                </div>

                {organization.license_start_date && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">License Start:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {format(new Date(organization.license_start_date), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      {organization.license_end_date && (
                        <div>
                          <span className="text-gray-600">License Expires:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {format(new Date(organization.license_end_date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                  <Button variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Custom Badges
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Create custom achievement badges aligned with your organization's goals
                    </p>
                  </div>
                  <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
                    <DialogTrigger asChild>
                      <Button className="teal-gradient text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Badge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Custom Badge</DialogTitle>
                        <DialogDescription>
                          Define achievement criteria and rewards for your team
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Badge Name *</Label>
                            <Input
                              value={customBadgeForm.badge_name}
                              onChange={(e) => setCustomBadgeForm({...customBadgeForm, badge_name: e.target.value})}
                              placeholder="e.g., Team Player"
                            />
                          </div>
                          <div>
                            <Label>Points Reward</Label>
                            <Input
                              type="number"
                              value={customBadgeForm.points_reward}
                              onChange={(e) => setCustomBadgeForm({...customBadgeForm, points_reward: Number(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            value={customBadgeForm.badge_description}
                            onChange={(e) => setCustomBadgeForm({...customBadgeForm, badge_description: e.target.value})}
                            placeholder="What does this badge represent?"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Icon</Label>
                            <Select
                              value={customBadgeForm.badge_icon}
                              onValueChange={(value) => setCustomBadgeForm({...customBadgeForm, badge_icon: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="trophy">🏆 Trophy</SelectItem>
                                <SelectItem value="star">⭐ Star</SelectItem>
                                <SelectItem value="flame">🔥 Flame</SelectItem>
                                <SelectItem value="crown">👑 Crown</SelectItem>
                                <SelectItem value="shield">🛡️ Shield</SelectItem>
                                <SelectItem value="medal">🏅 Medal</SelectItem>
                                <SelectItem value="rocket">🚀 Rocket</SelectItem>
                                <SelectItem value="target">🎯 Target</SelectItem>
                                <SelectItem value="award">🎖️ Award</SelectItem>
                                <SelectItem value="heart">❤️ Heart</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Color</Label>
                            <Select
                              value={customBadgeForm.badge_color}
                              onValueChange={(value) => setCustomBadgeForm({...customBadgeForm, badge_color: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="purple">Purple</SelectItem>
                                <SelectItem value="green">Green</SelectItem>
                                <SelectItem value="orange">Orange</SelectItem>
                                <SelectItem value="pink">Pink</SelectItem>
                                <SelectItem value="teal">Teal</SelectItem>
                                <SelectItem value="red">Red</SelectItem>
                                <SelectItem value="yellow">Yellow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Criteria Type *</Label>
                            <Select
                              value={customBadgeForm.criteria_type}
                              onValueChange={(value) => setCustomBadgeForm({...customBadgeForm, criteria_type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="course_completion">Course Completion</SelectItem>
                                <SelectItem value="point_threshold">Point Threshold</SelectItem>
                                <SelectItem value="streak">Learning Streak</SelectItem>
                                <SelectItem value="certificate_count">Certificate Count</SelectItem>
                                <SelectItem value="quiz_score">Quiz Score Average</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Threshold Value *</Label>
                            <Input
                              type="number"
                              value={customBadgeForm.criteria_value}
                              onChange={(e) => setCustomBadgeForm({...customBadgeForm, criteria_value: Number(e.target.value)})}
                              placeholder="e.g., 5 courses"
                            />
                          </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColorClass(customBadgeForm.badge_color)} flex items-center justify-center`}>
                              {React.createElement(getBadgeIconComponent(customBadgeForm.badge_icon), { className: "w-8 h-8 text-white" })}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{customBadgeForm.badge_name || 'Badge Name'}</h4>
                              <p className="text-sm text-gray-600">{customBadgeForm.badge_description || 'Badge description'}</p>
                              <p className="text-xs text-purple-600 mt-1">+{customBadgeForm.points_reward} points</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setShowBadgeDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateBadge}
                            disabled={!customBadgeForm.badge_name || !customBadgeForm.badge_description}
                            className="teal-gradient text-white"
                          >
                            Create Badge
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {customBadges.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {customBadges.map((badge) => {
                      const BadgeIcon = getBadgeIconComponent(badge.badge_icon);
                      return (
                        <div key={badge.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getBadgeColorClass(badge.badge_color)} flex items-center justify-center`}>
                                <BadgeIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{badge.badge_name}</h4>
                                <p className="text-xs text-gray-600">{badge.badge_description}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBadgeMutation.mutate(badge.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="outline">
                              {badge.criteria_type.replace('_', ' ')}: {badge.criteria_value}
                            </Badge>
                            <span className="text-purple-600 font-semibold">+{badge.points_reward} pts</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Awarded to {badge.awarded_to?.length || 0} member(s)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No custom badges yet</p>
                    <p className="text-sm text-gray-500">Create badges to recognize team achievements</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Custom Learning Paths
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Create structured learning journeys for your team
                    </p>
                  </div>
                  <Dialog open={showPathDialog} onOpenChange={setShowPathDialog}>
                    <DialogTrigger asChild>
                      <Button className="teal-gradient text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Path
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create Learning Path</DialogTitle>
                        <DialogDescription>
                          Design a customized course sequence for your team
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Path Name *</Label>
                          <Input
                            value={learningPathForm.path_name}
                            onChange={(e) => setLearningPathForm({...learningPathForm, path_name: e.target.value})}
                            placeholder="e.g., New Manager Onboarding"
                          />
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={learningPathForm.path_description}
                            onChange={(e) => setLearningPathForm({...learningPathForm, path_description: e.target.value})}
                            placeholder="What will learners gain from this path?"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Target Audience</Label>
                            <Select
                              value={learningPathForm.target_audience}
                              onValueChange={(value) => setLearningPathForm({...learningPathForm, target_audience: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all_team">All Team Members</SelectItem>
                                <SelectItem value="specific_members">Specific Members</SelectItem>
                                <SelectItem value="new_hires">New Hires</SelectItem>
                                <SelectItem value="managers">Managers</SelectItem>
                                <SelectItem value="hr_team">HR Team</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Recommended Duration (days)</Label>
                            <Input
                              type="number"
                              value={learningPathForm.duration_days}
                              onChange={(e) => setLearningPathForm({...learningPathForm, duration_days: Number(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Course Sequence *</Label>
                          <p className="text-xs text-gray-500 mb-2">Select courses in the order learners should take them</p>
                          <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                            {courses.map((course) => (
                              <div key={course.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={learningPathForm.course_sequence.includes(course.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setLearningPathForm({
                                        ...learningPathForm,
                                        course_sequence: [...learningPathForm.course_sequence, course.id]
                                      });
                                    } else {
                                      setLearningPathForm({
                                        ...learningPathForm,
                                        course_sequence: learningPathForm.course_sequence.filter(id => id !== course.id)
                                      });
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <label className="text-sm text-gray-700 flex-1">{course.title_en}</label>
                                {learningPathForm.course_sequence.includes(course.id) && (
                                  <Badge variant="outline" className="text-xs">
                                    #{learningPathForm.course_sequence.indexOf(course.id) + 1}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={learningPathForm.is_mandatory}
                            onChange={(e) => setLearningPathForm({...learningPathForm, is_mandatory: e.target.checked})}
                            className="w-4 h-4"
                          />
                          <Label>Make this path mandatory</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setShowPathDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreatePath}
                            disabled={!learningPathForm.path_name || learningPathForm.course_sequence.length === 0}
                            className="teal-gradient text-white"
                          >
                            Create Learning Path
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {learningPaths.length > 0 ? (
                  <div className="space-y-4">
                    {learningPaths.map((path) => (
                      <div key={path.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900">{path.path_name}</h4>
                              {path.is_mandatory && (
                                <Badge className="bg-red-100 text-red-700">Mandatory</Badge>
                              )}
                              <Badge variant="outline">{path.target_audience.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{path.path_description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{path.course_sequence.length} courses</span>
                              <span>~{path.duration_days} days</span>
                              {path.assigned_emails && path.assigned_emails.length > 0 && (
                                <span>{path.assigned_emails.length} assigned</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePathMutation.mutate(path.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No learning paths yet</p>
                    <p className="text-sm text-gray-500">Create custom paths to guide your team's learning</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <Button
                    onClick={handleSaveNotificationPrefs}
                    className="teal-gradient text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alert Types */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Alert Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Weekly Progress Reports</div>
                        <div className="text-sm text-gray-600">Comprehensive team progress summaries</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.weekly_reports || false}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, weekly_reports: e.target.checked})}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Completion Alerts</div>
                        <div className="text-sm text-gray-600">Notify when team members complete courses</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.completion_alerts || false}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, completion_alerts: e.target.checked})}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">At-Risk Learner Alerts</div>
                        <div className="text-sm text-gray-600">Get notified about inactive learners</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.at_risk_alerts || false}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, at_risk_alerts: e.target.checked})}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Milestone Celebrations</div>
                        <div className="text-sm text-gray-600">Team achievement notifications</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.milestone_celebrations || false}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, milestone_celebrations: e.target.checked})}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Daily Digest</div>
                        <div className="text-sm text-gray-600">Daily summary of team activity</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.daily_digest || false}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, daily_digest: e.target.checked})}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">License Expiry Reminders</div>
                        <div className="text-sm text-gray-600">Get notified 30 days before license expires</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationPrefs.license_expiry_alerts || false}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, license_expiry_alerts: e.target.checked})}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">Advanced Settings</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>At-Risk Threshold (days of inactivity)</Label>
                      <Input
                        type="number"
                        value={notificationPrefs.at_risk_threshold || 1}
                        onChange={(e) => setNotificationPrefs({...notificationPrefs, at_risk_threshold: Number(e.target.value)})}
                        min="1"
                        max="60"
                      />
                    </div>

                    <div>
                      <Label>Completion Notification Frequency</Label>
                      <Select
                        value={notificationPrefs.completion_notification_for || 'milestones_only'}
                        onValueChange={(value) => setNotificationPrefs({...notificationPrefs, completion_notification_for: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_completions">Every Completion</SelectItem>
                          <SelectItem value="first_completion_only">First Completion Only</SelectItem>
                          <SelectItem value="milestones_only">Milestones Only</SelectItem>
                          <SelectItem value="none">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Notification Channels */}
                <div className="pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">Notification Channels</h4>
                  <div className="flex flex-wrap gap-3">
                    {['email', 'in_app', 'slack', 'teams'].map((channel) => (
                      <button
                        key={channel}
                        onClick={() => {
                          const channels = notificationPrefs.alert_channels || [];
                          if (channels.includes(channel)) {
                            setNotificationPrefs({
                              ...notificationPrefs,
                              alert_channels: channels.filter(c => c !== channel)
                            });
                          } else {
                            setNotificationPrefs({
                              ...notificationPrefs,
                              alert_channels: [...channels, channel]
                            });
                          }
                        }}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          (notificationPrefs.alert_channels || []).includes(channel)
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {channel === 'in_app' ? 'In-App' : channel.charAt(0).toUpperCase() + channel.slice(1)}
                        {(notificationPrefs.alert_channels || []).includes(channel) && (
                          <Check className="w-4 h-4 inline ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-900 mb-1">Data Protection Enabled</div>
                      <div className="text-sm text-green-700">
                        Your organization's data is encrypted and complies with Canadian privacy regulations.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Require 2FA for all team members</div>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">SSO Integration</div>
                    <div className="text-sm text-gray-600">Enable Single Sign-On for your organization</div>
                  </div>
                  <Badge variant="outline">Enterprise Only</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-200 mt-6">
          <CardHeader>
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-red-900 mb-1">Deactivate Organization</div>
                  <div className="text-sm text-red-700">
                    Temporarily disable access for all team members. This can be reversed.
                  </div>
                </div>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                  Deactivate
                </Button>
              </div>
            </div>

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-red-900 mb-1">Delete Organization</div>
                  <div className="text-sm text-red-700">
                    Permanently delete organization and all associated data. This cannot be undone.
                  </div>
                </div>
                <Button variant="outline" className="border-red-600 text-red-700 hover:bg-red-100">
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
