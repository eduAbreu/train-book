"use client";

import { useAuth } from "@/provider/AuthProvider";
import ButtonAccount from "@/components/ButtonAccount";

export default function StudentDashboard() {
  const { user, isStudent, hasGym, hasCompletedOnboarding } = useAuth();

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Student Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.user_metadata?.name || user?.email}!
            </p>
          </div>
          <ButtonAccount />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Status Cards */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Account Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${isStudent ? "bg-green-500" : "bg-gray-300"}`}
                ></span>
                <span className="text-sm">
                  Student Role: {isStudent ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${hasGym ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                <span className="text-sm">
                  Gym: {hasGym ? "Joined" : "Not Selected"}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${hasCompletedOnboarding ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                <span className="text-sm">
                  Onboarding: {hasCompletedOnboarding ? "Complete" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {!hasGym && (
                <button className="w-full btn btn-primary">
                  Choose Your Gym
                </button>
              )}
              {hasGym && (
                <>
                  <button className="w-full btn btn-outline">
                    Book a Session
                  </button>
                  <button className="w-full btn btn-outline">
                    View Schedule
                  </button>
                  <button className="w-full btn btn-outline">
                    My Bookings
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>• Dashboard accessed</p>
                <p>• Account verified</p>
                <p>• Profile updated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Fitness Journey</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasGym ? "Ready to Train!" : "Choose Your Gym"}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasGym
                ? "Book your sessions, track your progress, and achieve your fitness goals."
                : "Select a gym to start booking your fitness sessions and training."}
            </p>
            {!hasGym && (
              <button className="btn btn-primary">Browse Available Gyms</button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {hasGym && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-gray-600">Sessions Booked</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-gray-600">Hours Trained</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">0</div>
              <div className="text-sm text-gray-600">Goals Achieved</div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
