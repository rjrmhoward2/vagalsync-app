'use client'

/**
 * VagalSync V15.0 - Settings Tab
 * User profile and preferences
 */

import HelpMenu from './components/shared/HelpMenu'
import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, signOut } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsTab() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chronotype, setChronotype] = useState<'early' | 'intermediate' | 'late'>('intermediate')
  const [timezone, setTimezone] = useState('America/New_York')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      // Load user preferences (we'll add database table later)
      // For now, just use defaults
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      // TODO: Save to database
      // For now, just show success
      alert('Preferences saved! (Database integration coming soon)')
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-600 mb-4">Please sign in to access settings</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-200 mt-1">Manage your account and preferences</p>
      </div>

      {/* Help Menu */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <HelpMenu context="settings" />
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-gray-900">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <div className="text-xs text-gray-500 font-mono">{user.id}</div>
          </div>
        </div>
      </div>

      {/* Biological Profile (For Optimizer) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Biological Profile</h2>
        <p className="text-sm text-gray-600 mb-4">
          These settings help optimize timing recommendations (Premium feature)
        </p>

        <div className="space-y-4">
          {/* Chronotype */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chronotype (Sleep Pattern)
            </label>
            <select
              value={chronotype}
              onChange={(e) => setChronotype(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: '#111827' }}
            >
              <option value="early" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Early Bird (wake before 6:30 AM)</option>
              <option value="intermediate" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Intermediate (wake 6:30-8:30 AM)</option>
              <option value="late">Night Owl (wake after 8:30 AM)</option><option value="late" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Night Owl (wake after 8:30 AM)</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              style={{ color: '#111827' }}
            >
              <option value="America/New_York" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Eastern Time (ET)</option>
              <option value="America/Chicago" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Central Time (CT)</option>
              <option value="America/Denver" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Mountain Time (MT)</option>
              <option value="America/Los_Angeles" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Pacific Time (PT)</option>
            </select>
          </div>

          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Free Plan</div>
            <div className="text-sm text-gray-600">Basic tracking features</div>
          </div>
          <button
            onClick={() => {
              const plansTab = document.querySelector('[data-tab="plans"]') as HTMLElement;
              if (plansTab) {
                plansTab.click();
              } else {
                alert('Click the Plans tab in the navigation to upgrade!');
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            View All Plans
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
