import type { WeeklyTemplateSlot, ScheduleSlot } from "@/types/schedule";
import type { ClassType } from "@/features/class-types/actions";
import { dateToTimeString, timeStringToDate } from "@/lib/schedule";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

interface WeeklyTemplate {
  [key: string]: TimeSlot[];
}

/**
 * Transform database slots to UI format (supports both new and legacy structures)
 */
export function transformSlotsToTemplate(
  slots: (WeeklyTemplateSlot | ScheduleSlot)[]
): WeeklyTemplate {
  const template: WeeklyTemplate = {};
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  slots.forEach((slot) => {
    let day: string;
    let startTime: string;
    let endTime: string;

    // Check if it's a new ScheduleSlot or legacy WeeklyTemplateSlot
    if ("day_of_week" in slot) {
      // New ScheduleSlot structure
      day = dayMap[slot.day_of_week];
      startTime = slot.start_time;
      endTime = slot.end_time;
    } else {
      // Legacy WeeklyTemplateSlot structure
      day = slot.day;
      startTime = dateToTimeString(new Date(slot.start_time));
      endTime = dateToTimeString(new Date(slot.end_time));
    }

    if (!template[day]) {
      template[day] = [];
    }
    template[day].push({
      id: slot.id,
      start: startTime,
      end: endTime,
      classTypeId: slot.class_type_id,
      capacity: slot.capacity,
      instructor: slot.instructor,
    });
  });

  return template;
}

/**
 * Get slot count for a specific day
 */
export function getSlotCount(
  weeklyTemplate: WeeklyTemplate,
  day: string
): number {
  return (weeklyTemplate[day] || []).length;
}

/**
 * Get class type name by ID
 */
export function getClassTypeName(
  classTypes: ClassType[] | undefined,
  classTypeId: string
): string {
  const classType = classTypes?.find((ct) => ct.id === classTypeId);
  return classType?.name || "Unknown";
}

/**
 * Check if user has permission to access schedule
 */
export function hasSchedulePermission(
  user: any,
  profile: any,
  isOwner: boolean,
  hasGym: boolean
): boolean {
  return !!(user && profile && isOwner && hasGym);
}

/**
 * Get default form data for new slot
 */
export function getDefaultFormData(classTypes: ClassType[] | undefined) {
  return {
    start: "",
    durationMinutes: 60,
    classTypeId: classTypes && classTypes.length > 0 ? classTypes[0].id : "",
    capacity: 1,
    instructor: "",
  };
}

/**
 * Get only changed fields for slot update
 */
export function getChangedFields(
  formData: any,
  originalSlot: any
): Record<string, any> {
  const updateData: Record<string, any> = {};

  if (formData.start !== dateToTimeString(originalSlot.start_time)) {
    updateData.start_time = timeStringToDate(formData.start);
  }
  if (
    Number(formData.durationMinutes) !== Number(originalSlot.duration_minutes)
  ) {
    updateData.duration_minutes = formData.durationMinutes;
  }
  if (formData.classTypeId !== originalSlot.class_type_id) {
    updateData.class_type_id = formData.classTypeId;
  }
  if (formData.capacity !== originalSlot.capacity) {
    updateData.capacity = formData.capacity;
  }
  if ((formData.instructor || null) !== originalSlot.instructor) {
    updateData.instructor = formData.instructor || null;
  }

  return updateData;
}

/**
 * Check if time-related fields were changed
 */
export function hasTimeChanged(formData: any, originalSlot: any): boolean {
  const startChanged = formData.start !== originalSlot.start_time;
  const durationChanged =
    Number(formData.durationMinutes) !== Number(originalSlot.duration_minutes);

  return startChanged || durationChanged;
}

/**
 * Convert day string to day_of_week number
 */
export function dayStringToNumber(day: string): number {
  const dayMap: { [key: string]: number } = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return dayMap[day] ?? 1; // Default to Monday
}

/**
 * Convert day_of_week number to day string
 */
export function dayNumberToString(dayOfWeek: number): string {
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayMap[dayOfWeek] ?? "Mon";
}

/**
 * Convert legacy WeeklyTemplateSlot to new ScheduleSlot format
 */
export function convertLegacyToNewSlot(
  legacySlot: WeeklyTemplateSlot
): ScheduleSlot {
  return {
    id: legacySlot.id,
    gym_id: legacySlot.gym_id,
    class_type_id: legacySlot.class_type_id,
    day_of_week: dayStringToNumber(legacySlot.day),
    start_time: dateToTimeString(new Date(legacySlot.start_time)),
    end_time: dateToTimeString(new Date(legacySlot.end_time)),
    duration_minutes: legacySlot.duration_minutes,
    capacity: legacySlot.capacity,
    instructor: legacySlot.instructor,
    is_recurring: true,
    recurrence_pattern: "weekly",
    is_active: true,
    created_at: legacySlot.created_at,
    updated_at: legacySlot.updated_at,
    class_type: legacySlot.class_type,
  };
}

/**
 * Convert new ScheduleSlot to legacy WeeklyTemplateSlot format
 */
export function convertNewToLegacySlot(
  newSlot: ScheduleSlot
): WeeklyTemplateSlot {
  return {
    id: newSlot.id,
    gym_id: newSlot.gym_id,
    day: dayNumberToString(newSlot.day_of_week) as
      | "Mon"
      | "Tue"
      | "Wed"
      | "Thu"
      | "Fri"
      | "Sat"
      | "Sun",
    start_time: new Date(`2000-01-01T${newSlot.start_time}`),
    end_time: new Date(`2000-01-01T${newSlot.end_time}`),
    duration_minutes: newSlot.duration_minutes,
    class_type_id: newSlot.class_type_id,
    class_type: newSlot.class_type,
    capacity: newSlot.capacity,
    instructor: newSlot.instructor,
    created_at: newSlot.created_at,
    updated_at: newSlot.updated_at,
  };
}
