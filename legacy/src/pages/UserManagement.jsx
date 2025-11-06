import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Shield,
  ArrowLeft,
  Edit,
  Search,
  Plus,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { DEFAULT_PERMISSIONS, hasPermission, AccessDenied } from "../components/shared/PermissionsCheck";

export default function UserManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

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
  }, [navigate]);

  // Check permission to access this page
  if (user && !hasPermission(user, 'organization', 'manage_users')) {
    return <AccessDenied message="You need Super Admin privileges to manage users" />;
  }

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      // In production, this would be a proper user management endpoint
      // For now, we'll simulate with a list endpoint
      return await base44.entities.User.list();
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: () => base44.entities.UserRole.list(),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }) => {
      return await base44.entities.User.update(userId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setShowEditDialog(false);
    },
  });

  const handleEditRole = (userToEdit) => {
    setSelectedUser(userToEdit);
    setNewRole(userToEdit.role_name || userToEdit.role || 'Viewer');
    setShowEditDialog(true);
  };

  const handleSaveRole = async () => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        updates: {
          role_name: newRole,
          role: newRole === 'Super Admin' || newRole === 'Admin' ? 'admin' : 'user'
        }
      });
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Analyst':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Viewer':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getPermissionSummary = (roleName) => {
    const perms = DEFAULT_PERMISSIONS[roleName];
    if (!perms) return { total: 0, granted: 0 };

    let total = 0;
    let granted = 0;

    Object.values(perms).forEach(category => {
      Object.values(category).forEach(value => {
        total++;
        if (value) granted++;
      });
    });

    return { total, granted };
  };

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
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage roles and permissions</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-900">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Users</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-700">
                {filteredUsers.filter(u => u.role === 'admin' || u.role_name === 'Admin' || u.role_name === 'Super Admin').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Administrators</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-700">
                {filteredUsers.filter(u => u.role_name === 'Analyst').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Analysts</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-gray-700">
                {filteredUsers.filter(u => u.role_name === 'Viewer').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Viewers</div>
            </CardContent>
          </Card>
        </div>

        {/* Role Permissions Overview */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Role Permissions Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.keys(DEFAULT_PERMISSIONS).map(roleName => {
                const { total, granted } = getPermissionSummary(roleName);
                const percentage = Math.round((granted / total) * 100);
                
                return (
                  <div key={roleName} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getRoleBadgeColor(roleName)}>
                        {roleName}
                      </Badge>
                      <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {granted} of {total} permissions
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((userItem) => {
                  const userRole = userItem.role_name || (userItem.role === 'admin' ? 'Admin' : 'Viewer');
                  const { granted, total } = getPermissionSummary(userRole);
                  
                  return (
                    <TableRow key={userItem.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-700 font-semibold text-sm">
                              {userItem.full_name?.[0] || userItem.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {userItem.full_name || 'No Name'}
                            </div>
                            {userItem.id === user.id && (
                              <Badge variant="outline" className="text-xs mt-1">You</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{userItem.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(userRole)}>
                          {userRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${(granted / total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{granted}/{total}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {userItem.last_login ? format(new Date(userItem.last_login), 'MMM dd, yyyy') : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(userItem)}
                          disabled={userItem.id === user.id}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Permissions Legend */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-white border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Permission Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-sm">Data Access</span>
                </div>
                <p className="text-xs text-gray-600">View cases, export data, analytics</p>
              </div>
              
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-sm">Job Management</span>
                </div>
                <p className="text-xs text-gray-600">Sync & training jobs, deployments</p>
              </div>
              
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-sm">Organization</span>
                </div>
                <p className="text-xs text-gray-600">User & team management, settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select New Role
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Super Admin</span>
                      <Badge className="ml-2 text-xs">Full Access</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Analyst">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Analyst</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Viewer">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <span>Viewer</span>
                      <Badge className="ml-2 text-xs">Read Only</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permission Preview */}
            {newRole && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">
                  {newRole} Permissions Preview
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(DEFAULT_PERMISSIONS[newRole] || {}).map(([category, permissions]) => {
                    const granted = Object.values(permissions).filter(Boolean).length;
                    const total = Object.values(permissions).length;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                        <span className="font-semibold text-gray-900">
                          {granted}/{total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              The user will be logged out and need to sign in again for changes to take effect.
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveRole}
              className="bg-purple-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}