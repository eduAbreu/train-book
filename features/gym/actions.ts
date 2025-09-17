/**
 * Server Actions for gym management
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { validateCreateGym, validateUpdateGym } from "@/libs/validations";
import { log } from "@/libs/log";
import {
  GymMessages,
  type GymCreationResult,
  type Gym,
  type GymSettings,
} from "@/types/gym";
import { redirect } from "next/navigation";

/**
 * Helper function to get localized error message
 */
function getGymErrorMessage(error: any, locale: "en" | "pt" = "en"): string {
  const messages = GymMessages[locale];

  if (
    error?.message?.includes("duplicate key value violates unique constraint")
  ) {
    return messages.GYM_ALREADY_EXISTS;
  }
  if (error?.message?.includes("permission denied")) {
    return messages.UNAUTHORIZED;
  }
  if (error?.message?.includes("network")) {
    return messages.NETWORK_ERROR;
  }

  return messages.UNKNOWN;
}

/**
 * Helper function to check if owner already has a gym
 */
async function checkOwnerHasGym(ownerId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("gyms")
      .select("id")
      .eq("owner_id", ownerId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      log.error("Error checking owner gym", { ownerId, error: error.message });
      return false;
    }

    return !!data;
  } catch (error) {
    log.error("Error checking owner gym", { ownerId, error });
    return false;
  }
}

/**
 * Helper function to create default gym settings
 */
async function createDefaultGymSettings(gymId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("gym_settings").insert({
      gym_id: gymId,
      allow_waitlist: true,
      cancel_limit_hours: 24,
    });

    if (error) {
      log.error("Error creating gym settings", { gymId, error: error.message });
      return false;
    }

    log.info("Gym settings created successfully", { gymId });
    return true;
  } catch (error) {
    log.error("Error creating gym settings", { gymId, error });
    return false;
  }
}

/**
 * Helper function to update user onboarding status
 */
async function updateUserOnboardingStatus(
  userId: string,
  gymId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        gym_id: gymId,
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (error) {
      log.error("Error updating user onboarding status", {
        userId,
        gymId,
        error: error.message,
      });
      return false;
    }

    log.info("User onboarding status updated successfully", { userId, gymId });
    return true;
  } catch (error) {
    log.error("Error updating user onboarding status", {
      userId,
      gymId,
      error,
    });
    return false;
  }
}

/**
 * Create a new gym
 */
export async function createGym(
  formData: FormData
): Promise<GymCreationResult> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
    };

    // Validate input
    const validation = validateCreateGym(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const { name, location, email, phone, description } = validation.data!;
    const logo_url = formData.get("logo_url") as string;

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.error("Error getting user for gym creation", {
        error: authError?.message,
      });
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check if user is an owner
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "owner") {
      log.error("User is not an owner", {
        userId: user.id,
        role: profile?.role,
      });
      return {
        success: false,
        error: "Only gym owners can create gyms",
      };
    }

    // Check if owner already has a gym
    const hasGym = await checkOwnerHasGym(user.id);
    if (hasGym) {
      log.error("Owner already has a gym", { userId: user.id });
      return {
        success: false,
        error: "You already have a gym registered",
      };
    }

    // Create gym
    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .insert({
        owner_id: user.id,
        name,
        location,
        email,
        phone,
        description,
        logo_url,
        is_active: true,
      })
      .select()
      .single();

    if (gymError) {
      log.error("Error creating gym", {
        userId: user.id,
        error: gymError.message,
      });
      return {
        success: false,
        error: getGymErrorMessage(gymError),
      };
    }

    if (!gym) {
      log.error("No gym returned from creation", { userId: user.id });
      return {
        success: false,
        error: "Failed to create gym",
      };
    }

    // Create default gym settings
    const settingsCreated = await createDefaultGymSettings(gym.id);
    if (!settingsCreated) {
      log.error("Failed to create gym settings", { gymId: gym.id });
      // Continue anyway - settings can be created later
    }

    // Update user onboarding status
    const onboardingUpdated = await updateUserOnboardingStatus(user.id, gym.id);
    if (!onboardingUpdated) {
      log.error("Failed to update user onboarding status", {
        userId: user.id,
        gymId: gym.id,
      });
      // Continue anyway - user can still access the gym
    }

    log.info("Gym created successfully", {
      gymId: gym.id,
      userId: user.id,
      gymName: gym.name,
    });
  } catch (error) {
    log.error("Gym creation error", { error });
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }

  redirect("/dashboard");
}

/**
 * Update an existing gym
 */
export async function updateGym(
  gymId: string,
  formData: FormData
): Promise<GymCreationResult> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
    };

    // Validate input
    const validation = validateUpdateGym(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
      };
    }

    const updateData = validation.data!;

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      log.error("Error getting user for gym update", {
        error: authError?.message,
      });
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Update gym
    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .update(updateData)
      .eq("id", gymId)
      .eq("owner_id", user.id) // Ensure user owns the gym
      .select()
      .single();

    if (gymError) {
      log.error("Error updating gym", {
        gymId,
        userId: user.id,
        error: gymError.message,
      });
      return {
        success: false,
        error: getGymErrorMessage(gymError),
      };
    }

    if (!gym) {
      log.error("No gym returned from update", { gymId, userId: user.id });
      return {
        success: false,
        error: "Gym not found or access denied",
      };
    }

    log.info("Gym updated successfully", {
      gymId: gym.id,
      userId: user.id,
      gymName: gym.name,
    });

    return {
      success: true,
      gym,
    };
  } catch (error) {
    log.error("Gym update error", { error });
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get gym by owner ID
 */
export async function getGymByOwner(ownerId: string): Promise<Gym | null> {
  try {
    const supabase = await createClient();
    const { data: gym, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("owner_id", ownerId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      log.error("Error getting gym by owner", {
        ownerId,
        error: error.message,
      });
      return null;
    }

    return gym;
  } catch (error) {
    log.error("Error getting gym by owner", { ownerId, error });
    return null;
  }
}

/**
 * Get gym with settings
 */
export async function getGymWithSettings(gymId: string): Promise<{
  gym: Gym;
  settings: GymSettings;
} | null> {
  try {
    const supabase = await createClient();
    const { data: gym, error: gymError } = await supabase
      .from("gyms")
      .select("*")
      .eq("id", gymId)
      .single();

    if (gymError) {
      log.error("Error getting gym", { gymId, error: gymError.message });
      return null;
    }

    const { data: settings, error: settingsError } = await supabase
      .from("gym_settings")
      .select("*")
      .eq("gym_id", gymId)
      .single();

    if (settingsError) {
      log.error("Error getting gym settings", {
        gymId,
        error: settingsError.message,
      });
      return null;
    }

    return { gym, settings };
  } catch (error) {
    log.error("Error getting gym with settings", { gymId, error });
    return null;
  }
}
