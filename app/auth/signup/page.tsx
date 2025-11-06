'use client'

import { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User, Building2, Chrome, Github, Check } from 'lucide-react'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1) // 1: Account details, 2: Organization info
  const [formState, setFormState] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Organization Info
    organizationName: '',
    organizationType: '',
    role: '',
    teamSize: '',
    // Agreements
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToMarketing: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      // Validate passwords match
      if (formState.password !== formState.confirmPassword) {
        alert('Passwords do not match')
        return
      }
      setStep(2)
    } else {
      setIsLoading(true)
      
      // TODO: Implement Supabase authentication
      // await supabase.auth.signUp({
      //   email: formState.email,
      //   password: formState.password,
      //   options: {
      //     data: {
      //       first_name: formState.firstName,
      //       last_name: formState.lastName,
      //       organization_name: formState.organizationName,
      //       organization_type: formState.organizationType,
      //       role: formState.role,
      //       team_size: formState.teamSize,
      //     }
      //   }
      // })
      
      // Placeholder for authentication logic
      
      setTimeout(() => {
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleSocialSignup = (provider: 'google' | 'github') => {
    // TODO: Implement Supabase social auth
    // await supabase.auth.signInWithOAuth({ provider })
    // Placeholder for social authentication logic
  }

  const organizationTypes = [
    'Private Company',
    'Non-Profit',
    'Government',
    'Educational Institution',
    'Healthcare',
    'Other',
  ]

  const teamSizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees',
  ]

  const roles = [
    'HR Manager',
    'DEI Specialist',
    'Executive Leadership',
    'Training Coordinator',
    'Manager/Supervisor',
    'Individual Contributor',
    'Other',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container-custom flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
                <span className="text-xl font-bold text-white">ABR</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">ABR Insights</span>
            </Link>
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-2 text-gray-600">
              Join organizations building more equitable workplaces
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Account</span>
            </div>
            <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Organization</span>
            </div>
          </div>

          {/* Signup Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  {/* Step 1: Personal Information */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="firstName"
                          value={formState.firstName}
                          onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="lastName"
                          value={formState.lastName}
                          onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                      Password
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
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                      Confirm Password
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

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  {/* Social Signup Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSocialSignup('google')}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <Chrome className="h-5 w-5" />
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialSignup('github')}
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <Github className="h-5 w-5" />
                      GitHub
                    </button>
                  </div>

                  {/* Next Button */}
                  <button type="submit" className="btn-primary w-full">
                    Continue to Organization Details
                  </button>
                </>
              ) : (
                <>
                  {/* Step 2: Organization Information */}
                  <div className="space-y-6">
                    {/* Organization Name */}
                    <div>
                      <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-gray-700">
                        Organization Name
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="organizationName"
                          value={formState.organizationName}
                          onChange={(e) => setFormState({ ...formState, organizationName: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="Your Company Inc."
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Organization Type */}
                      <div>
                        <label htmlFor="organizationType" className="mb-2 block text-sm font-medium text-gray-700">
                          Organization Type
                        </label>
                        <select
                          id="organizationType"
                          value={formState.organizationType}
                          onChange={(e) => setFormState({ ...formState, organizationType: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          required
                        >
                          <option value="">Select type...</option>
                          {organizationTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Team Size */}
                      <div>
                        <label htmlFor="teamSize" className="mb-2 block text-sm font-medium text-gray-700">
                          Team Size
                        </label>
                        <select
                          id="teamSize"
                          value={formState.teamSize}
                          onChange={(e) => setFormState({ ...formState, teamSize: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          required
                        >
                          <option value="">Select size...</option>
                          {teamSizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Your Role */}
                    <div>
                      <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
                        Your Role
                      </label>
                      <select
                        id="role"
                        value={formState.role}
                        onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        required
                      >
                        <option value="">Select role...</option>
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Agreements */}
                    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="agreedToTerms"
                          checked={formState.agreedToTerms}
                          onChange={(e) => setFormState({ ...formState, agreedToTerms: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          required
                        />
                        <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-700">
                          I agree to the{' '}
                          <Link href="/terms" className="font-medium text-primary-600 hover:text-primary-700" target="_blank">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" className="font-medium text-primary-600 hover:text-primary-700" target="_blank">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="agreedToMarketing"
                          checked={formState.agreedToMarketing}
                          onChange={(e) => setFormState({ ...formState, agreedToMarketing: e.target.checked })}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="agreedToMarketing" className="ml-2 text-sm text-gray-700">
                          Send me product updates and educational content (optional)
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn-secondary flex-1"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating account...
                          </span>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>

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
