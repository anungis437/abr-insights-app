'use client'

import { logger } from '@/lib/utils/production-logger'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Bell, Mail, Webhook, Clock } from 'lucide-react'
import {
  getAlertPreferences,
  updateAlertPreferences,
  type AlertPreferences,
} from '@/lib/services/case-alerts'

export default function AlertPreferencesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [inAppNotifications, setInAppNotifications] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [digestFrequency, setDigestFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [quietHoursStart, setQuietHoursStart] = useState('')
  const [quietHoursEnd, setQuietHoursEnd] = useState('')
  const [notificationGrouping, setNotificationGrouping] = useState(true)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const prefs = await getAlertPreferences(user.id)

      if (prefs) {
        setEmailNotifications(prefs.email_notifications)
        setInAppNotifications(prefs.in_app_notifications)
        setWebhookUrl(prefs.webhook_url || '')
        setDigestFrequency(prefs.digest_frequency)
        setQuietHoursStart(prefs.quiet_hours_start || '')
        setQuietHoursEnd(prefs.quiet_hours_end || '')
        setNotificationGrouping(prefs.notification_grouping)
      }
    } catch (error) {
      logger.error('Failed to load preferences:', { error: error, context: 'AlertPreferencesPage' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    try {
      await updateAlertPreferences(user.id, {
        email_notifications: emailNotifications,
        in_app_notifications: inAppNotifications,
        webhook_url: webhookUrl || undefined,
        digest_frequency: digestFrequency,
        quiet_hours_start: quietHoursStart || undefined,
        quiet_hours_end: quietHoursEnd || undefined,
        notification_grouping: notificationGrouping,
      })

      alert('Preferences saved successfully!')
      router.push('/admin/case-alerts')
    } catch (error) {
      logger.error('Failed to save preferences:', { error: error, context: 'AlertPreferencesPage' })
      alert('Failed to save preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alert Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Configure how and when you receive case alert notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
              />
              <Mail className="text-muted-foreground h-4 w-4" />
              <label htmlFor="emailNotifications" className="cursor-pointer text-sm">
                Email notifications
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inAppNotifications"
                checked={inAppNotifications}
                onCheckedChange={(checked) => setInAppNotifications(checked as boolean)}
              />
              <Bell className="text-muted-foreground h-4 w-4" />
              <label htmlFor="inAppNotifications" className="cursor-pointer text-sm">
                In-app notifications
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center space-x-2">
                <Webhook className="text-muted-foreground h-4 w-4" />
                <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
              </div>
              <Input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-webhook-url.com/alerts"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                POST requests will be sent to this URL when new alerts are generated
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Digest Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Digest Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="digestFrequency">
                How often should we send you a digest summary?
              </Label>
              <Select
                value={digestFrequency}
                onValueChange={(value: any) => setDigestFrequency(value)}
              >
                <SelectTrigger id="digestFrequency" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground mt-1 text-xs">
                Digests provide a summary of all alerts in the selected period
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <p className="text-muted-foreground text-sm">
                  Don't send notifications during these hours (optional)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quietStart">Start Time</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quietEnd">End Time</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                Example: 22:00 to 08:00 to avoid notifications at night
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificationGrouping"
                checked={notificationGrouping}
                onCheckedChange={(checked) => setNotificationGrouping(checked as boolean)}
              />
              <label htmlFor="notificationGrouping" className="cursor-pointer text-sm">
                Group multiple alerts into a single notification
              </label>
            </div>
            <p className="text-muted-foreground text-xs">
              When enabled, alerts from the same saved search will be batched together to reduce
              notification fatigue
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
