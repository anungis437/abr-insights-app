import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users,
  UserPlus,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function TeamManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);

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
    queryKey: ['organizations-team', user?.email],
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
    queryKey: ['team-progress', organization?.id],
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
    queryKey: ['team-certificates', organization?.id],
    queryFn: async () => {
      if (!organization) return [];
      const memberEmails = [...(organization.member_emails || []), organization.admin_email];
      const certs = await base44.entities.Certificate.list();
      return certs.filter(c => memberEmails.includes(c.user_email));
    },
    enabled: !!organization,
    initialData: [],
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Organization.update(organization.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations-team'] });
    },
  });

  const handleInviteMember = async () => {
    if (!inviteEmail || !organization) return;

    const currentMembers = organization.member_emails || [];
    
    // Check if already invited
    if (currentMembers.includes(inviteEmail) || organization.admin_email === inviteEmail) {
      alert("This user is already a member");
      return;
    }

    // Check seat availability
    const totalMembers = currentMembers.length + 1; // +1 for admin
    if (totalMembers >= organization.seat_count) {
      alert("No seats available. Please upgrade your plan.");
      return;
    }

    await updateOrganizationMutation.mutateAsync({
      member_emails: [...currentMembers, inviteEmail],
      seats_used: totalMembers + 1,
    });

    // In real implementation, would send invitation email via integration
    // await base44.integrations.Core.SendEmail({
    //   to: inviteEmail,
    //   subject: `You've been invited to join ${organization.name} on ABR Insight`,
    //   body: `${user.full_name || user.email} has invited you to join their team...`
    // });

    setInviteEmail("");
    setInviteName("");
    setShowInviteDialog(false);
  };

  const handleRemoveMember = async (memberEmail) => {
    if (!window.confirm(`Remove ${memberEmail} from the organization?`)) return;

    const currentMembers = organization.member_emails || [];
    const updatedMembers = currentMembers.filter(email => email !== memberEmail);

    await updateOrganizationMutation.mutateAsync({
      member_emails: updatedMembers,
      seats_used: updatedMembers.length + 1,
    });
  };

  if (!user || organizations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be an organization administrator to access team management.
            </p>
            <Link to={createPageUrl("OrgDashboard")}>
              <Button className="teal-gradient text-white">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberEmails = [...(organization.member_emails || []), organization.admin_email];
  const seatsAvailable = organization.seat_count - memberEmails.length;

  const getMemberProgress = (email) => {
    const memberProgress = allProgress.filter(p => p.user_email === email);
    const avgCompletion = memberProgress.length > 0
      ? memberProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / memberProgress.length
      : 0;
    const certificates = allCertificates.filter(c => c.user_email === email).length;
    return { avgCompletion, certificates, coursesStarted: memberProgress.length };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600">{organization.name}</p>
              </div>
            </div>
          </div>

          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button className="teal-gradient text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your organization. They'll receive an email invitation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="invite-email">Email Address *</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="member@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-name">Full Name (Optional)</Label>
                  <Input
                    id="invite-name"
                    placeholder="John Doe"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="text-blue-900">
                    <strong>{seatsAvailable}</strong> seats available out of {organization.seat_count}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteMember}
                  disabled={!inviteEmail || seatsAvailable <= 0}
                  className="teal-gradient text-white"
                >
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">{memberEmails.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Members</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-700">
                {allCertificates.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Certificates Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-700">{seatsAvailable}</div>
              <div className="text-sm text-gray-600 mt-1">Seats Available</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">
                {allProgress.filter(p => p.completion_percentage > 0).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Active Learners</div>
            </CardContent>
          </Card>
        </div>

        {/* Team Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Courses Started</TableHead>
                  <TableHead>Avg Progress</TableHead>
                  <TableHead>Certificates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberEmails.map((email, index) => {
                  const stats = getMemberProgress(email);
                  const isAdmin = email === organization.admin_email;
                  const hasActivity = stats.coursesStarted > 0;

                  return (
                    <TableRow key={email}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-700 font-semibold">
                              {email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{email}</div>
                            <div className="text-xs text-gray-500">
                              {/* In real implementation, fetch actual user name */}
                              Member #{index + 1}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Badge className="bg-indigo-100 text-indigo-700">Admin</Badge>
                        ) : (
                          <Badge variant="outline">Member</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{stats.coursesStarted}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full transition-all"
                              style={{ width: `${stats.avgCompletion}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {stats.avgCompletion.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {stats.certificates > 0 ? (
                          <div className="flex items-center gap-1 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">{stats.certificates}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasActivity ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Invited
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-white border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Team Reminder
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Team Report
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Bulk Import Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}