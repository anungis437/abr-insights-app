'use client'

import { useState, useEffect } from 'react'
import { Check, X, Info } from 'lucide-react'
import type { Permission, Role, PermissionMatrixRow, PermissionCategory } from '@/lib/types/permissions'
import { groupPermissionsByCategory, PERMISSION_CATEGORIES } from '@/lib/types/permissions'
import { Protected } from '@/components/auth/Protected'

interface PermissionMatrixProps {
  onPermissionToggle?: (roleId: string, permissionId: string, currentState: boolean) => Promise<void>
  readOnly?: boolean
}

export default function PermissionMatrix({ onPermissionToggle, readOnly = false }: PermissionMatrixProps) {
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
        rolePermMap[role.id] = new Set(
          role.permissions?.map((p: Permission) => p.id) || []
        )
      })
      setRolePermissions(rolePermMap)
    } catch (error) {
      console.error('Error loading permission matrix:', error)
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
      setRolePermissions(prev => {
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
      console.error('Error toggling permission:', error)
    } finally {
      setUpdatingCell(null)
    }
  }

  // Filter permissions
  const groupedPermissions = groupPermissionsByCategory(permissions)
  const filteredPermissions = selectedCategory === 'all' 
    ? permissions 
    : groupedPermissions[selectedCategory] || []
  
  const searchFiltered = searchQuery
    ? filteredPermissions.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPermissions

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading permissions...</span>
      </div>
    )
  }

  return (
    <Protected permissions={['admin.permissions.view']} requireAll={true}>
      <div className="space-y-6">{/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PermissionCategory | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                {roles.map(role => (
                  <th
                    key={role.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
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
            <tbody className="bg-white divide-y divide-gray-200">
              {searchFiltered.length === 0 ? (
                <tr>
                  <td colSpan={roles.length + 1} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? 'No permissions found matching your search' : 'No permissions in this category'}
                  </td>
                </tr>
              ) : (
                searchFiltered.map((permission, idx) => (
                  <tr key={permission.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="sticky left-0 z-10 px-6 py-4 bg-inherit">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {permission.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {permission.slug}
                          </div>
                          {permission.description && (
                            <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                              {permission.description}
                            </div>
                          )}
                        </div>
                        {permission.is_system && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            System
                          </span>
                        )}
                      </div>
                    </td>
                    {roles.map(role => {
                      const hasPermission = rolePermissions[role.id]?.has(permission.id) || false
                      const cellKey = `${role.id}-${permission.id}`
                      const isUpdating = updatingCell === cellKey
                      const isSystemRole = role.is_system
                      const isSystemPermission = permission.is_system
                      const disabled = readOnly || isUpdating || (isSystemRole && !hasPermission)
                      
                      return (
                        <td key={role.id} className="px-4 py-4 text-center">
                          <button
                            onClick={() => !disabled && handleTogglePermission(role.id, permission.id)}
                            disabled={disabled}
                            className={`
                              inline-flex items-center justify-center w-8 h-8 rounded-full
                              transition-all duration-150
                              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}
                              ${hasPermission 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }
                              ${isUpdating ? 'animate-pulse' : ''}
                            `}
                            title={`${hasPermission ? 'Granted' : 'Not granted'}${isSystemRole ? ' (System role)' : ''}`}
                            aria-label={`${hasPermission ? 'Remove' : 'Grant'} ${permission.name} for ${role.name}`}
                          >
                            {isUpdating ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : hasPermission ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <X className="w-4 h-4" />
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
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-700" />
          </div>
          <span>Permission granted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </div>
          <span>Permission not granted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            System
          </span>
          <span>System permission (admin only)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total Permissions</div>
          <div className="text-2xl font-bold text-purple-900">{permissions.length}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Roles</div>
          <div className="text-2xl font-bold text-blue-900">{roles.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Active Assignments</div>
          <div className="text-2xl font-bold text-green-900">
            {Object.values(rolePermissions).reduce((sum, perms) => sum + perms.size, 0)}
          </div>
        </div>
      </div>
    </div>
    </Protected>
  )
}
