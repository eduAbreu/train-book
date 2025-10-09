import type { WeeklyTemplateSlot } from "@/types/schedule";
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
 * Transform database slots to UI format
 */
export function transformSlotsToTemplate(
  weeklySlots: WeeklyTemplateSlot[]
): WeeklyTemplate {
  const template: WeeklyTemplate = {};

  weeklySlots.forEach((slot: WeeklyTemplateSlot) => {
    if (!template[slot.day]) {
      template[slot.day] = [];
    }
    template[slot.day].push({
      id: slot.id,
      start: dateToTimeString(new Date(slot.start_time)),
      end: dateToTimeString(new Date(slot.end_time)),
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
