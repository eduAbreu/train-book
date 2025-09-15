"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You&apos;re Offline
          </h1>
          <p className="text-gray-600">
            It looks like you&apos;re not connected to the internet. Please
            check your connection and try again.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>TrainBook works offline for basic features.</p>
          <p>Some features may be limited without internet connection.</p>
        </div>
      </div>
    </div>
  );
}
