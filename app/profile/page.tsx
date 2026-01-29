'use client'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

/**
 * Profile Page
 * User profile management - view and edit personal information
 * Part of Phase 5: Authenticated Pages Migration
 */

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Globe,
  Bell,
  Save,
  Camera,
  Trophy,
  Star,
  TrendingUp,
  Users as UsersIcon,
  Flame,
  Award,
} from 'lucide-react'
import {
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
  updateNotificationPreferences,
  type Profile,
  type UpdateProfileData,
} from '@/lib/supabase/services/profiles'
import { createClient } from '@/lib/supabase/client'
import { gamificationService } from '@/lib/services/gamification'
import { socialService } from '@/lib/services/social'
import { AchievementList, UserStreaks } from '@/components/achievements'
import type {
  UserAchievement,
  UserStreak,
  UserLevel,
  PointsSummary,
} from '@/lib/services/gamification'
import type { SocialSummary } from '@/lib/services/social'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState<UpdateProfileData>({})
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Gamification state
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [streaks, setStreaks] = useState<UserStreak[]>([])
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null)
  const [pointsSummary, setPointsSummary] = useState<PointsSummary | null>(null)
  const [socialSummary, setSocialSummary] = useState<SocialSummary | null>(null)
  const [loadingGamification, setLoadingGamification] = useState(true)

  async function checkAuthAndLoadData() {
    if (typeof window === 'undefined') return
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?redirect=/profile')
      return
    }

    await loadProfile()
  }

  async function loadProfile() {
    try {
      const profileData = await getCurrentProfile()

      if (profileData) {
        setProfile(profileData)
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          display_name: profileData.display_name || '',
          job_title: profileData.job_title || '',
          department: profileData.department || '',
          language: profileData.language,
          timezone: profileData.timezone,
        })

        // Load gamification data
        await loadGamificationData(profileData.id)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  async function loadGamificationData(userId: string) {
    setLoadingGamification(true)
    try {
      // Load achievements, streaks, level, points, and social data in parallel
      const [achievementsData, streaksData, levelData, pointsData, socialData] = await Promise.all([
        gamificationService.getUserAchievements(userId),
        gamificationService.getUserStreaks(userId),
        gamificationService.getUserLevel(userId),
        gamificationService.getUserPointsSummary(userId),
        socialService.getUserSocialSummary(userId),
      ])

      setAchievements(achievementsData)
      setStreaks(streaksData)
      setUserLevel(levelData)
      setPointsSummary(pointsData)
      setSocialSummary(socialData)
    } catch (error) {
      // Silently handle gamification data errors - features may not be fully set up
      // Only log if there's actual error content
      if (error && typeof error === 'object' && Object.keys(error).length > 0) {
        console.error('Error loading gamification data:', error)
      }
    } finally {
      setLoadingGamification(false)
    }
  }

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const updated = await updateProfile(formData)
      setProfile(updated)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be smaller than 2MB' })
      return
    }

    setUploadingAvatar(true)
    setMessage(null)

    try {
      const publicUrl = await uploadAvatar(file)

      // Update local state
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl })
      }

      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleNotificationChange(key: 'email' | 'push' | 'in_app', value: boolean) {
    try {
      const updated = await updateNotificationPreferences({ [key]: value })
      setProfile(updated)
    } catch (error) {
      console.error('Error updating notifications:', error)
      setMessage({ type: 'error', text: 'Failed to update notification preferences' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {' '}
        <div className="container-custom py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container-custom py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-red-600">Profile not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container-custom py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-gray-600">Manage your personal information and preferences</p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Gamification Stats */}
          {!loadingGamification && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Level Card */}
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <Trophy className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Level</span>
                </div>
                <div className="mb-1 text-4xl font-bold">{userLevel?.current_level || 1}</div>
                <div className="text-sm opacity-90">
                  {userLevel
                    ? `${userLevel.current_xp.toLocaleString()} / ${userLevel.xp_for_next_level.toLocaleString()} XP`
                    : '0 XP'}
                </div>
              </div>

              {/* Points Card */}
              <div className="rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <Star className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Points</span>
                </div>
                <div className="mb-1 text-4xl font-bold">
                  {pointsSummary?.total_earned.toLocaleString() || 0}
                </div>
                <div className="text-sm opacity-90">
                  {pointsSummary?.current_balance.toLocaleString() || 0} available
                </div>
              </div>

              {/* Achievements Card */}
              <div className="rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <Award className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Achievements</span>
                </div>
                <div className="mb-1 text-4xl font-bold">{achievements.length}</div>
                <div className="text-sm opacity-90">badges earned</div>
              </div>

              {/* Social Card */}
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <UsersIcon className="h-8 w-8" />
                  <span className="text-sm font-medium opacity-90">Connections</span>
                </div>
                <div className="mb-1 text-4xl font-bold">
                  {(socialSummary?.followers_count || 0) + (socialSummary?.following_count || 0)}
                </div>
                <div className="text-sm opacity-90">
                  {socialSummary?.followers_count || 0} followers ·{' '}
                  {socialSummary?.following_count || 0} following
                </div>
              </div>
            </div>
          )}

          {/* Streaks Section */}
          {!loadingGamification && streaks.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Flame className="h-6 w-6 text-orange-500" />
                Your Streaks
              </h2>
              <UserStreaks streaks={streaks} />
            </div>
          )}

          {/* Achievements Section */}
          {!loadingGamification && achievements.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Your Achievements
              </h2>
              <AchievementList achievements={achievements} showFilters={true} columns={4} />
            </div>
          )}

          {/* Avatar Section */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Profile Photo</h2>

            <div className="flex items-center gap-6">
              <div className="relative">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Profile'}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <User className="h-12 w-12" />
                  </div>
                )}

                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="avatar-upload" className="btn-outline cursor-pointer">
                  <Camera className="mr-2 h-5 w-5" />
                  {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
                <p className="mt-2 text-sm text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Personal Information</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="first_name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input-field"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="display_name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Display Name
                  </label>
                  <input
                    id="display_name"
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="input-field"
                    placeholder="How you want to be addressed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-5 w-5" />
                    <span>{profile.email}</span>
                    {profile.email_verified && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Professional Information</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="job_title"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    <Briefcase className="mr-1 inline h-4 w-4" />
                    Job Title
                  </label>
                  <input
                    id="job_title"
                    type="text"
                    value={formData.job_title || ''}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="input-field"
                    placeholder="HR Manager"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    <Building2 className="mr-1 inline h-4 w-4" />
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                    placeholder="Human Resources"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                <Globe className="mr-2 inline h-5 w-5" />
                Preferences
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="language"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Language
                  </label>
                  <select
                    id="language"
                    value={formData.language || 'en'}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value as 'en' | 'fr' })
                    }
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="timezone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={formData.timezone || 'America/Toronto'}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="input-field"
                  >
                    <option value="America/Toronto">Eastern Time (Toronto)</option>
                    <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                    <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                    <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                    <option value="America/Halifax">Atlantic Time (Halifax)</option>
                    <option value="America/St_Johns">Newfoundland Time (St. John&apos;s)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                <Bell className="mr-2 inline h-5 w-5" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={profile.notification_preferences.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={profile.notification_preferences.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-gray-700">In-App Notifications</span>
                  <input
                    type="checkbox"
                    checked={profile.notification_preferences.in_app}
                    onChange={(e) => handleNotificationChange('in_app', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>{' '}
    </div>
  )
}
