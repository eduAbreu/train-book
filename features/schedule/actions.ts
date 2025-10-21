/**
 * Server Actions for schedule slots management
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { log } from "@/libs/log";

/**
 * Check if two time slots overlap (ignoring date, only comparing time)
 */
function hasTimeOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  // Convert to Date objects if they're strings
  const start1Date = typeof start1 === "string" ? new Date(start1) : start1;
  const end1Date = typeof end1 === "string" ? new Date(end1) : end1;
  const start2Date = typeof start2 === "string" ? new Date(start2) : start2;
  const end2Date = typeof end2 === "string" ? new Date(end2) : end2;

  // Extract time components for comparison (ignore date)
  const start1Time = start1Date.getHours() * 60 + start1Date.getMinutes();
  const end1Time = end1Date.getHours() * 60 + end1Date.getMinutes();
  const start2Time = start2Date.getHours() * 60 + start2Date.getMinutes();
  const end2Time = end2Date.getHours() * 60 + end2Date.getMinutes();

  return start1Time < end2Time && end1Time > start2Time;
}

export interface ScheduleSlot {
  id: string;
  gym_id: string;
  class_type_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  duration_minutes: number;
  capacity: number;
  instructor?: string;
  is_recurring: boolean;
  recurrence_pattern: "weekly" | "biweekly" | "monthly" | "none";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class_type?: {
    id: string;
    name: string;
    emoji?: string;
  };
}

export interface CreateSlotData {
  class_type_id: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  instructor?: string;
  is_recurring?: boolean;
  recurrence_pattern?: "weekly" | "biweekly" | "monthly" | "none";
  is_active?: boolean;
}

export interface UpdateSlotData {
  class_type_id?: string;
  day_of_week?: number;
  start_time?: string;
  duration_minutes?: number;
  capacity?: number;
  instructor?: string;
  is_recurring?: boolean;
  recurrence_pattern?: "weekly" | "biweekly" | "monthly" | "none";
  is_active?: boolean;
}

export interface ApplySlotToDaysData {
  slot: Omit<CreateSlotData, "day_of_week">;
  days: number[]; // Array of day_of_week numbers (0-6)
  mode: "skip" | "replace";
}

// Legacy interfaces for backward compatibility
export interface WeeklyTemplateSlot {
  id: string;
  gym_id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  class_type_id: string;
  class_type?: {
    name: string;
    emoji?: string;
  };
  capacity: number;
  instructor?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplySlotResult {
  createdDays: string[];
  skippedDays: string[];
  replacedDays: string[];
}

/**
 * Get all weekly template slots for a gym
 */
export async function getWeeklyTemplateSlots(gymId: string): Promise<{
  success: boolean;
  data?: WeeklyTemplateSlot[];
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

    // Get weekly template slots with class type information
    const { data: slots, error } = await supabase
      .from("weekly_template_slots")
      .select(
        `
        *,
        class_types!inner(
          name,
          emoji
        )
      `
      )
      .eq("gym_id", gymId)
      .order("day", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      log.error("Error getting weekly template slots", {
        gymId,
        error: error.message,
      });
      return { success: false, error: "Failed to fetch weekly template slots" };
    }

    // Transform the data to include class_type information
    const transformedSlots =
      slots?.map((slot) => ({
        ...slot,
        class_type: {
          name: slot.class_types.name,
          emoji: slot.class_types.emoji,
        },
      })) || [];

    return { success: true, data: transformedSlots };
  } catch (error) {
    log.error("Weekly template slots fetch error", { gymId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new weekly template slot
 */
export async function createWeeklyTemplateSlot(
  gymId: string,
  data: CreateSlotData
): Promise<{
  success: boolean;
  data?: WeeklyTemplateSlot;
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

    // Validate time slot doesn't cross day boundary
    const endTime = new Date(
      data.start_time.getTime() + data.duration_minutes * 60000
    );

    if (endTime.getDate() !== data.start_time.getDate()) {
      return {
        success: false,
        error:
          "Duration makes the class cross to the next day; reduce duration or change start time.",
      };
    }

    // Check for overlapping slots on the same day
    const { data: overlappingSlots } = await supabase
      .from("weekly_template_slots")
      .select("id, start_time, end_time")
      .eq("gym_id", gymId)
      .eq("day", data.day);

    if (overlappingSlots) {
      const hasOverlap = overlappingSlots.some((slot) => {
        const slotStart = new Date(slot.start_time);
        const slotEnd = new Date(slot.end_time);
        return hasTimeOverlap(data.start_time, endTime, slotStart, slotEnd);
      });

      if (hasOverlap) {
        return {
          success: false,
          error: "Time slot overlaps with existing class",
        };
      }
    }

    // Create the slot
    const { data: slot, error } = await supabase
      .from("weekly_template_slots")
      .insert({
        gym_id: gymId,
        day: data.day,
        start_time: data.start_time,
        end_time: endTime,
        duration_minutes: data.duration_minutes,
        class_type_id: data.class_type_id,
        capacity: data.capacity,
        instructor: data.instructor,
      })
      .select(
        `
        *,
        class_types!inner(
          name,
          emoji
        )
      `
      )
      .single();

    if (error) {
      log.error("Error creating weekly template slot", {
        gymId,
        data,
        error: error.message,
      });
      return { success: false, error: "Failed to create weekly template slot" };
    }

    // Transform the data
    const transformedSlot = {
      ...slot,
      class_type: {
        name: slot.class_types.name,
        emoji: slot.class_types.emoji,
      },
    };

    log.info("Weekly template slot created successfully", {
      slotId: slot.id,
      gymId,
      day: slot.day,
      startTime: slot.start_time,
    });

    return { success: true, data: transformedSlot };
  } catch (error) {
    log.error("Weekly template slot creation error", { gymId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing weekly template slot
 */
export async function updateWeeklyTemplateSlot(
  slotId: string,
  data: UpdateSlotData
): Promise<{
  success: boolean;
  data?: WeeklyTemplateSlot;
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

    // Get the slot and verify ownership
    const { data: slot, error: fetchError } = await supabase
      .from("weekly_template_slots")
      .select("*, gyms!inner(owner_id)")
      .eq("id", slotId)
      .single();

    if (fetchError || !slot) {
      return { success: false, error: "Weekly template slot not found" };
    }

    if (slot.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // If time is being updated, validate it doesn't cross day boundary
    if (data.start_time || data.duration_minutes) {
      const startTime = data.start_time || new Date(slot.start_time);
      const duration = data.duration_minutes || slot.duration_minutes;

      const end = new Date(startTime.getTime() + duration * 60000);

      if (end.getDate() !== startTime.getDate()) {
        return {
          success: false,
          error:
            "Duration makes the class cross to the next day; reduce duration or change start time.",
        };
      }
    }

    // If day or time is being updated, check for overlaps
    if (data.day || data.start_time || data.duration_minutes) {
      const day = data.day || slot.day;
      const startTime = data.start_time || new Date(slot.start_time);
      const duration = data.duration_minutes || slot.duration_minutes;

      const { data: overlappingSlots } = await supabase
        .from("weekly_template_slots")
        .select("id, start_time, end_time")
        .eq("gym_id", slot.gym_id)
        .eq("day", day)
        .neq("id", slotId);

      if (overlappingSlots) {
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const hasOverlap = overlappingSlots.some((existingSlot) => {
          const existingStart = new Date(existingSlot.start_time);
          const existingEnd = new Date(existingSlot.end_time);
          return hasTimeOverlap(startTime, endTime, existingStart, existingEnd);
        });

        if (hasOverlap) {
          return {
            success: false,
            error: "Time slot overlaps with existing class",
          };
        }
      }
    }

    // Prepare update data
    const updateData = { ...data };

    // If start_time is being updated, we need to calculate the new end_time
    if (data.start_time && !data.end_time) {
      const startTime = data.start_time;
      const duration = data.duration_minutes || slot.duration_minutes;
      updateData.end_time = new Date(startTime.getTime() + duration * 60000);
    }

    // If duration_minutes is being updated, we need to recalculate end_time
    if (data.duration_minutes && !data.end_time) {
      const startTime = data.start_time || new Date(slot.start_time);
      updateData.end_time = new Date(
        startTime.getTime() + data.duration_minutes * 60000
      );
    }

    // Update the slot
    const { data: updatedSlot, error } = await supabase
      .from("weekly_template_slots")
      .update(updateData)
      .eq("id", slotId)
      .select(
        `
        *,
        class_types!inner(
          name,
          emoji
        )
      `
      )
      .single();

    if (error) {
      log.error("Error updating weekly template slot", {
        slotId,
        data,
        error: error.message,
      });
      return { success: false, error: "Failed to update weekly template slot" };
    }

    // Transform the data
    const transformedSlot = {
      ...updatedSlot,
      class_type: {
        name: updatedSlot.class_types.name,
        emoji: updatedSlot.class_types.emoji,
      },
    };

    log.info("Weekly template slot updated successfully", {
      slotId: updatedSlot.id,
      day: updatedSlot.day,
      startTime: updatedSlot.start_time,
    });

    return { success: true, data: transformedSlot };
  } catch (error) {
    log.error("Weekly template slot update error", { slotId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a weekly template slot
 */
export async function deleteWeeklyTemplateSlot(slotId: string): Promise<{
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

    // Get the slot and verify ownership
    const { data: slot, error: fetchError } = await supabase
      .from("weekly_template_slots")
      .select("*, gyms!inner(owner_id)")
      .eq("id", slotId)
      .single();

    if (fetchError || !slot) {
      return { success: false, error: "Weekly template slot not found" };
    }

    if (slot.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Check if slot is being used in any classes
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("source_slot_id", slotId)
      .limit(1);

    if (classes && classes.length > 0) {
      return {
        success: false,
        error: "Cannot delete slot that is being used in classes",
      };
    }

    // Delete the slot
    const { error } = await supabase
      .from("weekly_template_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      log.error("Error deleting weekly template slot", {
        slotId,
        error: error.message,
      });
      return { success: false, error: "Failed to delete weekly template slot" };
    }

    log.info("Weekly template slot deleted successfully", {
      slotId,
      day: slot.day,
      startTime: slot.start_time,
    });

    return { success: true };
  } catch (error) {
    log.error("Weekly template slot deletion error", { slotId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Apply a slot to multiple days
 */
export async function applySlotToDays(
  gymId: string,
  data: ApplySlotToDaysData
): Promise<{
  success: boolean;
  data?: ApplySlotResult;
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

    const result: ApplySlotResult = {
      createdDays: [],
      skippedDays: [],
      replacedDays: [],
    };

    // Process each day
    for (const day of data.days) {
      // Check for existing slots on this day
      const { data: existingSlots } = await supabase
        .from("weekly_template_slots")
        .select("id, start_time, end_time")
        .eq("gym_id", gymId)
        .eq("day", day);

      if (existingSlots && existingSlots.length > 0) {
        // Check for overlaps
        const endTime = new Date(
          data.slot.start_time.getTime() + data.slot.duration_minutes * 60000
        );

        const hasOverlap = existingSlots.some((slot) => {
          const slotStart = new Date(slot.start_time);
          const slotEnd = new Date(slot.end_time);
          return hasTimeOverlap(
            data.slot.start_time,
            endTime,
            slotStart,
            slotEnd
          );
        });

        if (hasOverlap) {
          if (data.mode === "skip") {
            result.skippedDays.push(day);
            continue;
          } else if (data.mode === "replace") {
            // Delete overlapping slots
            const overlappingIds = existingSlots
              .filter((slot) => {
                const slotStart = new Date(slot.start_time);
                const slotEnd = new Date(slot.end_time);
                return hasTimeOverlap(
                  data.slot.start_time,
                  endTime,
                  slotStart,
                  slotEnd
                );
              })
              .map((slot) => slot.id);

            if (overlappingIds.length > 0) {
              await supabase
                .from("weekly_template_slots")
                .delete()
                .in("id", overlappingIds);
            }
            result.replacedDays.push(day);
          }
        }
      }

      // Create the slot for this day
      const slotEndTime = new Date(
        data.slot.start_time.getTime() + data.slot.duration_minutes * 60000
      );

      const { error } = await supabase.from("weekly_template_slots").insert({
        gym_id: gymId,
        day,
        start_time: data.slot.start_time,
        end_time: slotEndTime,
        duration_minutes: data.slot.duration_minutes,
        class_type_id: data.slot.class_type_id,
        capacity: data.slot.capacity,
        instructor: data.slot.instructor,
      });

      if (error) {
        log.error("Error creating slot for day", { day, error: error.message });
        result.skippedDays.push(day);
      } else {
        result.createdDays.push(day);
      }
    }

    log.info("Applied slot to multiple days", {
      gymId,
      days: data.days,
      mode: data.mode,
      result,
    });

    return { success: true, data: result };
  } catch (error) {
    log.error("Apply slot to days error", { gymId, data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}
