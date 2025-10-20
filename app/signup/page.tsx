'use client'

/**
 * VagalSync V15.0 Ultimate - Enhanced Signup Page
 * Features:
 * - Inline help tooltips
 * - Quick help menu
 * - Settings preview/defaults
 * - Password strength indicator
 * - Better validation feedback
 * - Onboarding hints
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HelpCircle, Eye, EyeOff, CheckCircle, XCircle, Settings, Info } from 'lucide-react'

export default function EnhancedSignupPage() {
  const router = useRouter()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettingsPreview, setShowSettingsPreview] = useState(false)
  
  // Default settings (will be saved after signup)
  const [defaultChronotype, setDefaultChronotype] = useState<'early' | 'intermediate' | 'late'>('intermediate')
  const [defaultTimezone, setDefaultTimezone] = useState('America/New_York')

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z\d]/.test(pwd)) score++

    if (score <= 1) return { score, label: 'Weak', color: 'red' }
    if (score <= 3) return { score, label: 'Medium', color: 'yellow' }
    return { score, label: 'Strong', color: 'green' }
  }

  const passwordStrength = password ? calculatePasswordStrength(password) : null

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Create account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            chronotype: defaultChronotype,
            timezone: defaultTimezone,
            onboarding_completed: false
          }
        },
      })

      if (error) throw error

      setSuccess(true)

      // Auto-login if email confirmation not required
      if (data.session) {
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to VagalSync!</h2>
            <p className="text-gray-600 mb-6">
              Check your email to confirm your account, then sign in to start tracking your stress resilience.
            </p>
            
            {/* What's next */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Check your email for confirmation link</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sign in and complete your profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Connect your wearable devices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Start tracking your first biomarkers</span>
                </li>
              </ul>
            </div>
            
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
        
        {/* Help Button */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition"
          title="Help"
        >
          <HelpCircle className="w-6 h-6" />
        </button>

        {/* Help Panel */}
        {showHelp && (
          <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Quick Help</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <div className="font-medium text-gray-900 mb-1">Why VagalSync?</div>
                <p>Track your stress resilience and optimize your wellness routine with science-backed insights.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Is my data secure?</div>
                <p>Yes! We use AES-256 encryption and never share your personal health data.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">What's included?</div>
                <p>Free plan includes biomarker tracking, myVagal Tone™ scoring, and basic insights.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">Need more help?</div>
                <Link href="/support" className="text-blue-600 hover:text-blue-700">
                  Visit our Help Center →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VagalSync</h1>
          <p className="text-gray-600 mt-2">Create your free account</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Email
              <span className="ml-1 text-gray-400" title="We'll send a confirmation email">
                <Info className="w-4 h-4" />
              </span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              Password
              <span className="ml-1 text-gray-400" title="Minimum 6 characters, stronger is better">
                <Info className="w-4 h-4" />
              </span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium text-${passwordStrength.color}-600`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`bg-${passwordStrength.color}-500 h-1.5 rounded-full transition-all`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-600 text-xs mt-1 flex items-center">
                <XCircle className="w-3 h-3 mr-1" />
                Passwords don't match
              </p>
            )}
            {confirmPassword && password === confirmPassword && (
              <p className="text-green-600 text-xs mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Passwords match
              </p>
            )}
          </div>

          {/* Optional Settings Preview */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowSettingsPreview(!showSettingsPreview)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettingsPreview ? 'Hide' : 'Set'} default preferences (optional)
            </button>
            
            {showSettingsPreview && (
              <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chronotype (sleep pattern)
                  </label>
                  <select
                    value={defaultChronotype}
                    onChange={(e) => setDefaultChronotype(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="early">Early Bird (wake before 7am)</option>
                    <option value="intermediate">Intermediate (wake 7-9am)</option>
                    <option value="late">Night Owl (wake after 9am)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={defaultTimezone}
                    onChange={(e) => setDefaultTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                  </select>
                </div>
                <p className="text-xs text-gray-600">
                  <Info className="w-3 h-3 inline mr-1" />
                  You can change these anytime in Settings
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start">
              <XCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (password !== confirmPassword && confirmPassword !== '')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
