/**
 * Server Actions for schedule slots management (New Structure)
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { log } from "@/libs/log";

/**
 * Check if two time slots overlap (ignoring date, only comparing time)
 */
function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert time strings to minutes for comparison
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start1Time = timeToMinutes(start1);
  const end1Time = timeToMinutes(end1);
  const start2Time = timeToMinutes(start2);
  const end2Time = timeToMinutes(end2);

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

export interface ApplySlotResult {
  createdDays: number[];
  skippedDays: number[];
  replacedDays: number[];
}

/**
 * Get all schedule slots for a gym
 */
export async function getScheduleSlots(gymId: string): Promise<{
  success: boolean;
  data?: ScheduleSlot[];
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
        return { success: false, error: "Access denied to this gym" };
      }
    } else {
      return { success: false, error: "Invalid user role" };
    }

    // Fetch schedule slots with class type information
    const { data: slots, error } = await supabase
      .from("schedule_slots")
      .select(
        `
        *,
        class_types (
          id,
          name,
          emoji
        )
      `
      )
      .eq("gym_id", gymId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      log.error("Error fetching schedule slots:", error);
      return { success: false, error: "Failed to fetch schedule slots" };
    }

    // Transform the data to include class type information
    const transformedSlots: ScheduleSlot[] = slots.map((slot) => ({
      id: slot.id,
      gym_id: slot.gym_id,
      class_type_id: slot.class_type_id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      duration_minutes: slot.duration_minutes,
      capacity: slot.capacity,
      instructor: slot.instructor,
      is_recurring: slot.is_recurring,
      recurrence_pattern: slot.recurrence_pattern,
      is_active: slot.is_active,
      created_at: slot.created_at,
      updated_at: slot.updated_at,
      class_type: slot.class_types
        ? {
            id: slot.class_types.id,
            name: slot.class_types.name,
            emoji: slot.class_types.emoji,
          }
        : undefined,
    }));

    return { success: true, data: transformedSlots };
  } catch (error) {
    log.error("Unexpected error in getScheduleSlots:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new schedule slot
 */
export async function createScheduleSlot(
  gymId: string,
  data: CreateSlotData
): Promise<{
  success: boolean;
  data?: ScheduleSlot;
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

    // Calculate end time for overlap checking
    const startTime = new Date(`2000-01-01T${data.start_time}`);
    const endTime = new Date(
      startTime.getTime() + data.duration_minutes * 60000
    );
    const endTimeString = endTime.toTimeString().slice(0, 8);

    // Check for overlapping slots on the same day
    const { data: existingSlots } = await supabase
      .from("schedule_slots")
      .select("start_time, end_time")
      .eq("gym_id", gymId)
      .eq("day_of_week", data.day_of_week)
      .eq("is_active", true);

    if (existingSlots) {
      const hasOverlap = existingSlots.some((slot) =>
        hasTimeOverlap(
          data.start_time,
          endTimeString,
          slot.start_time,
          slot.end_time
        )
      );

      if (hasOverlap) {
        return {
          success: false,
          error: "Time slot overlaps with existing class",
        };
      }
    }

    // Create the slot
    const { data: newSlot, error } = await supabase
      .from("schedule_slots")
      .insert({
        gym_id: gymId,
        class_type_id: data.class_type_id,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        duration_minutes: data.duration_minutes,
        capacity: data.capacity,
        instructor: data.instructor || null,
        is_recurring: data.is_recurring ?? true,
        recurrence_pattern: data.recurrence_pattern ?? "weekly",
        is_active: data.is_active ?? true,
      })
      .select(
        `
        *,
        class_types (
          id,
          name,
          emoji
        )
      `
      )
      .single();

    if (error) {
      log.error("Error creating schedule slot:", error);
      return { success: false, error: "Failed to create schedule slot" };
    }

    // Transform the response
    const transformedSlot: ScheduleSlot = {
      id: newSlot.id,
      gym_id: newSlot.gym_id,
      class_type_id: newSlot.class_type_id,
      day_of_week: newSlot.day_of_week,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      duration_minutes: newSlot.duration_minutes,
      capacity: newSlot.capacity,
      instructor: newSlot.instructor,
      is_recurring: newSlot.is_recurring,
      recurrence_pattern: newSlot.recurrence_pattern,
      is_active: newSlot.is_active,
      created_at: newSlot.created_at,
      updated_at: newSlot.updated_at,
      class_type: newSlot.class_types
        ? {
            id: newSlot.class_types.id,
            name: newSlot.class_types.name,
            emoji: newSlot.class_types.emoji,
          }
        : undefined,
    };

    return { success: true, data: transformedSlot };
  } catch (error) {
    log.error("Unexpected error in createScheduleSlot:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing schedule slot
 */
export async function updateScheduleSlot(
  slotId: string,
  data: UpdateSlotData
): Promise<{
  success: boolean;
  data?: ScheduleSlot;
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

    // Get the slot to verify ownership
    const { data: slot, error: slotError } = await supabase
      .from("schedule_slots")
      .select("gym_id, gyms!inner(owner_id)")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) {
      return { success: false, error: "Schedule slot not found" };
    }

    // Ensure user is the gym owner
    if (slot.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Prepare update data
    const updateData: any = { ...data };

    // Calculate end time if start_time or duration_minutes changed
    if (data.start_time || data.duration_minutes) {
      const { data: currentSlot } = await supabase
        .from("schedule_slots")
        .select("start_time, duration_minutes")
        .eq("id", slotId)
        .single();

      const startTime = data.start_time || currentSlot.start_time;
      const duration = data.duration_minutes || currentSlot.duration_minutes;

      const startTimeDate = new Date(`2000-01-01T${startTime}`);
      const endTime = new Date(startTimeDate.getTime() + duration * 60000);
      updateData.end_time = endTime.toTimeString().slice(0, 8);
    }

    // Check for overlaps if time changed
    if (data.start_time || data.day_of_week) {
      const { data: existingSlots } = await supabase
        .from("schedule_slots")
        .select("start_time, end_time")
        .eq("gym_id", slot.gym_id)
        .eq("day_of_week", data.day_of_week ?? slot.day_of_week)
        .eq("is_active", true)
        .neq("id", slotId);

      if (existingSlots) {
        const startTime = data.start_time || slot.start_time;
        const endTime = updateData.end_time || slot.end_time;

        const hasOverlap = existingSlots.some((existingSlot) =>
          hasTimeOverlap(
            startTime,
            endTime,
            existingSlot.start_time,
            existingSlot.end_time
          )
        );

        if (hasOverlap) {
          return {
            success: false,
            error: "Time slot overlaps with existing class",
          };
        }
      }
    }

    // Update the slot
    const { data: updatedSlot, error } = await supabase
      .from("schedule_slots")
      .update(updateData)
      .eq("id", slotId)
      .select(
        `
        *,
        class_types (
          id,
          name,
          emoji
        )
      `
      )
      .single();

    if (error) {
      log.error("Error updating schedule slot:", error);
      return { success: false, error: "Failed to update schedule slot" };
    }

    // Transform the response
    const transformedSlot: ScheduleSlot = {
      id: updatedSlot.id,
      gym_id: updatedSlot.gym_id,
      class_type_id: updatedSlot.class_type_id,
      day_of_week: updatedSlot.day_of_week,
      start_time: updatedSlot.start_time,
      end_time: updatedSlot.end_time,
      duration_minutes: updatedSlot.duration_minutes,
      capacity: updatedSlot.capacity,
      instructor: updatedSlot.instructor,
      is_recurring: updatedSlot.is_recurring,
      recurrence_pattern: updatedSlot.recurrence_pattern,
      is_active: updatedSlot.is_active,
      created_at: updatedSlot.created_at,
      updated_at: updatedSlot.updated_at,
      class_type: updatedSlot.class_types
        ? {
            id: updatedSlot.class_types.id,
            name: updatedSlot.class_types.name,
            emoji: updatedSlot.class_types.emoji,
          }
        : undefined,
    };

    return { success: true, data: transformedSlot };
  } catch (error) {
    log.error("Unexpected error in updateScheduleSlot:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a schedule slot
 */
export async function deleteScheduleSlot(slotId: string): Promise<{
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

    // Get the slot to verify ownership
    const { data: slot, error: slotError } = await supabase
      .from("schedule_slots")
      .select("gym_id, gyms!inner(owner_id)")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) {
      return { success: false, error: "Schedule slot not found" };
    }

    // Ensure user is the gym owner
    if (slot.gyms.owner_id !== user.id) {
      return { success: false, error: "Access denied" };
    }

    // Check if slot is being used in classes
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("schedule_slot_id", slotId)
      .limit(1);

    if (classes && classes.length > 0) {
      return {
        success: false,
        error: "Cannot delete slot that is being used in classes",
      };
    }

    // Delete the slot
    const { error } = await supabase
      .from("schedule_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      log.error("Error deleting schedule slot:", error);
      return { success: false, error: "Failed to delete schedule slot" };
    }

    return { success: true };
  } catch (error) {
    log.error("Unexpected error in deleteScheduleSlot:", error);
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

    // Calculate end time for overlap checking
    const startTime = new Date(`2000-01-01T${data.slot.start_time}`);
    const endTime = new Date(
      startTime.getTime() + data.slot.duration_minutes * 60000
    );
    const endTimeString = endTime.toTimeString().slice(0, 8);

    // Process each day
    for (const dayOfWeek of data.days) {
      // Check for existing slots on this day
      const { data: existingSlots } = await supabase
        .from("schedule_slots")
        .select("id, start_time, end_time")
        .eq("gym_id", gymId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true);

      if (existingSlots && existingSlots.length > 0) {
        // Check for overlaps
        const hasOverlap = existingSlots.some((slot) =>
          hasTimeOverlap(
            data.slot.start_time,
            endTimeString,
            slot.start_time,
            slot.end_time
          )
        );

        if (hasOverlap) {
          // Always use replace mode to avoid conflicts
          // Delete overlapping slots
          const overlappingIds = existingSlots
            .filter((slot) =>
              hasTimeOverlap(
                data.slot.start_time,
                endTimeString,
                slot.start_time,
                slot.end_time
              )
            )
            .map((slot) => slot.id);

          if (overlappingIds.length > 0) {
            await supabase
              .from("schedule_slots")
              .delete()
              .in("id", overlappingIds);
          }
          result.replacedDays.push(dayOfWeek);
        }
      }

      // Create the slot for this day
      const { error } = await supabase.from("schedule_slots").insert({
        gym_id: gymId,
        class_type_id: data.slot.class_type_id,
        day_of_week: dayOfWeek,
        start_time: data.slot.start_time,
        duration_minutes: data.slot.duration_minutes,
        capacity: data.slot.capacity,
        instructor: data.slot.instructor || null,
        is_recurring: data.slot.is_recurring ?? true,
        recurrence_pattern: data.slot.recurrence_pattern ?? "weekly",
        is_active: data.slot.is_active ?? true,
      });

      if (error) {
        log.error("Error creating slot for day:", error);
        result.skippedDays.push(dayOfWeek);
      } else {
        result.createdDays.push(dayOfWeek);
      }
    }

    return { success: true, data: result };
  } catch (error) {
    log.error("Unexpected error in applySlotToDays:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a single class
 */
export async function createSingleClass(
  gymId: string,
  data: {
    date: string;
    time: string;
    classTypeId: string;
    capacity: number;
    instructor?: string;
  }
): Promise<{
  success: boolean;
  data?: any;
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

    // Calculate end time
    const startTime = new Date(`2000-01-01T${data.time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60000); // Default 60 minutes
    const endTimeString = endTime.toTimeString().slice(0, 8);

    // Create the class
    const { data: newClass, error } = await supabase
      .from("classes")
      .insert({
        gym_id: gymId,
        date: data.date,
        start_time: data.time,
        end_time: endTimeString,
        class_type_id: data.classTypeId,
        capacity: data.capacity,
        instructor: data.instructor || null,
        status: "scheduled",
      })
      .select(
        `
        *,
        class_types (
          id,
          name,
          emoji
        )
      `
      )
      .single();

    if (error) {
      log.error("Error creating single class:", error);
      return { success: false, error: "Failed to create class" };
    }

    return { success: true, data: newClass };
  } catch (error) {
    log.error("Unexpected error in createSingleClass:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create multiple recurring classes
 */
export async function createRecurringClasses(
  gymId: string,
  data: {
    startDate: string;
    endDate: string;
    daysOfWeek: number[];
    time: string;
    classTypeId: string;
    capacity: number;
    instructor?: string;
  }
): Promise<{
  success: boolean;
  data?: { created_count: number };
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

    // Calculate end time
    const startTime = new Date(`2000-01-01T${data.time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60000); // Default 60 minutes
    const endTimeString = endTime.toTimeString().slice(0, 8);

    // Generate classes for the date range
    const classes = [];
    const currentDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (data.daysOfWeek.includes(dayOfWeek)) {
        classes.push({
          gym_id: gymId,
          date: currentDate.toISOString().split("T")[0],
          start_time: data.time,
          end_time: endTimeString,
          class_type_id: data.classTypeId,
          capacity: data.capacity,
          instructor: data.instructor || null,
          status: "scheduled",
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (classes.length === 0) {
      return {
        success: false,
        error: "No classes to create for the selected criteria",
      };
    }

    // Insert all classes
    const { error } = await supabase.from("classes").insert(classes);

    if (error) {
      log.error("Error creating recurring classes:", error);
      return { success: false, error: "Failed to create classes" };
    }

    return { success: true, data: { created_count: classes.length } };
  } catch (error) {
    log.error("Unexpected error in createRecurringClasses:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get classes for a gym
 */
export async function getClasses(
  gymId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  data?: any[];
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
        return { success: false, error: "Access denied to this gym" };
      }
    } else {
      return { success: false, error: "Invalid user role" };
    }

    // Build query
    let query = supabase
      .from("classes")
      .select(
        `
        *,
        class_types (
          id,
          name,
          emoji
        )
      `
      )
      .eq("gym_id", gymId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    // Add date filters if provided
    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: classes, error } = await query;

    if (error) {
      log.error("Error fetching classes:", error);
      return { success: false, error: "Failed to fetch classes" };
    }

    return { success: true, data: classes || [] };
  } catch (error) {
    log.error("Unexpected error in getClasses:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Generate classes from schedule slots for a date range
 */
export async function generateClassesFromSlots(
  gymId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  data?: { generated_count: number };
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

    // Call the database function
    const { data, error } = await supabase.rpc("generate_classes_from_slots", {
      p_gym_id: gymId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      log.error("Error generating classes:", error);
      return { success: false, error: "Failed to generate classes" };
    }

    return { success: true, data: { generated_count: data || 0 } };
  } catch (error) {
    log.error("Unexpected error in generateClassesFromSlots:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
