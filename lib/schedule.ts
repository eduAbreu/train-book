/**
 * Schedule utility functions
 */

export interface Slot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/**
 * Compute end time from start time and duration
 */
export function computeEnd(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60000);
}

/**
 * Compute end time from start time string and duration (legacy support)
 */
export function computeEndFromString(
  startTime: string,
  durationMinutes: number
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Validate that a time slot doesn't cross day boundary
 */
export function validateNoCrossingDay(
  startTime: Date,
  durationMinutes: number
): boolean {
  if (!startTime || !durationMinutes) return true;

  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  // Check if end time is on the same day as start time
  return endTime.getDate() === startTime.getDate();
}

/**
 * Validate that a time slot doesn't cross day boundary (legacy string support)
 */
export function validateNoCrossingDayFromString(
  startTime: string,
  durationMinutes: number
): boolean {
  if (!startTime || !durationMinutes) return true;
  const [hours, minutes] = startTime.split(":").map(Number);

  // Convert to total minutes from midnight
  const startTotalMinutes = hours * 60 + minutes;
  const endTotalMinutes = startTotalMinutes + durationMinutes;

  // Check if end time exceeds 24 hours (1440 minutes)
  return endTotalMinutes <= 1440;
}

/**
 * Calculate duration from slot
 */
export function calculateDurationFromSlot(slot: Slot): number {
  const [startHours, startMinutes] = slot.start.split(":").map(Number);
  const [endHours, endMinutes] = slot.end.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes - startTotalMinutes;
}

/**
 * Apply slot to multiple days
 */
export interface ApplySlotToDaysParams {
  slot: Omit<Slot, "id">;
  targetDays: Day[];
  weeklyTemplate: { [key: string]: Slot[] };
  mode: "skip-conflicts" | "replace-conflicts";
}

export interface ApplySlotResult {
  createdDays: string[];
  skippedDays: string[];
  replacedDays: string[];
}

export function applySlotToDays({
  slot,
  targetDays,
  weeklyTemplate,
  mode,
}: ApplySlotToDaysParams): ApplySlotResult {
  const result: ApplySlotResult = {
    createdDays: [],
    skippedDays: [],
    replacedDays: [],
  };

  for (const day of targetDays) {
    const daySlots = weeklyTemplate[day] || [];

    // Check for overlaps
    const hasOverlap = daySlots.some((existingSlot) => {
      return slot.start < existingSlot.end && slot.end > existingSlot.start;
    });

    if (hasOverlap) {
      if (mode === "skip-conflicts") {
        result.skippedDays.push(day);
        continue;
      } else if (mode === "replace-conflicts") {
        // Remove overlapping slots
        weeklyTemplate[day] = daySlots.filter((existingSlot) => {
          return !(
            slot.start < existingSlot.end && slot.end > existingSlot.start
          );
        });
        result.replacedDays.push(day);
      }
    }

    // Add the new slot
    const newSlot: Slot = {
      ...slot,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    if (!weeklyTemplate[day]) {
      weeklyTemplate[day] = [];
    }
    weeklyTemplate[day].push(newSlot);
    result.createdDays.push(day);
  }

  return result;
}

/**
 * Convert time string to Date object
 */
export function timeStringToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  // Use a fixed date (2024-01-01) to avoid timezone issues
  const date = new Date(2024, 0, 1, hours, minutes, 0, 0);
  return date;
}

/**
 * Convert Date object to time string
 */
export function dateToTimeString(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Check if two time slots overlap
 */
export function hasTimeOverlap(
  slot1: { start: Date; end: Date },
  slot2: { start: Date; end: Date }
): boolean {
  return slot1.start < slot2.end && slot1.end > slot2.start;
}
