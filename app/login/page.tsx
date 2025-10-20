'use client'

/**
 * VagalSync V15.0 Ultimate - Enhanced Login Page
 * Features:
 * - Inline help menu
 * - Forgot password functionality
 * - Show/hide password toggle
 * - Better error handling
 * - Quick links to help resources
 * - Remember me option (future)
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HelpCircle, Eye, EyeOff, AlertCircle, Mail, XCircle, CheckCircle, Info, Shield } from 'lucide-react'

export default function EnhancedLoginPage() {
  const router = useRouter()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Redirect to dashboard on success
      router.push('/')
      router.refresh()
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before signing in.')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setResetEmailSent(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setResetLoading(false)
    }
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
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <div className="font-medium text-gray-900 mb-1 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Can't log in?
                </div>
                <p>Click "Forgot password?" below to reset your password via email.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Account not confirmed?
                </div>
                <p>Check your email for the confirmation link we sent when you signed up.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1 flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  Is my data safe?
                </div>
                <p>Yes! We use bank-level encryption (AES-256) and never share your data.</p>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-1">New to VagalSync?</div>
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create a free account →
                </Link>
              </div>
              <div className="pt-2 border-t">
                <Link href="/support" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Visit Help Center →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VagalSync</h1>
          <p className="text-gray-600 mt-2">Track your stress resilience</p>
        </div>

        {/* Show Forgot Password Form or Login Form */}
        {showForgotPassword ? (
          <>
            {/* Forgot Password Form */}
            {resetEmailSent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-6">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmailSent(false)
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to login
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h2>
                  <p className="text-gray-600 text-sm">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="you@example.com"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
                  >
                    {resetLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setError(null)
                      }}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      ← Back to login
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Unable to sign in</div>
                    <div>{error}</div>
                  </div>
                </div>
              )}

              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-blue-900">
                  <strong>Privacy First:</strong> Your health data is encrypted and never shared without your permission.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to VagalSync?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                href="/signup"
                className="inline-block w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Create Free Account
              </Link>
            </div>

            {/* Quick Features */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-600 text-center mb-3">
                What you'll get with VagalSync:
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Track biomarkers</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">myVagal Tone™ score</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Connect devices</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">AI insights</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer Links */}
        <div className="mt-6 text-center space-x-4 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-gray-700">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
          <span>•</span>
          <Link href="/support" className="hover:text-gray-700">Help</Link>
        </div>
      </div>
    </div>
  )
}
