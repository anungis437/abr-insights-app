'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect } from 'react'
import { Check, X, Info } from 'lucide-react'
import type {
  Permission,
  Role,
  PermissionMatrixRow,
  PermissionCategory,
} from '@/lib/types/permissions'
import { groupPermissionsByCategory, PERMISSION_CATEGORIES } from '@/lib/types/permissions'
import { Protected } from '@/components/shared/Protected'

interface PermissionMatrixProps {
  onPermissionToggle?: (
    roleId: string,
    permissionId: string,
    currentState: boolean
  ) => Promise<void>
  readOnly?: boolean
}

export default function PermissionMatrix({
  onPermissionToggle,
  readOnly = false,
}: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [rolePermissions, setRolePermissions] = useState<Record<string, Set<string>>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<PermissionCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingCell, setUpdatingCell] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // Fetch permissions
      const permsRes = await fetch('/api/admin/permissions')
      const permsData = await permsRes.json()
      setPermissions(permsData.permissions || [])

      // Fetch roles with permissions
      const rolesRes = await fetch('/api/admin/roles?include_permissions=true')
      const rolesData = await rolesRes.json()
      const fetchedRoles = rolesData.roles || []
      setRoles(fetchedRoles)

      // Build role permissions map
      const rolePermMap: Record<string, Set<string>> = {}
      fetchedRoles.forEach((role: Role & { permissions?: Permission[] }) => {
        rolePermMap[role.id] = new Set(role.permissions?.map((p: Permission) => p.id) || [])
      })
      setRolePermissions(rolePermMap)
    } catch (error) {
      logger.error('Error loading permission matrix:', { error: error, context: 'PermissionMatrix' })
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePermission(roleId: string, permissionId: string) {
    if (readOnly || !onPermissionToggle) return

    const currentState = rolePermissions[roleId]?.has(permissionId) || false
    const cellKey = `${roleId}-${permissionId}`

    try {
      setUpdatingCell(cellKey)
      await onPermissionToggle(roleId, permissionId, currentState)

      // Update local state
      setRolePermissions((prev) => {
        const newMap = { ...prev }
        if (!newMap[roleId]) newMap[roleId] = new Set()

        if (currentState) {
          newMap[roleId].delete(permissionId)
        } else {
          newMap[roleId].add(permissionId)
        }

        return newMap
      })
    } catch (error) {
      logger.error('Error toggling permission:', { error: error, context: 'PermissionMatrix' })
    } finally {
      setUpdatingCell(null)
    }
  }

  // Filter permissions
  const groupedPermissions = groupPermissionsByCategory(permissions)
  const filteredPermissions =
    selectedCategory === 'all' ? permissions : groupedPermissions[selectedCategory] || []

  const searchFiltered = searchQuery
    ? filteredPermissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPermissions

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading permissions...</span>
      </div>
    )
  }

  return (
    <Protected permission="admin.permissions.view">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="max-w-md flex-1">
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as PermissionCategory | 'all')}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500"
              aria-label="Filter permissions by category"
            >
              <option value="all">All Categories ({permissions.length})</option>
              {Object.entries(PERMISSION_CATEGORIES).map(([key, { label, icon }]) => {
                const count = groupedPermissions[key as PermissionCategory]?.length || 0
                return (
                  <option key={key} value={key}>
                    {icon} {label} ({count})
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Permission Matrix Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                      title={role.description || ''}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{role.name}</span>
                        <span className="text-xs font-normal text-gray-400">
                          Level {role.level}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {searchFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={roles.length + 1} className="px-6 py-8 text-center text-gray-500">
                      {searchQuery
                        ? 'No permissions found matching your search'
                        : 'No permissions in this category'}
                    </td>
                  </tr>
                ) : (
                  searchFiltered.map((permission, idx) => (
                    <tr key={permission.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="sticky left-0 z-10 bg-inherit px-6 py-4">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {permission.name}
                            </div>
                            <div className="truncate text-xs text-gray-500">{permission.slug}</div>
                            {permission.description && (
                              <div className="mt-1 line-clamp-2 text-xs text-gray-600">
                                {permission.description}
                              </div>
                            )}
                          </div>
                          {permission.is_system && (
                            <span className="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                              System
                            </span>
                          )}
                        </div>
                      </td>
                      {roles.map((role) => {
                        const hasPermission = rolePermissions[role.id]?.has(permission.id) || false
                        const cellKey = `${role.id}-${permission.id}`
                        const isUpdating = updatingCell === cellKey
                        const isSystemRole = role.is_system
                        const isSystemPermission = permission.is_system
                        const disabled = readOnly || isUpdating || (isSystemRole && !hasPermission)

                        return (
                          <td key={role.id} className="px-4 py-4 text-center">
                            <button
                              onClick={() =>
                                !disabled && handleTogglePermission(role.id, permission.id)
                              }
                              disabled={disabled}
                              className={`
                              inline-flex h-8 w-8 items-center justify-center rounded-full
                              transition-all duration-150
                              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                              ${
                                hasPermission
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }
                              ${isUpdating ? 'animate-pulse' : ''}
                            `}
                              title={`${hasPermission ? 'Granted' : 'Not granted'}${isSystemRole ? ' (System role)' : ''}`}
                              aria-label={`${hasPermission ? 'Remove' : 'Grant'} ${permission.name} for ${role.name}`}
                            >
                              {isUpdating ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : hasPermission ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-700" />
            </div>
            <span>Permission granted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <X className="h-4 w-4 text-gray-400" />
            </div>
            <span>Permission not granted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              System
            </span>
            <span>System permission (admin only)</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="text-sm font-medium text-purple-600">Total Permissions</div>
            <div className="text-2xl font-bold text-purple-900">{permissions.length}</div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm font-medium text-blue-600">Total Roles</div>
            <div className="text-2xl font-bold text-blue-900">{roles.length}</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="text-sm font-medium text-green-600">Active Assignments</div>
            <div className="text-2xl font-bold text-green-900">
              {Object.values(rolePermissions).reduce((sum, perms) => sum + perms.size, 0)}
            </div>
          </div>
        </div>
      </div>
    </Protected>
  )
}
