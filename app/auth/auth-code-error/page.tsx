import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            Sorry, we couldn&apos;t verify your email. The link may have expired or already been used.
          </p>
          
          <div className="space-y-3 w-full">
            <Link 
              href="/auth/signup" 
              className="btn-primary w-full inline-block text-center"
            >
              Try Signing Up Again
            </Link>
            
            <Link 
              href="/auth/login" 
              className="btn-secondary w-full inline-block text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
