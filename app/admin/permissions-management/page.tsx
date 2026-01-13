'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Save, RefreshCw } from 'lucide-react'
import PermissionMatrix from '@/components/admin/PermissionMatrix'

export default function PermissionsManagementPage() {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handlePermissionToggle(roleId: string, permissionId: string, currentState: boolean) {
    try {
      if (currentState) {
        // Remove permission
        const res = await fetch(`/api/admin/roles/${roleId}/permissions?permission_id=${permissionId}`, {
          method: 'DELETE'
        })
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to remove permission')
        }
        
        setMessage({ type: 'success', text: 'Permission removed successfully' })
      } else {
        // Add permission
        const res = await fetch(`/api/admin/roles/${roleId}/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permission_id: permissionId })
        })
        
        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to assign permission')
        }
        
        setMessage({ type: 'success', text: 'Permission assigned successfully' })
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error toggling permission:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update permission' 
      })
      
      // Clear error after 5 seconds
      setTimeout(() => setMessage(null), 5000)
      throw error // Re-throw to prevent optimistic update
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/admin"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Admin"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-600" />
                    <h1 className="text-2xl font-bold text-gray-900">
                      Permissions Management
                    </h1>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Configure role-based access control and permission assignments
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/roles"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Manage Roles
                </Link>
                <Link
                  href="/admin/users"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Assign User Roles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div
            className={`
              px-4 py-3 rounded-lg border
              ${message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Permission-Based Access Control (PBAC)
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This matrix shows which permissions are assigned to each role. Click any checkbox to grant or revoke a permission for a role.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>System permissions</strong> (marked with yellow badge) are restricted to administrative roles</li>
                  <li><strong>Role levels</strong> determine which roles can be assigned by each admin</li>
                  <li>Changes take effect immediately for all users with that role</li>
                  <li>Users can have multiple roles, inheriting all their combined permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Matrix */}
        <PermissionMatrix onPermissionToggle={handlePermissionToggle} />

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Follow the principle of least privilege - grant only necessary permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Review permissions regularly and revoke unused access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Use system permissions carefully - they can affect platform security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Test permission changes in a staging environment first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Document custom roles and their intended purpose</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Role Hierarchy
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Guest</span>
                <span className="text-xs text-gray-400">Level 0</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Learner</span>
                <span className="text-xs text-gray-400">Level 10</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Instructor</span>
                <span className="text-xs text-gray-400">Level 20</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Analyst</span>
                <span className="text-xs text-gray-400">Level 30</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Manager</span>
                <span className="text-xs text-gray-400">Level 40</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-100">
                <span>Organization Admin</span>
                <span className="text-xs text-gray-400">Level 50</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">Super Admin</span>
                <span className="text-xs text-purple-600 font-medium">Level 60</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-900">
                Phase 3: Permission-Based Access Control Complete
              </h4>
              <p className="mt-1 text-sm text-purple-700">
                This system implements granular permission control across 100+ permissions and 30+ migrated tables.
                All RLS policies now use <code className="px-1 py-0.5 bg-purple-100 rounded text-xs">auth.has_permission()</code> instead of hard-coded role checks.
              </p>
              <div className="mt-3">
                <Link
                  href="/docs/security/phase3-implementation-plan.md"
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  View Phase 3 Implementation Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
