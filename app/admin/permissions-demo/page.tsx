'use client'

import { useState } from 'react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Protected, PermissionGate } from '@/components/shared/Protected'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Edit, Trash2, Eye, Settings, Users, Shield, CheckCircle } from 'lucide-react'

export default function PermissionsDemo() {
  const { permissions, loading, hasPermission, hasAnyPermission } = usePermissions()
  const [actionLog, setActionLog] = useState<string[]>([])

  const logAction = (action: string) => {
    setActionLog((prev) => [
      `${new Date().toLocaleTimeString()}: ${action}`,
      ...prev.slice(0, 9), // Keep last 10 actions
    ])
  }

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Permission System Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates permission-based UI rendering
        </p>
      </div>

      {/* Current Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Active Permissions
          </CardTitle>
          <CardDescription>You have {permissions.length} permission(s) assigned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {permissions.length > 0 ? (
              permissions.map((perm) => (
                <Badge key={perm} variant="secondary">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {perm}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No permissions assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Management Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>These actions require specific course permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Protected permission="courses.view">
              <Button variant="outline" onClick={() => logAction('Viewed courses')}>
                <Eye className="mr-2 h-4 w-4" />
                View Courses
              </Button>
            </Protected>

            <Protected permission="courses.create">
              <Button onClick={() => logAction('Created new course')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Protected>

            <Protected anyPermissions={['courses.update', 'courses.manage']}>
              <Button variant="secondary" onClick={() => logAction('Edited course')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Course
              </Button>
            </Protected>

            <Protected permission="courses.delete">
              <Button variant="destructive" onClick={() => logAction('Deleted course')}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </Button>
            </Protected>

            <Protected permission="courses.manage">
              <Button variant="outline" onClick={() => logAction('Opened course settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Course Settings
              </Button>
            </Protected>
          </div>

          {!hasAnyPermission([
            'courses.view',
            'courses.create',
            'courses.update',
            'courses.delete',
            'courses.manage',
          ]) && (
            <p className="text-muted-foreground text-sm">
              You don&apos;t have any course management permissions
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Management Demo */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>These actions require user management permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Protected permission="users.view">
              <Button variant="outline" onClick={() => logAction('Viewed users')}>
                <Users className="mr-2 h-4 w-4" />
                View Users
              </Button>
            </Protected>

            <Protected permission="users.create">
              <Button onClick={() => logAction('Created new user')}>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </Protected>

            <Protected anyPermissions={['users.update', 'users.manage']}>
              <Button variant="secondary" onClick={() => logAction('Edited user')}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </Protected>

            <Protected permission="users.delete">
              <Button variant="destructive" onClick={() => logAction('Deleted user')}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </Protected>
          </div>

          {!hasAnyPermission([
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'users.manage',
          ]) && (
            <p className="text-muted-foreground text-sm">
              You don&apos;t have any user management permissions
            </p>
          )}
        </CardContent>
      </Card>

      {/* Permission Gate Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Rendering Demo</CardTitle>
          <CardDescription>Using PermissionGate for conditional rendering</CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionGate permission="courses.delete">
            {(canDelete) => (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Delete Permission Status:</strong>{' '}
                  {canDelete ? (
                    <Badge variant="default">Granted</Badge>
                  ) : (
                    <Badge variant="destructive">Denied</Badge>
                  )}
                </p>
                <Button
                  disabled={!canDelete}
                  variant={canDelete ? 'destructive' : 'outline'}
                  onClick={() => logAction('Attempted delete action')}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {canDelete ? 'Delete Item' : 'Delete (No Permission)'}
                </Button>
              </div>
            )}
          </PermissionGate>
        </CardContent>
      </Card>

      {/* Action Log */}
      <Card>
        <CardHeader>
          <CardTitle>Action Log</CardTitle>
          <CardDescription>Recent actions performed</CardDescription>
        </CardHeader>
        <CardContent>
          {actionLog.length > 0 ? (
            <div className="space-y-1 font-mono text-sm">
              {actionLog.map((log, i) => (
                <div key={i} className="text-muted-foreground">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No actions performed yet. Try clicking the buttons above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
