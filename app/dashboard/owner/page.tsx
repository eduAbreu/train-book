"use client";

import { useAuth } from "@/provider/AuthProvider";
import ButtonAccount from "@/components/ButtonAccount";

export default function OwnerDashboard() {
  const { user, isOwner, hasGym, hasCompletedOnboarding } = useAuth();

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Owner Dashboard
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
                  className={`w-3 h-3 rounded-full mr-3 ${isOwner ? "bg-green-500" : "bg-gray-300"}`}
                ></span>
                <span className="text-sm">
                  Owner Role: {isOwner ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center">
                <span
                  className={`w-3 h-3 rounded-full mr-3 ${hasGym ? "bg-green-500" : "bg-yellow-500"}`}
                ></span>
                <span className="text-sm">
                  Gym: {hasGym ? "Connected" : "Not Set Up"}
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
                  Set Up Your Gym
                </button>
              )}
              {hasGym && (
                <button className="w-full btn btn-outline">
                  Manage Gym Settings
                </button>
              )}
              <button className="w-full btn btn-outline">View Members</button>
              <button className="w-full btn btn-outline">Analytics</button>
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
          <h2 className="text-xl font-semibold mb-4">Gym Management</h2>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏋️‍♂️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasGym ? "Your Gym is Ready!" : "Set Up Your Gym"}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasGym
                ? "Manage your gym settings, members, and bookings from here."
                : "Complete your gym setup to start managing members and bookings."}
            </p>
            {!hasGym && (
              <button className="btn btn-primary">Complete Gym Setup</button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
