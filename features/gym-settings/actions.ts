/**
 * Server Actions for gym settings management
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { log } from "@/libs/log";
import type {
  GymSettings,
  CreateGymSettingsData,
  UpdateGymSettingsData,
} from "@/types/schedule";

/**
 * Get gym settings
 */
export async function getGymSettings(gymId: string): Promise<{
  success: boolean;
  data?: GymSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Validate session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Ensure user has access to this gym
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, gym_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "User profile not found" };
    }

    // Check if user has access to this gym
    if (profile.role === "owner") {
      const { data: gym } = await supabase
        .from("gyms")
        .select("id")
        .eq("id", gymId)
        .eq("owner_id", user.id)
        .single();

      if (!gym) {
        return { success: false, error: "Gym not found or access denied" };
      }
    } else if (profile.role === "student") {
      if (profile.gym_id !== gymId) {
        return { success: false, error: "Access denied" };
      }
    } else {
      return { success: false, error: "Invalid user role" };
    }

    // Get gym settings
    const { data: settings, error } = await supabase
      .from("gym_settings")
      .select("*")
      .eq("gym_id", gymId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      log.error("Error getting gym settings", { gymId, error: error.message });
      return { success: false, error: "Failed to fetch gym settings" };
    }

    // If no settings exist, return default settings
    if (!settings) {
      const defaultSettings: GymSettings = {
        gym_id: gymId,
        allow_waitlist: true,
        cancel_limit_hours: 24,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: defaultSettings };
    }

    return { success: true, data: settings };
  } catch (error) {
    log.error("Gym settings fetch error", { gymId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create gym settings
 */
export async function createGymSettings(
  gymId: string,
  data: CreateGymSettingsData
): Promise<{
  success: boolean;
  data?: GymSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Validate session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Ensure user is the gym owner
    const { data: gym } = await supabase
      .from("gyms")
      .select("id")
      .eq("id", gymId)
      .eq("owner_id", user.id)
      .single();

    if (!gym) {
      return { success: false, error: "Gym not found or access denied" };
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("gym_settings")
      .select("id")
      .eq("gym_id", gymId)
      .single();

    if (existingSettings) {
      return { success: false, error: "Gym settings already exist" };
    }

    // Create gym settings
    const { data: settings, error } = await supabase
      .from("gym_settings")
      .insert({
        gym_id: gymId,
        allow_waitlist: data.allow_waitlist ?? true,
        cancel_limit_hours: data.cancel_limit_hours ?? 24,
      })
      .select()
      .single();

    if (error) {
      log.error("Error creating gym settings", {
        gymId,
        data,
        error: error.message,
      });
      return { success: false, error: "Failed to create gym settings" };
    }

    log.info("Gym settings created successfully", {
      gymId,
      allowWaitlist: settings.allow_waitlist,
      cancelLimitHours: settings.cancel_limit_hours,
    });

    return { success: true, data: settings };
  } catch (error) {
    log.error("Gym settings creation error", { gymId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update gym settings
 */
export async function updateGymSettings(
  gymId: string,
  data: UpdateGymSettingsData
): Promise<{
  success: boolean;
  data?: GymSettings;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Validate session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Ensure user is the gym owner
    const { data: gym } = await supabase
      .from("gyms")
      .select("id")
      .eq("id", gymId)
      .eq("owner_id", user.id)
      .single();

    if (!gym) {
      return { success: false, error: "Gym not found or access denied" };
    }

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("gym_settings")
      .select("*")
      .eq("gym_id", gymId)
      .single();

    if (!existingSettings) {
      // Create settings if they don't exist
      return createGymSettings(gymId, data);
    }

    // Update gym settings
    const { data: settings, error } = await supabase
      .from("gym_settings")
      .update({
        allow_waitlist: data.allow_waitlist,
        cancel_limit_hours: data.cancel_limit_hours,
        updated_at: new Date().toISOString(),
      })
      .eq("gym_id", gymId)
      .select()
      .single();

    if (error) {
      log.error("Error updating gym settings", {
        gymId,
        data,
        error: error.message,
      });
      return { success: false, error: "Failed to update gym settings" };
    }

    log.info("Gym settings updated successfully", {
      gymId,
      allowWaitlist: settings.allow_waitlist,
      cancelLimitHours: settings.cancel_limit_hours,
    });

    return { success: true, data: settings };
  } catch (error) {
    log.error("Gym settings update error", { gymId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}
