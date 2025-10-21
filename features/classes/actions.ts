/**
 * Server Actions for classes management
 */

"use server";

import { createClient } from "@/libs/supabase/server";
import { log } from "@/libs/log";

export interface Class {
  id: string;
  gym_id: string;
  date: string;
  start_time: string;
  end_time: string;
  class_type_id: string;
  capacity: number;
  instructor?: string;
  source_slot_id?: string;
  created_at: string;
  updated_at: string;
  class_type?: {
    id: string;
    name: string;
    emoji?: string;
  };
}

export interface Booking {
  id: string;
  gym_id: string;
  class_id: string;
  user_id?: string;
  participant: "student" | "guest";
  origin: "student" | "owner";
  guest_name?: string;
  guest_email?: string;
  status: "confirmed" | "waitlist";
  created_at: string;
  updated_at: string;
  class?: Class;
}

export interface CreateBookingData {
  class_id: string;
  participant: "student" | "guest";
  guest_name?: string;
  guest_email?: string;
}

/**
 * Get classes for a gym within a date range
 * This function generates class instances from weekly template slots if no actual classes exist
 */
export async function getClasses(
  gymId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  data?: Class[];
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

    // First, try to get actual classes
    const { data: existingClasses, error: classesError } = await supabase
      .from("classes")
      .select(
        `
        *,
        class_type:class_types(
          id,
          name,
          emoji
        )
      `
      )
      .eq("gym_id", gymId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (classesError) {
      log.error("Error getting classes", {
        gymId,
        startDate,
        endDate,
        error: classesError.message,
      });
      return { success: false, error: "Failed to fetch classes" };
    }

    // If we have actual classes, return them
    if (existingClasses && existingClasses.length > 0) {
      return { success: true, data: existingClasses };
    }

    // If no actual classes exist, generate them from weekly template slots
    const generatedClasses = await generateClassesFromTemplates(
      supabase,
      gymId,
      startDate,
      endDate
    );

    if (!generatedClasses.success) {
      return generatedClasses;
    }

    return { success: true, data: generatedClasses.data || [] };
  } catch (error) {
    log.error("Classes fetch error", { gymId, startDate, endDate, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a class from a generated class ID
 */
async function createClassFromGeneratedId(
  supabase: any,
  generatedId: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    log.info("Creating class from generated ID", { generatedId });

    // Parse the generated ID: generated_{gymId}_{date}_{startTime}_{classTypeId}
    const parts = generatedId.split("_");
    if (parts.length < 5) {
      log.error("Invalid generated class ID format", { generatedId, parts });
      return { success: false, error: "Invalid generated class ID format" };
    }

    const gymId = parts[1];
    const date = parts[2];
    const startTime = parts[3];
    const classTypeId = parts.slice(4).join("_"); // In case classTypeId has underscores

    log.info("Parsed generated ID", {
      gymId,
      date,
      startTime,
      classTypeId,
      partsCount: parts.length,
      allParts: parts,
    });

    // Get the template slot information
    // First, let's get all slots for this gym and class type, then find the matching one
    const { data: templateSlots, error: slotError } = await supabase
      .from("weekly_template_slots")
      .select(
        `
        *,
        class_type:class_types(
          id,
          name,
          emoji
        )
      `
      )
      .eq("gym_id", gymId)
      .eq("class_type_id", classTypeId);

    if (slotError) {
      log.error("Error finding template slots", {
        generatedId,
        gymId,
        classTypeId,
        error: slotError.message,
      });
      return {
        success: false,
        error: `Template slots not found: ${slotError.message}`,
      };
    }

    if (!templateSlots || templateSlots.length === 0) {
      log.error("No template slots found", {
        generatedId,
        gymId,
        classTypeId,
      });
      return {
        success: false,
        error: "No template slots found for this class type",
      };
    }

    // Find the matching slot by comparing the time components
    const targetTime = new Date(startTime);
    const targetHours = targetTime.getHours();
    const targetMinutes = targetTime.getMinutes();

    const templateSlot = templateSlots.find((slot: any) => {
      const slotTime = new Date(slot.start_time);
      const slotHours = slotTime.getHours();
      const slotMinutes = slotTime.getMinutes();
      return slotHours === targetHours && slotMinutes === targetMinutes;
    });

    if (!templateSlot) {
      log.error("No matching template slot found", {
        generatedId,
        gymId,
        classTypeId,
        startTime,
        targetHours,
        targetMinutes,
        availableSlots: templateSlots.map((s: any) => ({
          id: s.id,
          start_time: s.start_time,
          hours: new Date(s.start_time).getHours(),
          minutes: new Date(s.start_time).getMinutes(),
        })),
      });
      return {
        success: false,
        error: "No matching template slot found for this time",
      };
    }

    log.info("Found template slot", { templateSlot });

    // Create proper timestamps by combining the date with the time from template
    const templateStartTime = new Date(templateSlot.start_time);
    const templateEndTime = new Date(templateSlot.end_time);

    // Extract time components from template
    const startHours = templateStartTime.getHours();
    const startMinutes = templateStartTime.getMinutes();
    const endHours = templateEndTime.getHours();
    const endMinutes = templateEndTime.getMinutes();

    // Create new timestamps with the correct date
    const classStartTime = new Date(date);
    classStartTime.setHours(startHours, startMinutes, 0, 0);

    const classEndTime = new Date(date);
    classEndTime.setHours(endHours, endMinutes, 0, 0);

    // The database expects TIME type, not TIMESTAMP
    // Format as time strings (HH:MM:SS)
    const startTimeStr = `${startHours.toString().padStart(2, "0")}:${startMinutes.toString().padStart(2, "0")}:00`;
    const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}:00`;

    log.info("Creating class with timestamps", {
      date,
      classStartTime: startTimeStr,
      classEndTime: endTimeStr,
      templateStartTime: templateSlot.start_time,
      templateEndTime: templateSlot.end_time,
    });

    // Create the actual class using service role to bypass RLS
    const { createClient: createServiceClient } = await import(
      "@supabase/supabase-js"
    );
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: newClass, error: createError } = await serviceSupabase
      .from("classes")
      .insert({
        gym_id: gymId,
        date: date,
        start_time: startTimeStr,
        end_time: endTimeStr,
        class_type_id: classTypeId,
        capacity: templateSlot.capacity,
        instructor: templateSlot.instructor,
        source_slot_id: templateSlot.id,
      })
      .select(
        `
        *,
        class_type:class_types(
          id,
          name,
          emoji
        )
      `
      )
      .single();

    if (createError) {
      log.error("Error creating class from template", {
        generatedId,
        templateSlot,
        error: createError.message,
        details: createError,
      });
      return {
        success: false,
        error: `Failed to create class: ${createError.message}`,
      };
    }

    log.info("Successfully created class from template", { newClass });
    return { success: true, data: newClass };
  } catch (error) {
    log.error("Error creating class from generated ID", { generatedId, error });
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

/**
 * Generate class instances from weekly template slots for a date range
 */
async function generateClassesFromTemplates(
  supabase: any,
  gymId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean;
  data?: Class[];
  error?: string;
}> {
  try {
    // Get weekly template slots with class type information
    const { data: templateSlots, error: slotsError } = await supabase
      .from("weekly_template_slots")
      .select(
        `
        *,
        class_type:class_types(
          id,
          name,
          emoji
        )
      `
      )
      .eq("gym_id", gymId)
      .order("day", { ascending: true })
      .order("start_time", { ascending: true });

    if (slotsError) {
      log.error("Error getting template slots", {
        gymId,
        error: slotsError.message,
      });
      return { success: false, error: "Failed to fetch template slots" };
    }

    if (!templateSlots || templateSlots.length === 0) {
      return { success: true, data: [] };
    }

    // Generate class instances for each day in the date range
    const generatedClasses: Class[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Day mapping from JavaScript Date.getDay() to our day format
    const dayMapping = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = dayMapping[date.getDay()];
      const dateStr = date.toISOString().split("T")[0];

      // Find template slots for this day
      const daySlots = templateSlots.filter(
        (slot: any) => slot.day === dayOfWeek
      );

      for (const slot of daySlots) {
        // Create class instance from template slot
        // Use a separator that won't conflict with UUIDs or timestamps
        const classInstance: Class = {
          id: `generated_${gymId}_${dateStr}_${slot.start_time}_${slot.class_type_id}`,
          gym_id: gymId,
          date: dateStr,
          start_time: slot.start_time,
          end_time: slot.end_time,
          class_type_id: slot.class_type_id,
          capacity: slot.capacity,
          instructor: slot.instructor,
          source_slot_id: slot.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          class_type: slot.class_type,
        };

        generatedClasses.push(classInstance);
      }
    }

    // Sort by date and start time
    generatedClasses.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.start_time.localeCompare(b.start_time);
    });

    return { success: true, data: generatedClasses };
  } catch (error) {
    log.error("Error generating classes from templates", {
      gymId,
      startDate,
      endDate,
      error,
    });
    return {
      success: false,
      error: "Failed to generate classes from templates",
    };
  }
}

/**
 * Get bookings for a user
 */
export async function getUserBookings(
  userId: string,
  gymId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  data?: Booking[];
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

    // Ensure user can only access their own bookings
    if (user.id !== userId) {
      return { success: false, error: "Access denied" };
    }

    let query = supabase
      .from("bookings")
      .select(
        `
        *,
        class:classes(
          *,
          class_type:class_types(
            id,
            name,
            emoji
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("gym_id", gymId)
      .eq("participant", "student")
      .order("created_at", { ascending: false });

    if (startDate && endDate) {
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    }

    const { data: bookings, error } = await query;

    if (error) {
      log.error("Error getting user bookings", {
        userId,
        gymId,
        error: error.message,
      });
      return { success: false, error: "Failed to fetch bookings" };
    }

    return { success: true, data: bookings || [] };
  } catch (error) {
    log.error("User bookings fetch error", { userId, gymId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<{
  success: boolean;
  data?: Booking;
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

    // Check if this is a generated class ID (starts with "generated_")
    let classData: any;

    if (data.class_id.startsWith("generated_")) {
      // This is a generated class, we need to create it first
      const generatedClass = await createClassFromGeneratedId(
        supabase,
        data.class_id
      );
      if (!generatedClass.success || !generatedClass.data) {
        return {
          success: false,
          error: "Failed to create class from template",
        };
      }
      classData = generatedClass.data;
    } else {
      // This is an existing class, fetch it
      const { data: existingClass, error: classError } = await supabase
        .from("classes")
        .select(
          `
          *,
          class_type:class_types(
            id,
            name,
            emoji
          )
        `
        )
        .eq("id", data.class_id)
        .single();

      if (classError || !existingClass) {
        return { success: false, error: "Class not found" };
      }
      classData = existingClass;
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

    if (profile.role === "student" && profile.gym_id !== classData.gym_id) {
      return { success: false, error: "Access denied" };
    }

    // Check for existing booking
    if (data.participant === "student") {
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("class_id", data.class_id)
        .eq("user_id", user.id)
        .eq("participant", "student")
        .single();

      if (existingBooking) {
        return { success: false, error: "You have already booked this class" };
      }
    }

    // Check for booking conflicts (overlapping classes)
    if (data.participant === "student") {
      const { data: conflictingBookings } = await supabase
        .from("bookings")
        .select(
          `
          class:classes(
            date,
            start_time,
            end_time
          )
        `
        )
        .eq("user_id", user.id)
        .eq("participant", "student")
        .eq("status", "confirmed")
        .eq("gym_id", classData.gym_id);

      const hasConflict = conflictingBookings?.some((booking) => {
        const existingClass = Array.isArray(booking.class)
          ? booking.class[0]
          : booking.class;
        if (!existingClass || existingClass.date !== classData.date)
          return false;

        const existingStart = existingClass.start_time;
        const existingEnd = existingClass.end_time;
        const newStart = classData.start_time;
        const newEnd = classData.end_time;

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasConflict) {
        return {
          success: false,
          error: "You have a conflicting class booking",
        };
      }
    }

    // Check class capacity and determine booking status
    const { data: confirmedBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("class_id", data.class_id)
      .eq("status", "confirmed");

    const confirmedCount = confirmedBookings?.length || 0;
    const isClassFull = confirmedCount >= classData.capacity;

    let status: "confirmed" | "waitlist" = "confirmed";

    if (isClassFull) {
      // Check gym settings for waitlist
      const { data: gymSettings } = await supabase
        .from("gym_settings")
        .select("allow_waitlist")
        .eq("gym_id", classData.gym_id)
        .single();

      if (!gymSettings?.allow_waitlist) {
        return {
          success: false,
          error: "Class is full and waitlist is not enabled",
        };
      }

      status = "waitlist";
    }

    // Create booking
    const bookingData: any = {
      gym_id: classData.gym_id,
      class_id: classData.id, // Use the actual class ID, not the generated one
      participant: data.participant,
      origin: "student",
      status,
    };

    if (data.participant === "student") {
      bookingData.user_id = user.id;
    } else {
      bookingData.guest_name = data.guest_name;
      bookingData.guest_email = data.guest_email;
    }

    // Use service role for booking creation to bypass RLS
    const { createClient: createServiceClient } = await import(
      "@supabase/supabase-js"
    );
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: booking, error } = await serviceSupabase
      .from("bookings")
      .insert(bookingData)
      .select(
        `
        *,
        class:classes(
          *,
          class_type:class_types(
            id,
            name,
            emoji
          )
        )
      `
      )
      .single();

    if (error) {
      log.error("Error creating booking", { data, error: error.message });
      return { success: false, error: "Failed to create booking" };
    }

    log.info("Booking created successfully", {
      bookingId: booking.id,
      classId: data.class_id,
      userId: user.id,
      status: booking.status,
    });

    return { success: true, data: booking };
  } catch (error) {
    log.error("Booking creation error", { data, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string): Promise<{
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

    // Get booking information
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        class:classes(
          date,
          start_time,
          gym_id
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Booking not found" };
    }

    // Ensure user can only cancel their own bookings
    if (booking.user_id !== user.id || booking.participant !== "student") {
      return { success: false, error: "Access denied" };
    }

    // Check cancellation time limit
    const { data: gymSettings } = await supabase
      .from("gym_settings")
      .select("cancel_limit_hours")
      .eq("gym_id", booking.class.gym_id)
      .single();

    const cancelLimitHours = gymSettings?.cancel_limit_hours || 24;
    const classDateTime = new Date(
      `${booking.class.date}T${booking.class.start_time}`
    );
    const now = new Date();
    const hoursUntilClass =
      (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilClass < cancelLimitHours) {
      return {
        success: false,
        error: `Cannot cancel booking. Must cancel at least ${cancelLimitHours} hours before class.`,
      };
    }

    // Delete booking
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      log.error("Error canceling booking", { bookingId, error: error.message });
      return { success: false, error: "Failed to cancel booking" };
    }

    log.info("Booking canceled successfully", {
      bookingId,
      userId: user.id,
    });

    return { success: true };
  } catch (error) {
    log.error("Booking cancellation error", { bookingId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get class booking counts
 */
export async function getClassBookingCounts(classId: string): Promise<{
  success: boolean;
  data?: { confirmedCount: number; waitlistCount: number };
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

    // Get booking counts
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("status")
      .eq("class_id", classId);

    if (error) {
      log.error("Error getting class booking counts", {
        classId,
        error: error.message,
      });
      return { success: false, error: "Failed to fetch booking counts" };
    }

    const confirmedCount =
      bookings?.filter((b) => b.status === "confirmed").length || 0;
    const waitlistCount =
      bookings?.filter((b) => b.status === "waitlist").length || 0;

    return {
      success: true,
      data: { confirmedCount, waitlistCount },
    };
  } catch (error) {
    log.error("Class booking counts error", { classId, error });
    return { success: false, error: "An unexpected error occurred" };
  }
}
