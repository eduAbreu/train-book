/**
 * RoleRedirect - Componente para redirecionamento baseado em role
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import { log } from "@/libs/log";

interface RoleRedirectProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleRedirect({ children, fallback }: RoleRedirectProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const supabase = createClient();

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          log.error("User fetch error", { error: userError.message });
          setError("Failed to fetch user data");
          return;
        }

        if (!user) {
          log.info("No user found, redirecting to home");
          router.push("/");
          return;
        }

        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, onboarding_completed, gym_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          log.error("Profile fetch error", { error: profileError.message });
          setError("Failed to fetch user profile");
          return;
        }

        if (!profile) {
          log.error("No profile found for user", { userId: user.id });
          setError("User profile not found");
          return;
        }

        // Check if user needs onboarding
        if (!profile.onboarding_completed) {
          log.info("User needs onboarding", {
            userId: user.id,
            role: profile.role,
          });

          if (profile.role === "owner") {
            router.push("/dashboard/owner");
            return;
          } else if (profile.role === "student") {
            router.push("/dashboard/student");
            return;
          }
        }

        // Redirect based on role
        if (profile.role === "owner") {
          log.info("Redirecting owner to owner dashboard", { userId: user.id });
          router.push("/dashboard/owner");
          return;
        } else if (profile.role === "student") {
          log.info("Redirecting student to student dashboard", {
            userId: user.id,
          });
          router.push("/dashboard/student");
          return;
        } else {
          log.error("Unknown user role", {
            userId: user.id,
            role: profile.role,
          });
          setError("Unknown user role");
          return;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        log.error("Role redirect error", { error: errorMsg });
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // This should never render as we redirect in useEffect
  return <>{children}</>;
}
