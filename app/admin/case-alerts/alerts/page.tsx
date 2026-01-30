'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  CheckCircle,
  ExternalLink,
  Filter,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import {
  getCaseAlerts,
  markAlertRead,
  markAllAlertsRead,
  type CaseAlert,
} from '@/lib/services/case-alerts'
import Link from 'next/link'

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<CaseAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    loadAlerts()
  }, [filter])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      // TODO: Get actual user ID from auth context
      const data = await getCaseAlerts('user-id-placeholder', filter === 'unread', 100)
      setAlerts(data)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (alertId: string) => {
    try {
      await markAlertRead(alertId)
      loadAlerts()
    } catch (error) {
      console.error('Failed to mark alert as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      // TODO: Get actual user ID from auth context
      await markAllAlertsRead('user-id-placeholder')
      loadAlerts()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'new_case':
        return <Bell className="h-4 w-4" />
      case 'case_updated':
        return <TrendingUp className="h-4 w-4" />
      case 'related_case':
        return <Filter className="h-4 w-4" />
      case 'digest':
        return <Calendar className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getAlertTypeLabel = (alertType: string) => {
    return alertType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600'
    if (score >= 0.6) return 'text-orange-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-blue-600'
  }

  const unreadCount = alerts.filter(a => !a.read).length

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Case Alerts</h1>
          <p className="text-muted-foreground mt-1">
            New tribunal cases matching your saved searches
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.relevance_score >= 0.8).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            All Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {filter === 'unread' 
                  ? 'No unread alerts. You\'re all caught up!'
                  : 'No alerts yet. Create a saved search to start receiving notifications.'}
              </p>
              <Link href="/admin/case-alerts">
                <Button variant="outline">
                  Manage Saved Searches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`${!alert.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`mt-1 ${!alert.read ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{alert.alert_title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.case_title}
                        </p>
                      </div>
                      {!alert.read && (
                        <Badge variant="default" className="ml-4">
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.alert_summary}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {getAlertIcon(alert.alert_type)}
                        <span className="ml-1">{getAlertTypeLabel(alert.alert_type)}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(alert.decision_date).toLocaleDateString()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getRelevanceColor(alert.relevance_score)}`}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {Math.round(alert.relevance_score * 100)}% relevant
                      </Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/tribunal-cases/${alert.tribunal_case_id}`}>
                        <Button variant="outline" className="h-8 px-3 text-sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Case
                        </Button>
                      </Link>
                      {!alert.read && (
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-sm"
                          onClick={() => handleMarkRead(alert.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
