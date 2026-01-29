import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-900">Authentication Error</h1>

          <p className="mb-6 text-gray-600">
            Sorry, we couldn&apos;t verify your email. The link may have expired or already been
            used.
          </p>

          <div className="w-full space-y-3">
            <Link href="/auth/signup" className="btn-primary inline-block w-full text-center">
              Try Signing Up Again
            </Link>

            <Link href="/auth/login" className="btn-secondary inline-block w-full text-center">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
