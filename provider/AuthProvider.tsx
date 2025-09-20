/**
 * AuthContext - Context principal para autenticação
 */

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/libs/supabase/client";
import type { AuthUser } from "@/types/auth";
import type { User } from "@supabase/supabase-js";
import { log } from "@/libs/log";

const AuthContext = createContext(null);

export function AuthProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  // State
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null);

  // Helper functions
  const isAuthenticated = Boolean(user);
  const isOwner = userProfile?.role === "owner" || false;
  const isStudent = userProfile?.role === "student" || false;
  const hasGym = Boolean(userProfile?.gym_id);
  const hasCompletedOnboarding = userProfile?.onboarding_completed || false;

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const supabase = createClient();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          full_name,
          role,
          onboarding_completed,
          gyms!gyms_owner_id_fkey(id)
        `
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        log.error("Profile fetch error", { error: profileError.message });
        return null;
      }

      if (!profile) {
        return null;
      }

      // Check if user has a gym (for owners)
      const gymId =
        profile.role === "owner" && profile.gyms?.[0]?.id
          ? profile.gyms[0].id
          : undefined;

      return {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        full_name: profile.full_name,
        gym_id: gymId,
        onboarding_completed: profile.onboarding_completed,
      };
    } catch (error) {
      log.error("Error fetching user profile", { error });
      return null;
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const userProfile = await fetchUserProfile(user?.id);
      setUserProfile(userProfile);
    };
    fetchProfile();
  }, [user]);

  // Memoized context value
  const value = useMemo(
    () => ({
      // State
      user,

      // Helpers
      isAuthenticated,
      isOwner,
      isStudent,
      hasGym,
      hasCompletedOnboarding,
    }),
    [user, isAuthenticated, isOwner, isStudent, hasGym, hasCompletedOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
