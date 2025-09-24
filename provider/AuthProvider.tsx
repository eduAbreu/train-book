"use client";

import { createClient } from "@/libs/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/types/auth";

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: AuthUser | null;
  isStudent: boolean;
  isOwner: boolean;
  hasGym: boolean;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  isFetched: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    data: user,
    isLoading,
    isFetched: isUserFetched,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data?.user ?? null; // ✅ Ensures it's never undefined
    },
    staleTime: 0,
  });

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: isProfileFetched,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();
      return data ?? null;
    },
    staleTime: 0,
    enabled: !!user,
  });

  const isStudent = profile?.role === "student";
  const isOwner = profile?.role === "owner";
  const hasGym = profile?.gym_id !== null;
  const hasCompletedOnboarding = !!profile?.onboarding_completed;
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        loading: isLoading || profileLoading,
        isFetched: isUserFetched && isProfileFetched,
        profile: profile ?? null,
        isStudent: isStudent,
        isOwner: isOwner,
        hasGym: hasGym,
        hasCompletedOnboarding: hasCompletedOnboarding,
        isAuthenticated: isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
