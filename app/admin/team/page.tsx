'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PermissionGate } from '@/components/shared/PermissionGate'
import {
  Users,
  UserPlus,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Download,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { checkSeatAvailability } from './actions'

export default function TeamManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inviteInputRef = useRef<HTMLInputElement>(null)

  // Stats state
  const [certificates, setCertificates] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])

  // Remove member handler
  const handleRemoveMember = async (memberEmail: string) => {
    if (!window.confirm(`Remove ${memberEmail} from the organization?`)) return
    if (!organization) return

    setError(null)
    setSuccess(null)

    try {
      // Get member's user ID
      const { data: memberProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', memberEmail)
        .single()

      if (!memberProfile) {
        throw new Error('Member not found')
      }

      // ATOMIC SEAT RELEASE: Use database RPC with row-level locking
      const { data: result, error: rpcError } = await supabase.rpc('remove_member_with_seat_release', {
        p_user_id: memberProfile.id,
        p_organization_id: organization.id,
      })

      if (rpcError) throw rpcError

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove member')
      }

      setSuccess(`Successfully removed ${memberEmail} from the organization`)

      // Refresh member list
      await loadOrganizationData()
    } catch (err: any) {
      console.error('Failed to remove member:', err)
      setError('Failed to remove member: ' + (err.message || 'Unknown error'))
    }
  }

  // Invite member handler
  const handleInviteMember = async () => {
    if (!inviteEmail || !organization) return

    setInviteLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Check if already a member
      if (members.some((m: any) => m.email === inviteEmail)) {
        throw new Error('This user is already a member')
      }

      // Check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, organization_id')
        .eq('email', inviteEmail)
        .single()

      if (!existingProfile) {
        throw new Error('No user found with this email. User must create an account first.')
      }

      if (existingProfile.organization_id) {
        throw new Error('This user is already part of another organization')
      }

      // ATOMIC SEAT ENFORCEMENT: Use database RPC with row-level locking
      // This prevents race conditions when multiple admins add members simultaneously
      const { data: result, error: rpcError } = await supabase.rpc('add_member_with_seat_check', {
        p_user_id: existingProfile.id,
        p_organization_id: organization.id,
      })

      if (rpcError) throw rpcError

      // Check RPC result
      if (!result.success) {
        throw new Error(result.error || 'Failed to add member')
      }

      setSuccess(`Successfully invited ${inviteEmail} to the organization`)
      setShowInvite(false)
      setInviteEmail('')

      // Refresh member list
      await loadOrganizationData()
    } catch (err: any) {
      console.error('Failed to invite member:', err)
      setError('Failed to invite member: ' + (err.message || 'Unknown error'))
    } finally {
      setInviteLoading(false)
    }
  }

  const loadOrganizationData = async () => {
    if (!organization) return

    try {
      // Get members (profiles with matching organization_id)
      const { data: orgMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', organization.id)

      if (membersError) throw membersError
      setMembers(orgMembers || [])

      // Fetch certificates for all members
      const memberEmails = (orgMembers || []).map((m: any) => m.email).filter(Boolean)

      if (memberEmails.length > 0) {
        const { data: certs } = await supabase
          .from('certificates')
          .select('*')
          .in('user_email', memberEmails)
        setCertificates(certs || [])

        const { data: prog } = await supabase
          .from('progress')
          .select('*')
          .in('user_email', memberEmails)
        setProgress(prog || [])
      } else {
        setCertificates([])
        setProgress([])
      }
    } catch (err) {
      console.error('Error loading organization data:', err)
    }
  }

  useEffect(() => {
    const loadUserAndOrg = async () => {
      try {
        // Get current user
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()
        if (!currentUser) {
          setIsLoading(false)
          return
        }
        setUser(currentUser)

        // Get organization where user is admin
        const { data: orgs, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('admin_id', currentUser.id)
          .limit(1)

        if (!error && orgs && orgs.length > 0) {
          setOrganization(orgs[0])
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error loading user and organization:', err)
        setIsLoading(false)
      }
    }
    loadUserAndOrg()
  }, [])

  // Load organization data when organization is set
  useEffect(() => {
    if (organization) {
      loadOrganizationData()
    }
  }, [organization])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading team management...</p>
        </div>
      </div>
    )
  }

  if (!user || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {' '}
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-md text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Admin Access Required</h2>
            <p className="mb-6 text-gray-600">
              You must be an organization administrator to view this page.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>{' '}
      </div>
    )
  }

  // Calculate stats
  const seatCount = organization?.seat_count || 0
  const seatsAvailable = Math.max(0, seatCount - members.length)
  const certificatesEarned = certificates.length
  const activeLearners = progress
    .filter((p: any) => p.completion_percentage > 0)
    .map((p: any) => p.user_email)
    .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Users className="h-8 w-8" />
            Team Management
          </h1>
          <p className="mt-2 text-gray-600">Manage your organization members and track progress</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <Users className="h-6 w-6" /> Team Management
        </h1>
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">{organization.name}</div>
              <div className="text-sm text-gray-500">{organization.domain || organization.id}</div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default">{members.length} Members</Badge>
              <button
                className="ml-2 rounded bg-purple-600 px-3 py-1 text-white transition-colors hover:bg-purple-700"
                onClick={() => {
                  setShowInvite(true)
                  setTimeout(() => inviteInputRef.current?.focus(), 100)
                }}
              >
                Invite Member
              </button>
            </div>
          </div>
          {/* Invite Member Dialog */}
          {showInvite && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <button
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowInvite(false)}
                  aria-label="Close invite dialog"
                >
                  ×
                </button>
                <h2 className="mb-4 text-xl font-bold">Invite Team Member</h2>
                <input
                  ref={inviteInputRef}
                  type="email"
                  className="mb-4 w-full rounded border border-gray-200 px-3 py-2"
                  placeholder="member@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={inviteLoading}
                />
                <div className="flex justify-end gap-3">
                  <button
                    className="rounded bg-gray-100 px-4 py-2 hover:bg-gray-200"
                    onClick={() => setShowInvite(false)}
                    disabled={inviteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-60"
                    onClick={handleInviteMember}
                    disabled={!inviteEmail || inviteLoading}
                  >
                    {inviteLoading ? 'Inviting...' : 'Send Invitation'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          {/* Team/Org Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{members.length}</div>
              <div className="mt-1 text-sm text-gray-600">Total Members</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{certificatesEarned}</div>
              <div className="mt-1 text-sm text-gray-600">Certificates Earned</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">{seatsAvailable}</div>
              <div className="mt-1 text-sm text-gray-600">Seats Available</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{activeLearners}</div>
              <div className="mt-1 text-sm text-gray-600">Active Learners</div>
            </div>
          </div>
          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {members.map((member, idx) => (
                  <tr key={member.id || member.email}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <span className="font-semibold text-purple-700">
                            {(member.display_name || member.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.display_name || member.email}
                          </div>
                          <div className="text-xs text-gray-500">Member #{idx + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {member.email === organization?.admin_email ? (
                        <Badge className="bg-indigo-100 text-indigo-700">Admin</Badge>
                      ) : (
                        <Badge variant="outline">Member</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Badge variant="outline" className="text-gray-600">
                        Active
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <PermissionGate
                        permission={['users.manage', 'organizations.manage']}
                        requireAny
                      >
                        {member.email !== organization?.admin_email && (
                          <button
                            className="rounded p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleRemoveMember(member.email)}
                            title="Remove member"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>{' '}
    </div>
  )
}
