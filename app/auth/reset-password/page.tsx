'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formState, setFormState] = useState({
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Get token from URL params
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Invalid or missing reset token')
    }
    setToken(tokenParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formState.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!token) {
      setError('Invalid reset token')
      return
    }

    setIsLoading(true)

    // TODO: Implement Supabase password update
    // await supabase.auth.updateUser({
    //   password: formState.password,
    // })
    
    // Placeholder for password reset logic
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    }, 1500)
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return null
    if (password.length < 8) return { label: 'Weak', color: 'red', width: '33%' }
    if (password.length < 12) return { label: 'Medium', color: 'yellow', width: '66%' }
    return { label: 'Strong', color: 'green', width: '100%' }
  }

  const strength = getPasswordStrength(formState.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container-custom flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
                <span className="text-xl font-bold text-white">ABR</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">ABR Insights</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Create New Password</h1>
            <p className="mt-2 text-gray-600">
              {isSuccess
                ? 'Your password has been reset successfully'
                : 'Choose a strong password to secure your account'}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            {!isSuccess ? (
              <>
                {/* Error Message */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-900">Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Invalid Token State */}
                {!token && !error && (
                  <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">Invalid Reset Link</h3>
                      <p className="text-gray-600">
                        This password reset link is invalid or has expired. Please request a new one.
                      </p>
                    </div>
                    <Link href="/auth/forgot-password" className="btn-primary w-full">
                      Request New Link
                    </Link>
                  </div>
                )}

                {/* Reset Form */}
                {token && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* New Password */}
                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={formState.password}
                          onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="••••••••"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {strength && (
                        <div className="mt-2">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-600">Password strength:</span>
                            <span className={`text-xs font-medium ${
                              strength.color === 'red' ? 'text-red-600' :
                              strength.color === 'yellow' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {strength.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full transition-all duration-300 ${
                                strength.color === 'red' ? 'bg-red-600 w-[33%]' :
                                strength.color === 'yellow' ? 'bg-yellow-600 w-[66%]' :
                                'bg-green-600 w-full'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          value={formState.confirmPassword}
                          onChange={(e) => setFormState({ ...formState, confirmPassword: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <h4 className="mb-2 text-sm font-medium text-gray-900">Password Requirements</h4>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li className="flex items-center gap-2">
                          <span className={formState.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                            {formState.password.length >= 8 ? '✓' : '○'}
                          </span>
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[A-Z]/.test(formState.password) ? 'text-green-600' : 'text-gray-400'}>
                            {/[A-Z]/.test(formState.password) ? '✓' : '○'}
                          </span>
                          At least one uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/[a-z]/.test(formState.password) ? 'text-green-600' : 'text-gray-400'}>
                            {/[a-z]/.test(formState.password) ? '✓' : '○'}
                          </span>
                          At least one lowercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <span className={/\d/.test(formState.password) ? 'text-green-600' : 'text-gray-400'}>
                            {/\d/.test(formState.password) ? '✓' : '○'}
                          </span>
                          At least one number
                        </li>
                      </ul>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Resetting password...
                        </span>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="space-y-6 text-center">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>

                {/* Success Message */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">Password Reset Successful</h3>
                  <p className="text-gray-600">
                    Your password has been updated. You can now log in with your new password.
                  </p>
                </div>

                {/* Redirect Message */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    Redirecting you to the login page in a few seconds...
                  </p>
                </div>

                {/* Manual Login Button */}
                <Link href="/auth/login" className="btn-primary w-full">
                  Go to Login
                </Link>
              </div>
            )}
          </div>

          {/* Back to Login */}
          {!isSuccess && token && (
            <div className="mt-8 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-gray-600 transition-colors hover:text-primary-600"
              >
                ← Back to login
              </Link>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
