'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Save, Plus, X, Search } from 'lucide-react'
import { createSavedSearch, type SearchFilters } from '@/lib/services/case-alerts'

const JURISDICTIONS = [
  'Federal Court',
  'Fair Work Commission',
  'Human Rights Commission',
  'State Courts',
  'Administrative Appeals Tribunal',
]

const CASE_TYPES = [
  'Unfair Dismissal',
  'Discrimination',
  'Workplace Harassment',
  'Wage Theft',
  'Workplace Safety',
  'Bullying',
  'Redundancy',
]

const ALERT_FREQUENCIES = [
  { value: 'instant', label: 'Instant (as they happen)' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Summary' },
  { value: 'monthly', label: 'Monthly Report' },
]

const ALERT_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App Notifications' },
  { value: 'webhook', label: 'Webhook (API)' },
]

export default function NewSavedSearchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [searchName, setSearchName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<string[]>([])
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [relevanceThreshold, setRelevanceThreshold] = useState(0.5)
  const [alertEnabled, setAlertEnabled] = useState(true)
  const [alertFrequency, setAlertFrequency] = useState<'instant' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [selectedChannels, setSelectedChannels] = useState<('email' | 'in_app' | 'webhook')[]>(['email', 'in_app'])

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const toggleJurisdiction = (jurisdiction: string) => {
    if (selectedJurisdictions.includes(jurisdiction)) {
      setSelectedJurisdictions(selectedJurisdictions.filter(j => j !== jurisdiction))
    } else {
      setSelectedJurisdictions([...selectedJurisdictions, jurisdiction])
    }
  }

  const toggleCaseType = (caseType: string) => {
    if (selectedCaseTypes.includes(caseType)) {
      setSelectedCaseTypes(selectedCaseTypes.filter(c => c !== caseType))
    } else {
      setSelectedCaseTypes([...selectedCaseTypes, caseType])
    }
  }

  const toggleChannel = (channel: 'email' | 'in_app' | 'webhook') => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }

  const handleSave = async () => {
    if (!searchName.trim()) {
      alert('Please enter a search name')
      return
    }

    setLoading(true)
    try {
      const filters: SearchFilters = {
        keywords: keywords.length > 0 ? keywords : undefined,
        jurisdictions: selectedJurisdictions.length > 0 ? selectedJurisdictions : undefined,
        case_types: selectedCaseTypes.length > 0 ? selectedCaseTypes : undefined,
        decision_date_from: dateFrom || undefined,
        decision_date_to: dateTo || undefined,
        relevance_threshold: relevanceThreshold,
      }

      // TODO: Get actual user and org IDs from auth context
      await createSavedSearch(
        'user-id-placeholder',
        'org-id-placeholder',
        searchName,
        searchQuery || 'custom',
        filters,
        alertEnabled,
        alertFrequency,
        selectedChannels
      )

      router.push('/admin/case-alerts')
    } catch (error) {
      console.error('Failed to create saved search:', error)
      alert('Failed to create saved search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Saved Search</h1>
        <p className="text-muted-foreground mt-1">
          Set up a custom search and get notified about new tribunal cases
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Search Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="searchName">Search Name *</Label>
              <Input
                id="searchName"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., Discrimination Cases in Victoria"
              />
            </div>

            <div>
              <Label htmlFor="searchQuery">Description (optional)</Label>
              <Textarea
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe what this search is for..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Keywords */}
            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Enter keywords and press Enter"
                />
                <Button type="button" onClick={addKeyword} className="h-10 w-10 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Jurisdictions */}
            <div>
              <Label>Jurisdictions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {JURISDICTIONS.map((jurisdiction) => (
                  <div key={jurisdiction} className="flex items-center space-x-2">
                    <Checkbox
                      id={`jurisdiction-${jurisdiction}`}
                      checked={selectedJurisdictions.includes(jurisdiction)}
                      onCheckedChange={() => toggleJurisdiction(jurisdiction)}
                    />
                    <label
                      htmlFor={`jurisdiction-${jurisdiction}`}
                      className="text-sm cursor-pointer"
                    >
                      {jurisdiction}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Types */}
            <div>
              <Label>Case Types</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CASE_TYPES.map((caseType) => (
                  <div key={caseType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`casetype-${caseType}`}
                      checked={selectedCaseTypes.includes(caseType)}
                      onCheckedChange={() => toggleCaseType(caseType)}
                    />
                    <label
                      htmlFor={`casetype-${caseType}`}
                      className="text-sm cursor-pointer"
                    >
                      {caseType}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom">Decision Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Decision Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {/* Relevance Threshold */}
            <div>
              <Label htmlFor="relevance">
                Relevance Threshold: {Math.round(relevanceThreshold * 100)}%
              </Label>
              <input
                id="relevance"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={relevanceThreshold}
                onChange={(e) => setRelevanceThreshold(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Only show cases with at least this relevance score
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alert Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alertEnabled"
                checked={alertEnabled}
                onCheckedChange={(checked) => setAlertEnabled(checked as boolean)}
              />
              <label htmlFor="alertEnabled" className="text-sm cursor-pointer">
                Enable alerts for this search
              </label>
            </div>

            {alertEnabled && (
              <>
                <div>
                  <Label htmlFor="frequency">Alert Frequency</Label>
                  <Select
                    value={alertFrequency}
                    onValueChange={(value: any) => setAlertFrequency(value)}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Notification Channels</Label>
                  <div className="space-y-2 mt-2">
                    {ALERT_CHANNELS.map((channel) => (
                      <div key={channel.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`channel-${channel.value}`}
                          checked={selectedChannels.includes(channel.value as any)}
                          onCheckedChange={() => toggleChannel(channel.value as any)}
                        />
                        <label
                          htmlFor={`channel-${channel.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {channel.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Search'}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
