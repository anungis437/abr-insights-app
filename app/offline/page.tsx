'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">You&apos;re Offline</h1>
          <p className="mb-6 text-gray-600">
            It looks like you&apos;ve lost your internet connection. Don&apos;t worry, you can still
            access your downloaded courses!
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-blue-900">📚 Offline Features</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• View downloaded courses</li>
              <li>• Continue learning where you left off</li>
              <li>• Take quizzes (synced when online)</li>
              <li>• Track your progress locally</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/courses"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              View Downloaded Courses
            </Link>

            <Link
              href="/dashboard"
              className="w-full rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Go to Dashboard
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              Try Again
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-500">
            Your progress will automatically sync when you&apos;re back online
          </p>
        </div>
      </div>
    </div>
  )
}
