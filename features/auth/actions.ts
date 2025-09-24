/**
 * Server Actions for authentication
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { validateSignUp, validateSignIn } from "@/libs/validations";
import { log } from "@/libs/log";
import {
  AuthErrorCode,
  AuthMessages,
  type AuthResult,
  type SignUpData,
  type SignInData,
  type UserRole,
} from "@/types/auth";
import { redirect } from "next/navigation";

/**
 * Helper function to get localized error message
 */
function getErrorMessage(error: any, locale: "en" | "pt" = "en"): string {
  const messages = AuthMessages[locale];

  if (error?.message?.includes("Invalid login credentials")) {
    return messages.INVALID_CREDENTIALS;
  }
  if (error?.message?.includes("User already registered")) {
    return messages.EMAIL_IN_USE;
  }
  if (error?.message?.includes("Email not confirmed")) {
    return messages.EMAIL_IN_USE;
  }

  return messages.UNKNOWN;
}

/**
 * Helper function to check if user has a gym (for owners)
 */
async function checkOwnerGym(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gyms")
      .select("id")
      .eq("owner_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      log.error("Error checking owner gym", { userId, error: error.message });
      return false;
    }

    return !!data;
  } catch (error) {
    log.error("Error checking owner gym", { userId, error });
    return false;
  }
}

/**
 * Helper function to check if user has a student membership
 */
async function checkStudentMembership(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("gym_id")
      .eq("id", userId)
      .eq("role", "student")
      .not("gym_id", "is", null)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      log.error("Error checking student membership", {
        userId,
        error: error.message,
      });
      return false;
    }

    return !!data?.gym_id;
  } catch (error) {
    log.error("Error checking student membership", { userId, error });
    return false;
  }
}

/**
 * Helper function to create user profile
 */
async function createUserProfile(
  userId: string,
  email: string,
  fullName: string,
  role: UserRole
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName,
      role,
      onboarding_completed: false,
    });

    if (error) {
      log.error("Error creating user profile", {
        userId,
        email,
        role,
        error: error.message,
      });
      return false;
    }

    log.info("User profile created successfully", { userId, email, role });
    return true;
  } catch (error) {
    log.error("Error creating user profile", { userId, email, role, error });
    return false;
  }
}

/**
 * Owner Sign Up
 */
export async function ownerSignUp(formData: FormData): Promise<AuthResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      full_name: formData.get("full_name") as string,
    };

    // Validate input
    const validation = validateSignUp(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const { email, password, full_name } = validation.data!;

    // Create user with Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (authError) {
      log.error("Owner signup auth error", { email, error: authError.message });
      return {
        success: false,
        error: getErrorMessage(authError),
      };
    }

    if (!authData.user) {
      log.error("No user returned from signup", { email });
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    // Create user profile
    const profileCreated = await createUserProfile(
      authData.user.id,
      email,
      full_name,
      "owner"
    );

    if (!profileCreated) {
      log.error("Failed to create owner profile", {
        userId: authData.user.id,
        email,
      });
      return {
        success: false,
        error: "Failed to create user profile",
      };
    }

    // Check if owner already has a gym
    const hasGym = await checkOwnerGym(authData.user.id);

    console.log("---hasGym", hasGym);
    log.info("Owner signup successful", {
      userId: authData.user.id,
      email,
      hasGym,
    });
  } catch (error) {
    log.error("Owner signup error", { error });
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }

  return {
    success: true,
    redirectTo: "/onboarding/setup-gym",
  };
}

/**
 * Owner Sign In
 */
export async function ownerSignIn(formData: FormData): Promise<AuthResult> {
  // Default to final destination to avoid an extra hop that can race with session propagation
  let redirectTo = "/dashboard/owner";
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const validation = validateSignIn(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const { email, password } = validation.data!;

    // Sign in with Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      log.error("Owner signin auth error", { email, error: authError.message });
      return {
        success: false,
        error: getErrorMessage(authError),
      };
    }

    if (!authData.user) {
      log.error("No user returned from signin", { email });
      return {
        success: false,
        error: "Failed to sign in",
      };
    }

    // Verify user is an owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      log.error("User is not an owner", {
        userId: authData.user.id,
        email,
        role: profile?.role,
      });
      return {
        success: false,
        error: "Access denied. This account is not authorized as an owner.",
      };
    }

    // Check if owner has a gym
    const hasGym = await checkOwnerGym(authData.user.id);
    if (!hasGym) {
      redirectTo = "/onboarding/setup-gym";
    }

    log.info("Owner signin successful", {
      userId: authData.user.id,
      email,
      hasGym,
    });

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    log.error("Owner signin error", { error });
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Student Sign Up
 */
export async function studentSignUp(formData: FormData): Promise<AuthResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      full_name: formData.get("full_name") as string,
    };

    // Validate input
    const validation = validateSignUp(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const { email, password, full_name } = validation.data!;

    // Create user with Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (authError) {
      log.error("Student signup auth error", {
        email,
        error: authError.message,
      });
      return {
        success: false,
        error: getErrorMessage(authError),
      };
    }

    if (!authData.user) {
      log.error("No user returned from signup", { email });
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    // Create user profile
    const profileCreated = await createUserProfile(
      authData.user.id,
      email,
      full_name,
      "student"
    );

    if (!profileCreated) {
      log.error("Failed to create student profile", {
        userId: authData.user.id,
        email,
      });
      return {
        success: false,
        error: "Failed to create user profile",
      };
    }

    log.info("Student signup successful", { userId: authData.user.id, email });

    // Students always go to choose-gym after signup
  } catch (error) {
    log.error("Student signup error", { error });
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }

  return {
    success: true,
    redirectTo: "/onboarding/choose-gym",
  };
}

/**
 * Student Sign In
 */
export async function studentSignIn(formData: FormData): Promise<AuthResult> {
  // Default to final destination to avoid an extra hop that can race with session propagation
  let redirectTo = "/dashboard/student";
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const validation = validateSignIn(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const { email, password } = validation.data!;

    // Sign in with Supabase Auth
    const supabase = await createClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      log.error("Student signin auth error", {
        email,
        error: authError.message,
      });
      return {
        success: false,
        error: getErrorMessage(authError),
      };
    }

    if (!authData.user) {
      log.error("No user returned from signin", { email });
      return {
        success: false,
        error: "Failed to sign in",
      };
    }

    // Verify user is a student
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (!profile || profile.role !== "student") {
      log.error("User is not a student", {
        userId: authData.user.id,
        email,
        role: profile?.role,
      });
      return {
        success: false,
        error: "Access denied. This account is not authorized as a student.",
      };
    }

    // Check if student has a gym membership
    const hasMembership = await checkStudentMembership(authData.user.id);
    if (!hasMembership) {
      redirectTo = "/onboarding/choose-gym";
    }

    log.info("Student signin successful", {
      userId: authData.user.id,
      email,
      hasMembership,
    });

    // Redirect based on membership status
  } catch (error) {
    log.error("Student signin error", { error });
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }

  return {
    success: true,
    redirectTo,
  };
}
