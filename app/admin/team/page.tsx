"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PermissionGate } from '@/components/shared/PermissionGate';
import { Users, UserPlus, Mail, Trash2, CheckCircle, Clock, AlertCircle, ArrowLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TeamManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
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
      // Remove member by setting their organization_id to null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ organization_id: null })
        .eq('email', memberEmail)
        
      if (updateError) throw updateError
      
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
        throw new Error("This user is already a member")
      }
      
      // Check if user exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, organization_id')
        .eq('email', inviteEmail)
        .single()
      
      if (!existingProfile) {
        throw new Error("No user found with this email. User must create an account first.")
      }
      
      if (existingProfile.organization_id) {
        throw new Error("This user is already part of another organization")
      }
      
      // Add member (update profile.organization_id)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ organization_id: organization.id })
        .eq('email', inviteEmail)
        
      if (updateError) throw updateError
      
      setSuccess(`Successfully invited ${inviteEmail} to the organization`)
      setShowInvite(false)
      setInviteEmail("")
      
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
        const { data: { user: currentUser } } = await supabase.auth.getUser()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team management...</p>
        </div>
      </div>
    )
  }
  
  if (!user || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">        <div className="container mx-auto py-16 px-4">
          <div className="max-w-md mx-auto text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              You must be an organization administrator to view this page.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>      </div>
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
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8" /> 
            Team Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your organization members and track progress</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users className="w-6 h-6" /> Team Management
      </h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">{organization.name}</div>
            <div className="text-gray-500 text-sm">{organization.domain || organization.id}</div>
          </div>
          <div className="flex gap-4 items-center">
            <Badge variant="default">{members.length} Members</Badge>
            <button
              className="ml-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowInvite(false)}
                aria-label="Close invite dialog"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Invite Team Member</h2>
              <input
                ref={inviteInputRef}
                type="email"
                className="w-full border border-gray-200 rounded px-3 py-2 mb-4"
                placeholder="member@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  onClick={() => setShowInvite(false)}
                  disabled={inviteLoading}
                >Cancel</button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
                  onClick={handleInviteMember}
                  disabled={!inviteEmail || inviteLoading}
                >{inviteLoading ? 'Inviting...' : 'Send Invitation'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {/* Team/Org Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{members.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Members</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{certificatesEarned}</div>
            <div className="text-sm text-gray-600 mt-1">Certificates Earned</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{seatsAvailable}</div>
            <div className="text-sm text-gray-600 mt-1">Seats Available</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{activeLearners}</div>
            <div className="text-sm text-gray-600 mt-1">Active Learners</div>
          </div>
        </div>
        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member, idx) => (
                <tr key={member.id || member.email}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-semibold">
                          {(member.display_name || member.email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.display_name || member.email}</div>
                        <div className="text-xs text-gray-500">Member #{idx + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.email === organization?.admin_email ? (
                      <Badge className="bg-indigo-100 text-indigo-700">Admin</Badge>
                    ) : (
                      <Badge variant="outline">Member</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="text-gray-600">Active</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <PermissionGate permissions={['users.manage', 'organizations.manage']}>
                      {member.email !== organization?.admin_email && (
                        <button
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-2"
                          onClick={() => handleRemoveMember(member.email)}
                          title="Remove member"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
      </div>    </div>
  )
}
