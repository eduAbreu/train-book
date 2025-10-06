/**
 * Server Actions for class types (modalities) management
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { log } from "@/libs/log";

export interface ClassType {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  emoji?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClassTypeData {
  name: string;
  emoji?: string;
  is_active?: boolean;
}

export interface UpdateClassTypeData {
  name?: string;
  emoji?: string;
  is_active?: boolean;
}

/**
 * Get all class types for a gym
 */
export async function getClassTypes(gymId: string): Promise<{
  success: boolean;
  data?: ClassType[];
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

    // Get class types
    const { data: classTypes, error } = await supabase
      .from("class_types")
      .select("*")
      .eq("gym_id", gymId)
      .order("created_at", { ascending: true });

    if (error) {
      log.error("Error getting class types", { gymId, error: error.message });
      return { success: false, error: "Failed to fetch class types" };
    }

    return { success: true, data: classTypes || [] };
  } catch (error) {
    log.error("Class types fetch error", { gymId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new class type
 */
export async function createClassType(
  gymId: string,
  data: CreateClassTypeData
): Promise<{
  success: boolean;
  data?: ClassType;
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

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from("class_types")
      .select("id")
      .eq("gym_id", gymId)
      .eq("slug", slug)
      .single();

    if (existing) {
      return {
        success: false,
        error: "A class type with this name already exists",
      };
    }

    // Create class type
    const { data: classType, error } = await supabase
      .from("class_types")
      .insert({
        gym_id: gymId,
        name: data.name,
        slug,
        emoji: data.emoji,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      log.error("Error creating class type", {
        gymId,
        data,
        error: error.message,
      });
      return { success: false, error: "Failed to create class type" };
    }

    log.info("Class type created successfully", {
      classTypeId: classType.id,
      gymId,
      name: classType.name,
    });

    return { success: true, data: classType };
  } catch (error) {
    log.error("Class type creation error", { gymId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing class type
 */
export async function updateClassType(
  classTypeId: string,
  data: UpdateClassTypeData
): Promise<{
  success: boolean;
  data?: ClassType;
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

    // Get the class type and verify ownership
    const { data: classType, error: fetchError } = await supabase
      .from("class_types")
      .select("*, gyms!inner(owner_id)")
      .eq("id", classTypeId)
      .single();

    if (fetchError || !classType) {
      return { success: false, error: "Class type not found" };
    }

    if (classType.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // If name is being updated, generate new slug and check for duplicates
    let updateData: any = { ...data };
    if (data.name) {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for duplicate slug (excluding current class type)
      const { data: existing } = await supabase
        .from("class_types")
        .select("id")
        .eq("gym_id", classType.gym_id)
        .eq("slug", slug)
        .neq("id", classTypeId)
        .single();

      if (existing) {
        return {
          success: false,
          error: "A class type with this name already exists",
        };
      }

      updateData.slug = slug;
    }

    // Update class type
    const { data: updatedClassType, error } = await supabase
      .from("class_types")
      .update(updateData)
      .eq("id", classTypeId)
      .select()
      .single();

    if (error) {
      log.error("Error updating class type", {
        classTypeId,
        data,
        error: error.message,
      });
      return { success: false, error: "Failed to update class type" };
    }

    log.info("Class type updated successfully", {
      classTypeId: updatedClassType.id,
      name: updatedClassType.name,
    });

    return { success: true, data: updatedClassType };
  } catch (error) {
    log.error("Class type update error", { classTypeId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a class type
 */
export async function deleteClassType(classTypeId: string): Promise<{
  success: boolean;
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

    // Get the class type and verify ownership
    const { data: classType, error: fetchError } = await supabase
      .from("class_types")
      .select("*, gyms!inner(owner_id)")
      .eq("id", classTypeId)
      .single();

    if (fetchError || !classType) {
      return { success: false, error: "Class type not found" };
    }

    if (classType.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Check if class type is being used in any weekly slots
    const { data: slots } = await supabase
      .from("weekly_template_slots")
      .select("id")
      .eq("class_type_id", classTypeId)
      .limit(1);

    if (slots && slots.length > 0) {
      return {
        success: false,
        error: "Cannot delete class type that is being used in weekly slots",
      };
    }

    // Check if class type is being used in any classes
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("class_type_id", classTypeId)
      .limit(1);

    if (classes && classes.length > 0) {
      return {
        success: false,
        error: "Cannot delete class type that is being used in classes",
      };
    }

    // Delete class type
    const { error } = await supabase
      .from("class_types")
      .delete()
      .eq("id", classTypeId);

    if (error) {
      log.error("Error deleting class type", {
        classTypeId,
        error: error.message,
      });
      return { success: false, error: "Failed to delete class type" };
    }

    log.info("Class type deleted successfully", {
      classTypeId,
      name: classType.name,
    });

    return { success: true };
  } catch (error) {
    log.error("Class type deletion error", { classTypeId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle class type active status
 */
export async function toggleClassTypeActive(
  classTypeId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  data?: ClassType;
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

    // Get the class type and verify ownership
    const { data: classType, error: fetchError } = await supabase
      .from("class_types")
      .select("*, gyms!inner(owner_id)")
      .eq("id", classTypeId)
      .single();

    if (fetchError || !classType) {
      return { success: false, error: "Class type not found" };
    }

    if (classType.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Update active status
    const { data: updatedClassType, error } = await supabase
      .from("class_types")
      .update({ is_active: isActive })
      .eq("id", classTypeId)
      .select()
      .single();

    if (error) {
      log.error("Error toggling class type active status", {
        classTypeId,
        isActive,
        error: error.message,
      });
      return { success: false, error: "Failed to update class type" };
    }

    log.info("Class type active status updated", {
      classTypeId,
      isActive,
      name: updatedClassType.name,
    });

    return { success: true, data: updatedClassType };
  } catch (error) {
    log.error("Class type toggle error", { classTypeId, isActive, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}
