'use client'

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re Offline</h1>
          <p className="text-gray-600 mb-6">
            It looks like you&apos;ve lost your internet connection. Don&apos;t worry, you can still access your downloaded courses!
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">📚 Offline Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• View downloaded courses</li>
              <li>• Continue learning where you left off</li>
              <li>• Take quizzes (synced when online)</li>
              <li>• Track your progress locally</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/courses"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View Downloaded Courses
            </Link>
            
            <Link
              href="/dashboard"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-3 px-6 rounded-lg transition-colors border border-gray-200"
            >
              Try Again
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your progress will automatically sync when you&apos;re back online
          </p>
        </div>
      </div>
    </div>
  );
}
