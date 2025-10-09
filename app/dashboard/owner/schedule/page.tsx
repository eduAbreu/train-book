"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/provider/AuthProvider";
import Header from "@/app/dashboard/components/Header";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleOverview } from "./components/ScheduleOverview";
import { ScheduleTabs } from "./components/ScheduleTabs";
import { GymSettingsCard } from "./components/GymSettingsCard";
import { SlotFormDialog } from "./components/SlotFormDialog";
import { useScheduleData } from "./hooks/useScheduleData";
import { useScheduleMutations } from "./hooks/useScheduleMutations";
import { useScheduleForm } from "./hooks/useScheduleForm";
import { useScheduleSettings } from "./hooks/useScheduleSettings";
import {
  transformSlotsToTemplate,
  getSlotCount,
  getClassTypeName,
  hasSchedulePermission,
  getChangedFields,
} from "./utils/scheduleHelpers";
import { timeStringToDate } from "@/lib/schedule";
import type { WeeklyTemplateSlot } from "@/types/schedule";
import type { ClassType } from "@/features/class-types/actions";

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

export default function SchedulePage() {
  const { user, profile, isOwner, hasGym, isFetched } = useAuth();
  const [activeDay, setActiveDay] = useState("Mon");

  // Custom hooks
  const {
    classTypes,
    weeklySlots,
    gymSettings,
    isLoading: dataLoading,
    hasError: dataError,
    isDataReady,
  } = useScheduleData();

  const {
    createSlot,
    updateSlot,
    deleteSlot,
    applySlotToDays,
    updateGymSettings,
    isLoading: mutationsLoading,
  } = useScheduleMutations();

  const {
    isDialogOpen,
    editingSlot,
    formData,
    selectedDays,
    conflictMode,
    handleAddSlot,
    handleEditSlot,
    handleDayToggle,
    resetForm,
    setIsDialogOpen,
    setFormData,
    setConflictMode,
    getComputedEnd,
    validateForm,
  } = useScheduleForm(classTypes, activeDay);

  const { gymSettings: localGymSettings, updateSettings } =
    useScheduleSettings(gymSettings);

  // Transform database slots to UI format
  const weeklyTemplate: WeeklyTemplate = useMemo(() => {
    if (!weeklySlots) return {};
    return transformSlotsToTemplate(weeklySlots);
  }, [weeklySlots]);

  // Helper functions
  const getSlotCountForDay = (day: string) => getSlotCount(weeklyTemplate, day);
  const getClassTypeNameById = (classTypeId: string) =>
    getClassTypeName(classTypes, classTypeId);

  // Event handlers
  const handleSaveSlot = () => {
    if (editingSlot) {
      // Update existing slot - only send changed fields
      const updateData = getChangedFields(formData, editingSlot);

      updateSlot({
        slotId: editingSlot.id,
        data: updateData,
      });
    } else {
      // Create new slot
      createSlot({
        day: activeDay as any,
        start_time: timeStringToDate(formData.start),
        duration_minutes: formData.durationMinutes,
        class_type_id: formData.classTypeId,
        capacity: formData.capacity,
        instructor: formData.instructor || null,
      });
    }
    resetForm();
  };

  const handleApplySlotToDays = () => {
    if (selectedDays.length === 0) return;

    applySlotToDays({
      slot: {
        start_time: timeStringToDate(formData.start),
        duration_minutes: formData.durationMinutes,
        class_type_id: formData.classTypeId,
        capacity: formData.capacity,
        instructor: formData.instructor || null,
      },
      days: selectedDays as any[],
      mode: conflictMode,
    });
    resetForm();
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm("Are you sure you want to delete this time slot?")) {
      deleteSlot(slotId);
    }
  };

  const handleUpdateGymSettings = (settings: any) => {
    updateGymSettings(settings);
    updateSettings(settings);
  };

  // Loading state
  if (dataLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">⏳</div>
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="text-gray-600">
            Please wait while we load your schedule
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError || !hasSchedulePermission(user, profile, isOwner, hasGym)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Access Denied
          </h2>
          <p className="text-red-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          <ScheduleHeader />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <ScheduleOverview
                weeklyTemplate={weeklyTemplate}
                getSlotCount={getSlotCountForDay}
              />

              <ScheduleTabs
                activeDay={activeDay}
                onDayChange={setActiveDay}
                weeklyTemplate={weeklyTemplate}
                getClassTypeName={getClassTypeNameById}
                onAddSlot={handleAddSlot}
                onEditSlot={handleEditSlot}
                onDeleteSlot={handleDeleteSlot}
              />
            </div>

            <div className="space-y-6">
              <GymSettingsCard
                gymSettings={localGymSettings}
                onUpdateSettings={handleUpdateGymSettings}
                isLoading={mutationsLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <SlotFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingSlot={editingSlot}
        formData={formData}
        onFormDataChange={(data) =>
          setFormData((prev) => ({ ...prev, ...data }))
        }
        selectedDays={selectedDays}
        onDayToggle={handleDayToggle}
        conflictMode={conflictMode}
        onConflictModeChange={setConflictMode}
        classTypes={classTypes || []}
        weeklyTemplate={weeklyTemplate}
        activeDay={activeDay}
        onSave={handleSaveSlot}
        onApplyToDays={handleApplySlotToDays}
        isLoading={mutationsLoading}
        validateForm={() => validateForm(weeklyTemplate)}
        getComputedEnd={getComputedEnd}
      />
    </>
  );
}
