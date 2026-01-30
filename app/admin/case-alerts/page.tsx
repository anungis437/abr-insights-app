'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Edit,
  Search,
  Calendar,
  Filter,
  TrendingUp,
} from 'lucide-react'
import {
  getSavedSearches,
  deleteSavedSearch,
  updateSavedSearch,
  getCaseAlerts,
  type SavedSearch,
  type CaseAlert,
} from '@/lib/services/case-alerts'

export default function CaseAlertsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [recentAlerts, setRecentAlerts] = useState<CaseAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      if (!user?.id) return
      
      const searches = await getSavedSearches(user.id)
      setSavedSearches(searches)

      const alerts = await getCaseAlerts(user.id, false, 10)
      setRecentAlerts(alerts)

      const unread = alerts.filter((a) => !a.read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAlerts = async (searchId: string, currentValue: boolean) => {
    try {
      await updateSavedSearch(searchId, { alert_enabled: !currentValue })
      loadData()
    } catch (error) {
      console.error('Failed to toggle alerts:', error)
    }
  }

  const handleDelete = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return
    }

    try {
      await deleteSavedSearch(searchId)
      loadData()
    } catch (error) {
      console.error('Failed to delete search:', error)
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      instant: 'default',
      daily: 'secondary',
      weekly: 'outline',
      monthly: 'outline',
    }
    return variants[frequency] || 'outline'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading case alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Manage saved searches and get notified about new tribunal cases
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/case-alerts/alerts">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              View Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/case-alerts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Saved Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedSearches.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {savedSearches.filter((s) => s.alert_enabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Unread Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Recent Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAlerts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Searches List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Saved Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {savedSearches.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground mb-4">
                No saved searches yet. Create one to start tracking tribunal cases.
              </p>
              <Link href="/admin/case-alerts/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Search
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">{search.search_name}</h3>
                        {search.alert_enabled ? (
                          <Badge variant="default">
                            <Bell className="mr-1 h-3 w-3" />
                            Alerts On
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <BellOff className="mr-1 h-3 w-3" />
                            Alerts Off
                          </Badge>
                        )}
                        <Badge variant={getFrequencyBadge(search.alert_frequency)}>
                          {search.alert_frequency}
                        </Badge>
                      </div>

                      {search.search_query && (
                        <p className="text-muted-foreground mb-2 text-sm">{search.search_query}</p>
                      )}

                      {/* Search Filters Summary */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {search.search_filters.keywords &&
                          search.search_filters.keywords.length > 0 && (
                            <Badge variant="secondary" className="font-normal">
                              <Filter className="mr-1 h-3 w-3" />
                              {search.search_filters.keywords.length} keywords
                            </Badge>
                          )}
                        {search.search_filters.jurisdictions &&
                          search.search_filters.jurisdictions.length > 0 && (
                            <Badge variant="secondary" className="font-normal">
                              {search.search_filters.jurisdictions.length} jurisdictions
                            </Badge>
                          )}
                        {search.search_filters.case_types &&
                          search.search_filters.case_types.length > 0 && (
                            <Badge variant="secondary" className="font-normal">
                              {search.search_filters.case_types.length} case types
                            </Badge>
                          )}
                        {search.last_checked_at && (
                          <Badge variant="outline" className="font-normal">
                            <Calendar className="mr-1 h-3 w-3" />
                            Last checked: {new Date(search.last_checked_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      {/* Alert Channels */}
                      {search.alert_enabled && (
                        <div className="mt-2 flex gap-2">
                          {search.alert_channels.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleAlerts(search.id, search.alert_enabled)}
                      >
                        {search.alert_enabled ? (
                          <BellOff className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => router.push(`/admin/case-alerts/${search.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(search.id)}
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts Preview */}
      {recentAlerts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Link href="/admin/case-alerts/alerts">
                <Button variant="outline" className="h-8 px-3 text-sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded border p-3 ${!alert.read ? 'border-blue-200 bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{alert.alert_title}</h4>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {alert.alert_summary.substring(0, 120)}...
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Relevance: {Math.round(alert.relevance_score * 100)}%
                        </Badge>
                      </div>
                    </div>
                    {!alert.read && (
                      <Badge variant="default" className="ml-4">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
