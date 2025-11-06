'use client'

import { useState } from 'react'
import { Users, UserPlus, Mail, Shield, Settings, Search, Filter, MoreVertical, Crown, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

export default function TeamManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-16 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center gap-3">
              <Users className="h-12 w-12" />
              <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                Team Management
              </h1>
            </div>
            <p className="mb-8 text-xl text-blue-100">
              Manage your team members, roles, permissions, and collaborate effectively
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary border-2 border-white bg-white text-primary-600 hover:bg-gray-50">
                <UserPlus className="h-5 w-5" />
                Invite Team Member
              </button>
              <button className="btn-primary border-2 border-white bg-transparent text-white hover:bg-white/10">
                <Mail className="h-5 w-5" />
                Bulk Invite
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto -mt-8 max-w-6xl">
            <div className="grid gap-6 md:grid-cols-4">
              <StatCard
                label="Total Members"
                value="24"
                change="+3 this month"
                positive={true}
              />
              <StatCard
                label="Active Users"
                value="21"
                change="87.5% engagement"
                positive={true}
              />
              <StatCard
                label="Pending Invites"
                value="5"
                change="2 sent today"
                positive={false}
              />
              <StatCard
                label="Admins"
                value="3"
                change="12.5% of team"
                positive={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-full pl-10"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    aria-label="Filter by role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button className="btn-secondary">
                    <Filter className="h-5 w-5" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members List */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Team Members</h2>
            <div className="space-y-4">
              <TeamMemberCard
                name="Sarah Johnson"
                email="sarah.johnson@company.com"
                role="Admin"
                avatar="SJ"
                status="active"
                joinedDate="Jan 2024"
                lastActive="2 minutes ago"
                coursesCompleted={12}
                isOwner={true}
              />
              <TeamMemberCard
                name="Marcus Williams"
                email="marcus.williams@company.com"
                role="Manager"
                avatar="MW"
                status="active"
                joinedDate="Feb 2024"
                lastActive="1 hour ago"
                coursesCompleted={8}
              />
              <TeamMemberCard
                name="Jennifer Lee"
                email="jennifer.lee@company.com"
                role="Manager"
                avatar="JL"
                status="active"
                joinedDate="Feb 2024"
                lastActive="3 hours ago"
                coursesCompleted={10}
              />
              <TeamMemberCard
                name="Michael Brown"
                email="michael.brown@company.com"
                role="Member"
                avatar="MB"
                status="active"
                joinedDate="Mar 2024"
                lastActive="Yesterday"
                coursesCompleted={6}
              />
              <TeamMemberCard
                name="Lisa Thompson"
                email="lisa.thompson@company.com"
                role="Member"
                avatar="LT"
                status="active"
                joinedDate="Mar 2024"
                lastActive="2 days ago"
                coursesCompleted={5}
              />
              <TeamMemberCard
                name="David Chen"
                email="david.chen@company.com"
                role="Member"
                avatar="DC"
                status="active"
                joinedDate="Apr 2024"
                lastActive="1 week ago"
                coursesCompleted={3}
              />
              <TeamMemberCard
                name="Emily Rodriguez"
                email="emily.rodriguez@company.com"
                role="Viewer"
                avatar="ER"
                status="pending"
                joinedDate="Invited Nov 2024"
                lastActive="Never"
                coursesCompleted={0}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Roles & Permissions */}
      <section className="bg-white px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Roles & Permissions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <RoleCard
                role="Admin"
                icon={<Crown className="h-6 w-6" />}
                color="purple"
                memberCount={3}
                permissions={[
                  'Full platform access',
                  'Manage team members',
                  'Billing & subscriptions',
                  'All course access',
                  'Analytics & reports',
                  'System settings'
                ]}
              />
              <RoleCard
                role="Manager"
                icon={<Shield className="h-6 w-6" />}
                color="blue"
                memberCount={8}
                permissions={[
                  'Team member management',
                  'Assign courses',
                  'View team analytics',
                  'All course access',
                  'Export reports'
                ]}
              />
              <RoleCard
                role="Member"
                icon={<Users className="h-6 w-6" />}
                color="green"
                memberCount={11}
                permissions={[
                  'Access assigned courses',
                  'View own progress',
                  'Download certificates',
                  'Case explorer access',
                  'Community features'
                ]}
              />
              <RoleCard
                role="Viewer"
                icon={<Settings className="h-6 w-6" />}
                color="gray"
                memberCount={2}
                permissions={[
                  'View team progress',
                  'Read-only access',
                  'Basic reports',
                  'No course enrollment'
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Activity */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Recent Team Activity</h2>
            <div className="card">
              <div className="space-y-4">
                <ActivityItem
                  user="Marcus Williams"
                  action="completed the course"
                  detail="Workplace Accommodation Fundamentals"
                  time="2 hours ago"
                  type="course"
                />
                <ActivityItem
                  user="Jennifer Lee"
                  action="invited"
                  detail="3 new team members"
                  time="5 hours ago"
                  type="invite"
                />
                <ActivityItem
                  user="Sarah Johnson"
                  action="updated team permissions for"
                  detail="Michael Brown"
                  time="Yesterday"
                  type="permission"
                />
                <ActivityItem
                  user="Lisa Thompson"
                  action="earned the badge"
                  detail="EDI Champion"
                  time="2 days ago"
                  type="achievement"
                />
                <ActivityItem
                  user="David Chen"
                  action="started the course"
                  detail="Understanding Systemic Racism"
                  time="3 days ago"
                  type="course"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Tools */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Enhance Team Collaboration</h2>
            <p className="mb-8 text-xl text-blue-100">
              Unlock advanced features to improve team learning and coordination
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <CollaborationFeature
                title="Learning Paths"
                description="Create custom training sequences for different roles"
              />
              <CollaborationFeature
                title="Discussion Groups"
                description="Foster knowledge sharing with team forums"
              />
              <CollaborationFeature
                title="Cohort Learning"
                description="Schedule group sessions and track collective progress"
              />
            </div>
            <button className="btn-primary mt-8 border-2 border-white bg-white text-primary-600 hover:bg-gray-50">
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  positive
}: {
  label: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="card text-center">
      <p className="mb-2 text-sm font-medium text-gray-600">{label}</p>
      <p className="mb-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className={`text-sm ${positive ? 'text-green-600' : 'text-gray-600'}`}>
        {change}
      </p>
    </div>
  )
}

function TeamMemberCard({
  name,
  email,
  role,
  avatar,
  status,
  joinedDate,
  lastActive,
  coursesCompleted,
  isOwner = false
}: {
  name: string
  email: string
  role: string
  avatar: string
  status: 'active' | 'pending'
  joinedDate: string
  lastActive: string
  coursesCompleted: number
  isOwner?: boolean
}) {
  const roleColors = {
    'Admin': 'bg-purple-100 text-purple-700',
    'Manager': 'bg-blue-100 text-blue-700',
    'Member': 'bg-green-100 text-green-700',
    'Viewer': 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="card group transition-all hover:shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 text-lg font-bold text-white">
            {avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{name}</h3>
              {isOwner && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                  <Crown className="h-3 w-3" />
                  Owner
                </span>
              )}
              {status === 'pending' && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col items-center">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColors[role as keyof typeof roleColors]}`}>
              {role}
            </span>
          </div>
          
          <div className="hidden text-sm text-gray-600 lg:block">
            <p><strong>Joined:</strong> {joinedDate}</p>
            <p><strong>Last active:</strong> {lastActive}</p>
          </div>

          <div className="hidden text-center md:block">
            <p className="text-2xl font-bold text-gray-900">{coursesCompleted}</p>
            <p className="text-xs text-gray-600">Courses</p>
          </div>

          <div className="flex gap-2">
            <button aria-label="Edit team member" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-primary-600">
              <Edit className="h-5 w-5" />
            </button>
            <button aria-label="More options" className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleCard({
  role,
  icon,
  color,
  memberCount,
  permissions
}: {
  role: string
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'green' | 'gray'
  memberCount: number
  permissions: string[]
}) {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-700 border-purple-600',
    blue: 'from-blue-600 to-blue-700 border-blue-600',
    green: 'from-green-600 to-green-700 border-green-600',
    gray: 'from-gray-600 to-gray-700 border-gray-600'
  }

  return (
    <div className={`card border-l-4 ${colorClasses[color]}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex items-center gap-2 rounded-lg bg-gradient-to-r p-2 text-white ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-sm text-gray-600">{memberCount} members</span>
      </div>
      <h3 className="mb-3 text-xl font-bold text-gray-900">{role}</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {permissions.map((permission, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            {permission}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityItem({
  user,
  action,
  detail,
  time,
  type
}: {
  user: string
  action: string
  detail: string
  time: string
  type: 'course' | 'invite' | 'permission' | 'achievement'
}) {
  const iconMap = {
    course: <CheckCircle className="h-5 w-5 text-green-600" />,
    invite: <UserPlus className="h-5 w-5 text-blue-600" />,
    permission: <Shield className="h-5 w-5 text-purple-600" />,
    achievement: <Crown className="h-5 w-5 text-yellow-600" />
  }

  return (
    <div className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="mt-1">{iconMap[type]}</div>
      <div className="flex-1">
        <p className="text-gray-900">
          <strong>{user}</strong> {action} <strong>{detail}</strong>
        </p>
        <p className="text-sm text-gray-600">{time}</p>
      </div>
    </div>
  )
}

function CollaborationFeature({
  title,
  description
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-blue-100">{description}</p>
    </div>
  )
}
