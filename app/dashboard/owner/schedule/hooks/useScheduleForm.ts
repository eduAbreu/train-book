import { useState, useEffect } from "react";
import type { WeeklyTemplateSlot } from "@/types/schedule";
import {
  computeEnd,
  validateNoCrossingDay,
  calculateDurationFromSlot,
  timeStringToDate,
  dateToTimeString,
  hasTimeOverlap,
} from "@/lib/schedule";
import { hasTimeChanged } from "../utils/scheduleHelpers";

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

interface FormData {
  start: string; // Keep as string for input compatibility
  startDate?: Date; // Internal Date representation
  durationMinutes: number;
  classTypeId: string;
  capacity: number;
  instructor: string;
}

export function useScheduleForm(
  classTypes: any[] | undefined,
  activeDay: string
) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<WeeklyTemplateSlot | null>(
    null
  );
  const [formData, setFormData] = useState<FormData>({
    start: "",
    durationMinutes: 60,
    classTypeId: "",
    capacity: 1,
    instructor: "",
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  // Always use replace mode to avoid conflicts
  const conflictMode = "replace";

  // Initialize form with default class type when class types are loaded
  useEffect(() => {
    if (classTypes && classTypes.length > 0 && !formData.classTypeId) {
      setFormData((prev) => ({
        ...prev,
        classTypeId: classTypes[0].id,
      }));
    }
  }, [classTypes, formData.classTypeId]);

  const handleAddSlot = () => {
    setEditingSlot(null);
    const defaultClassType =
      classTypes && classTypes.length > 0 ? classTypes[0].id : "";
    setFormData({
      start: "",
      durationMinutes: 60,
      classTypeId: defaultClassType,
      capacity: 1,
      instructor: "",
    });
    setSelectedDays([]);
    setIsDialogOpen(true);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    const durationMinutes = calculateDurationFromSlot(slot);

    setEditingSlot({
      id: slot.id,
      gym_id: "", // Will be set by parent component
      day: activeDay as any,
      start_time: timeStringToDate(slot.start),
      end_time: timeStringToDate(slot.end),
      duration_minutes: durationMinutes,
      class_type_id: slot.classTypeId,
      capacity: slot.capacity,
      instructor: slot.instructor,
      created_at: "",
      updated_at: "",
    });

    setFormData({
      start: slot.start,
      durationMinutes: durationMinutes,
      classTypeId: slot.classTypeId,
      capacity: slot.capacity,
      instructor: slot.instructor || "",
    });
    setSelectedDays([]);
    setIsDialogOpen(true);
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setSelectedDays((prev) => [...prev, day]);
    } else {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    }
  };

  const getComputedEnd = () => {
    if (!formData.start || !formData.durationMinutes) return "";

    // Convert string to Date for calculation
    const startDate = timeStringToDate(formData.start);
    const endDate = computeEnd(startDate, formData.durationMinutes);

    return dateToTimeString(endDate);
  };

  const validateTimeSlot = (
    slot: Omit<TimeSlot, "id">,
    weeklyTemplate: WeeklyTemplate,
    excludeId?: string
  ): string | null => {
    if (slot.capacity < 1) {
      return "Capacity must be at least 1";
    }

    // Check for overlaps
    const daySlots = weeklyTemplate[activeDay] || [];

    if (!slot.start && !slot.end) {
      return null;
    }

    // Convert string times to Date objects for comparison
    const slotStartDate = timeStringToDate(slot.start);
    const slotEndDate = timeStringToDate(slot.end);

    const overlapping = daySlots.find((existing) => {
      if (excludeId && existing.id === excludeId) return false;

      const existingStartDate = timeStringToDate(existing.start);
      const existingEndDate = timeStringToDate(existing.end);

      return hasTimeOverlap(
        { start: slotStartDate, end: slotEndDate },
        { start: existingStartDate, end: existingEndDate }
      );
    });

    if (overlapping) {
      return "Time slot overlaps with existing class";
    }

    return null;
  };

  const validateForm = (weeklyTemplate: WeeklyTemplate): string | null => {
    // For new slots: only validate if start time and days are selected
    if (!editingSlot) {
      // Don't validate if start time is not selected yet
      if (!formData.start) {
        return null;
      }

      // Don't validate if no days are selected for multi-day creation
      if (selectedDays.length === 0) {
        return null;
      }

      // Now validate the complete form
      const startDate = timeStringToDate(formData.start);
      const endDate = computeEnd(startDate, formData.durationMinutes);

      if (!validateNoCrossingDay(startDate, formData.durationMinutes)) {
        return "Duration makes the class cross to the next day; reduce duration or change start time.";
      }

      const slotData = {
        ...formData,
        end: dateToTimeString(endDate),
      };

      return validateTimeSlot(slotData, weeklyTemplate);
    } else {
      // For editing: only validate if time was actually changed
      const originalSlot = {
        start: editingSlot.start_time,
        end: editingSlot.end_time,
        durationMinutes: editingSlot.duration_minutes,
        classTypeId: editingSlot.class_type_id,
        capacity: editingSlot.capacity,
        instructor: editingSlot.instructor || "",
      };

      // Check if time-related fields were changed
      const timeChanged = hasTimeChanged(formData, {
        start_time: originalSlot.start,
        duration_minutes: originalSlot.durationMinutes,
      });

      if (timeChanged) {
        // Only validate time if it was actually changed
        const startDate = timeStringToDate(formData.start);
        const endDate = computeEnd(startDate, formData.durationMinutes);

        if (!validateNoCrossingDay(startDate, formData.durationMinutes)) {
          return "Duration makes the class cross to the next day; reduce duration or change start time.";
        }

        const slotData = {
          ...formData,
          end: dateToTimeString(endDate),
        };

        return validateTimeSlot(slotData, weeklyTemplate, editingSlot.id);
      } else {
        // Only validate capacity if time wasn't changed
        if (formData.capacity < 1) {
          return "Capacity must be at least 1";
        }
        return null;
      }
    }
  };

  const resetForm = () => {
    setFormData({
      start: "",
      durationMinutes: 60,
      classTypeId: classTypes && classTypes.length > 0 ? classTypes[0].id : "",
      capacity: 1,
      instructor: "",
    });
    setSelectedDays([]);
    setEditingSlot(null);
    setIsDialogOpen(false);
  };

  return {
    // State
    isDialogOpen,
    editingSlot,
    formData,
    selectedDays,
    conflictMode,

    // Actions
    handleAddSlot,
    handleEditSlot,
    handleDayToggle,
    resetForm,
    setIsDialogOpen,
    setFormData,

    // Computed values
    getComputedEnd,
    validateForm,
  };
}
