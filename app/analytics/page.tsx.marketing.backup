'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, Users, BookOpen, Award, Target, Calendar, Download, Filter, ArrowUp, ArrowDown, Eye, Clock, CheckCircle, Star } from 'lucide-react'
import Navigation from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 pb-16 pt-32 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center gap-3">
              <BarChart3 className="h-12 w-12" />
              <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
                Analytics Dashboard
              </h1>
            </div>
            <p className="mb-8 text-xl text-blue-100">
              Track learning progress, engagement, and organizational impact with comprehensive insights
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary border-2 border-white bg-white text-primary-600 hover:bg-gray-50">
                <Download className="h-5 w-5" />
                Export Report
              </button>
              <button className="btn-primary border-2 border-white bg-transparent text-white hover:bg-white/10">
                <Calendar className="h-5 w-5" />
                Schedule Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Time Range Selector */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto -mt-8 max-w-6xl">
            <div className="card">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  <TimeRangeButton
                    label="7 Days"
                    value="7d"
                    isActive={timeRange === '7d'}
                    onClick={() => setTimeRange('7d')}
                  />
                  <TimeRangeButton
                    label="30 Days"
                    value="30d"
                    isActive={timeRange === '30d'}
                    onClick={() => setTimeRange('30d')}
                  />
                  <TimeRangeButton
                    label="90 Days"
                    value="90d"
                    isActive={timeRange === '90d'}
                    onClick={() => setTimeRange('90d')}
                  />
                  <TimeRangeButton
                    label="1 Year"
                    value="1y"
                    isActive={timeRange === '1y'}
                    onClick={() => setTimeRange('1y')}
                  />
                  <TimeRangeButton
                    label="All Time"
                    value="all"
                    isActive={timeRange === 'all'}
                    onClick={() => setTimeRange('all')}
                  />
                </div>
                <select
                  aria-label="Filter metrics"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Metrics</option>
                  <option value="learning">Learning Progress</option>
                  <option value="engagement">User Engagement</option>
                  <option value="completion">Course Completion</option>
                  <option value="impact">Business Impact</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Key Performance Indicators</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={<Users className="h-6 w-6" />}
                label="Active Learners"
                value="1,247"
                change="+12.3%"
                trend="up"
                color="blue"
              />
              <MetricCard
                icon={<BookOpen className="h-6 w-6" />}
                label="Courses Completed"
                value="3,482"
                change="+23.1%"
                trend="up"
                color="green"
              />
              <MetricCard
                icon={<Clock className="h-6 w-6" />}
                label="Learning Hours"
                value="18,924"
                change="+15.7%"
                trend="up"
                color="purple"
              />
              <MetricCard
                icon={<Award className="h-6 w-6" />}
                label="Certificates Issued"
                value="2,156"
                change="+31.4%"
                trend="up"
                color="yellow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Course Completion Trend */}
              <div className="card">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Course Completion Trend</h3>
                  <button className="btn-secondary text-sm">
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                </div>
                <div className="h-64 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 p-6">
                  {/* Placeholder for chart - would use Recharts/Chart.js in production */}
                  <div className="flex h-full items-end justify-around gap-2">
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '45%' }}></div>
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '62%' }}></div>
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '58%' }}></div>
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '71%' }}></div>
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '68%' }}></div>
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '83%' }}></div>
                    <div className="w-full rounded-t-lg bg-primary-600" style={{ height: '89%' }}></div>
                  </div>
                </div>
                <div className="mt-4 flex justify-around text-sm text-gray-600">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              {/* User Engagement */}
              <div className="card">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">User Engagement</h3>
                  <button className="btn-secondary text-sm">
                    <Eye className="h-4 w-4" />
                    Details
                  </button>
                </div>
                <div className="h-64 rounded-lg bg-gradient-to-br from-green-100 to-teal-100 p-6">
                  {/* Placeholder for donut chart */}
                  <div className="flex h-full items-center justify-center">
                    <div className="relative h-40 w-40">
                      <div className="absolute inset-0 rounded-full border-[30px] border-green-600"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-gray-900">87%</p>
                          <p className="text-sm text-gray-600">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-green-600"></span>
                      Active Users
                    </span>
                    <strong>87%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-yellow-600"></span>
                      Moderate
                    </span>
                    <strong>10%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                      Inactive
                    </span>
                    <strong>3%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Progress by Category */}
      <section className="px-4 py-8">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Learning Progress by Category</h2>
            <div className="card">
              <div className="space-y-6">
                <ProgressBar
                  label="Discrimination & Equity"
                  current={1245}
                  total={1500}
                  color="purple"
                />
                <ProgressBar
                  label="Workplace Harassment"
                  current={892}
                  total={1200}
                  color="blue"
                />
                <ProgressBar
                  label="Accommodation Practices"
                  current={678}
                  total={900}
                  color="green"
                />
                <ProgressBar
                  label="Legal Compliance"
                  current={534}
                  total={800}
                  color="yellow"
                />
                <ProgressBar
                  label="Policy Development"
                  current={423}
                  total={600}
                  color="red"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="bg-white px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Top Performers</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Most Engaged Learners */}
              <div className="card">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Most Engaged Learners</h3>
                <div className="space-y-4">
                  <LeaderboardItem
                    rank={1}
                    name="Sarah Johnson"
                    metric="32 courses completed"
                    avatar="SJ"
                  />
                  <LeaderboardItem
                    rank={2}
                    name="Marcus Williams"
                    metric="28 courses completed"
                    avatar="MW"
                  />
                  <LeaderboardItem
                    rank={3}
                    name="Jennifer Lee"
                    metric="24 courses completed"
                    avatar="JL"
                  />
                  <LeaderboardItem
                    rank={4}
                    name="Michael Brown"
                    metric="22 courses completed"
                    avatar="MB"
                  />
                  <LeaderboardItem
                    rank={5}
                    name="Lisa Thompson"
                    metric="20 courses completed"
                    avatar="LT"
                  />
                </div>
              </div>

              {/* Most Popular Courses */}
              <div className="card">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Most Popular Courses</h3>
                <div className="space-y-4">
                  <CourseRankItem
                    rank={1}
                    title="Understanding Systemic Racism"
                    enrollments={487}
                    rating={4.9}
                  />
                  <CourseRankItem
                    rank={2}
                    title="Inclusive Hiring Practices"
                    enrollments={423}
                    rating={4.8}
                  />
                  <CourseRankItem
                    rank={3}
                    title="Workplace Accommodation"
                    enrollments={398}
                    rating={4.7}
                  />
                  <CourseRankItem
                    rank={4}
                    title="Anti-Black Racism Awareness"
                    enrollments={375}
                    rating={4.9}
                  />
                  <CourseRankItem
                    rank={5}
                    title="Complaint Investigation"
                    enrollments={342}
                    rating={4.8}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Impact */}
      <section className="px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Organizational Impact</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <ImpactCard
                icon={<Target className="h-8 w-8" />}
                title="Compliance Rate"
                value="94%"
                description="Organizations meeting training requirements"
                trend="up"
                change="+8% from last quarter"
              />
              <ImpactCard
                icon={<CheckCircle className="h-8 w-8" />}
                title="Incident Reduction"
                value="37%"
                description="Decrease in reported workplace incidents"
                trend="up"
                change="+12% improvement"
              />
              <ImpactCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Employee Satisfaction"
                value="4.6/5"
                description="Average satisfaction score post-training"
                trend="up"
                change="+0.4 from baseline"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Department Comparison */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Department Comparison</h2>
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-4 pr-4 font-semibold text-gray-900">Department</th>
                    <th className="pb-4 pr-4 font-semibold text-gray-900">Members</th>
                    <th className="pb-4 pr-4 font-semibold text-gray-900">Completion Rate</th>
                    <th className="pb-4 pr-4 font-semibold text-gray-900">Avg. Score</th>
                    <th className="pb-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <DepartmentRow
                    name="Human Resources"
                    members={24}
                    completionRate={96}
                    avgScore={89}
                    status="excellent"
                  />
                  <DepartmentRow
                    name="Operations"
                    members={45}
                    completionRate={87}
                    avgScore={82}
                    status="good"
                  />
                  <DepartmentRow
                    name="Sales & Marketing"
                    members={32}
                    completionRate={91}
                    avgScore={85}
                    status="excellent"
                  />
                  <DepartmentRow
                    name="IT & Technology"
                    members={28}
                    completionRate={84}
                    avgScore={80}
                    status="good"
                  />
                  <DepartmentRow
                    name="Customer Service"
                    members={38}
                    completionRate={72}
                    avgScore={76}
                    status="needs-improvement"
                  />
                  <DepartmentRow
                    name="Finance"
                    members={18}
                    completionRate={94}
                    avgScore={88}
                    status="excellent"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Export & Reporting */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold">Advanced Reporting</h2>
            <p className="mb-8 text-xl text-blue-100">
              Generate custom reports, schedule automated insights, and share with stakeholders
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <ReportingFeature
                title="Custom Reports"
                description="Build tailored reports with your specific metrics"
              />
              <ReportingFeature
                title="Automated Delivery"
                description="Schedule weekly or monthly report emails"
              />
              <ReportingFeature
                title="Data Export"
                description="Export raw data in CSV, Excel, or PDF formats"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function TimeRangeButton({
  label,
  value,
  isActive,
  onClick
}: {
  label: string
  value: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

function MetricCard({
  icon,
  label,
  value,
  change,
  trend,
  color
}: {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  color: 'blue' | 'green' | 'purple' | 'yellow'
}) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    purple: 'from-purple-600 to-purple-700',
    yellow: 'from-yellow-600 to-yellow-700'
  }

  return (
    <div className="card">
      <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-r p-3 text-white ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="mb-2 text-sm font-medium text-gray-600">{label}</p>
      <p className="mb-2 text-3xl font-bold text-gray-900">{value}</p>
      <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        <span className="font-medium">{change}</span>
        <span className="text-gray-600">vs last period</span>
      </div>
    </div>
  )
}

function ProgressBar({
  label,
  current,
  total,
  color
}: {
  label: string
  current: number
  total: number
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'red'
}) {
  const percentage = Math.round((current / total) * 100)
  
  const colorClasses = {
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{label}</h4>
        <span className="text-sm text-gray-600">
          {current.toLocaleString()} / {total.toLocaleString()} ({percentage}%)
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function LeaderboardItem({
  rank,
  name,
  metric,
  avatar
}: {
  rank: number
  name: string
  metric: string
  avatar: string
}) {
  const medalColors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-gray-300 to-gray-500',
    3: 'from-orange-400 to-orange-600'
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${
          rank <= 3 ? `bg-gradient-to-br ${medalColors[rank as keyof typeof medalColors]}` : 'bg-gray-400'
        }`}
      >
        {rank}
      </div>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 text-sm font-bold text-white">
        {avatar}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{metric}</p>
      </div>
    </div>
  )
}

function CourseRankItem({
  rank,
  title,
  enrollments,
  rating
}: {
  rank: number
  title: string
  enrollments: number
  rating: number
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700">
        {rank}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{enrollments} enrollments</span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {rating}
          </span>
        </div>
      </div>
    </div>
  )
}

function ImpactCard({
  icon,
  title,
  value,
  description,
  trend,
  change
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  trend: 'up' | 'down'
  change: string
}) {
  return (
    <div className="card text-center">
      <div className="mb-4 flex justify-center text-primary-600">
        {icon}
      </div>
      <h3 className="mb-2 text-sm font-medium text-gray-600">{title}</h3>
      <p className="mb-2 text-4xl font-bold text-gray-900">{value}</p>
      <p className="mb-3 text-sm text-gray-600">{description}</p>
      <div className={`flex items-center justify-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        <span className="font-medium">{change}</span>
      </div>
    </div>
  )
}

function DepartmentRow({
  name,
  members,
  completionRate,
  avgScore,
  status
}: {
  name: string
  members: number
  completionRate: number
  avgScore: number
  status: 'excellent' | 'good' | 'needs-improvement'
}) {
  const statusConfig = {
    'excellent': { label: 'Excellent', class: 'bg-green-100 text-green-700' },
    'good': { label: 'Good', class: 'bg-blue-100 text-blue-700' },
    'needs-improvement': { label: 'Needs Improvement', class: 'bg-orange-100 text-orange-700' }
  }

  return (
    <tr className="border-b last:border-b-0">
      <td className="py-4 pr-4 font-medium text-gray-900">{name}</td>
      <td className="py-4 pr-4 text-gray-700">{members}</td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <span className="text-gray-700">{completionRate}%</span>
        </div>
      </td>
      <td className="py-4 pr-4 text-gray-700">{avgScore}%</td>
      <td className="py-4">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[status].class}`}>
          {statusConfig[status].label}
        </span>
      </td>
    </tr>
  )
}

function ReportingFeature({
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
