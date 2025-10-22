"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/provider/AuthProvider";
import Header from "@/app/dashboard/components/Header";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleTabsNew } from "./components/ScheduleTabs/ScheduleTabsNew";
import { GymSettingsCard } from "./components/GymSettingsCard";
import { CreateClassModal } from "./components/CreateClassModal";
import { SlotFormDialog } from "./components/SlotFormDialog/SlotFormDialog";
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
  dayStringToNumber,
} from "./utils/scheduleHelpers";

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
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);

  // Custom hooks
  const {
    classTypes,
    scheduleSlots,
    classes,
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
    createSingleClass,
    createRecurringClasses,
    generateClasses,
    updateGymSettings,
    isLoading: mutationsLoading,
  } = useScheduleMutations();

  const {
    isDialogOpen,
    editingSlot,
    formData,
    selectedDays,
    handleAddSlot,
    handleEditSlot,
    handleDayToggle,
    resetForm,
    setIsDialogOpen,
    setFormData,
    getComputedEnd,
    validateForm,
  } = useScheduleForm(classTypes, activeDay);

  const { gymSettings: localGymSettings, updateSettings } =
    useScheduleSettings(gymSettings);

  // Transform database slots to UI format
  const weeklyTemplate: WeeklyTemplate = useMemo(() => {
    // Use new schedule slots if available, otherwise fall back to legacy
    if (!scheduleSlots) return {};
    return transformSlotsToTemplate(scheduleSlots);
  }, [scheduleSlots]);

  // Transform classes to UI format for display
  const classesByDay: { [key: string]: any[] } = useMemo(() => {
    if (!classes) return {};

    const result: { [key: string]: any[] } = {};
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    classes.forEach((classItem) => {
      const date = new Date(classItem.date);
      const dayOfWeek = date.getDay();
      const dayName = dayMap[dayOfWeek];

      if (!result[dayName]) {
        result[dayName] = [];
      }

      result[dayName].push({
        id: classItem.id,
        start: classItem.start_time,
        end: classItem.end_time,
        classTypeId: classItem.class_type_id,
        capacity: classItem.capacity,
        instructor: classItem.instructor,
        date: classItem.date,
        status: classItem.status,
        class_type: classItem.class_types,
      });
    });

    return result;
  }, [classes]);

  // Helper functions
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
        class_type_id: formData.classTypeId,
        day_of_week: dayStringToNumber(activeDay),
        start_time: formData.start,
        duration_minutes: formData.durationMinutes,
        capacity: formData.capacity,
        instructor: formData.instructor || null,
        is_recurring: true,
        recurrence_pattern: "weekly",
        is_active: true,
      });
    }
    resetForm();
  };

  const handleApplySlotToDays = () => {
    if (selectedDays.length === 0) return;

    applySlotToDays({
      slot: {
        class_type_id: formData.classTypeId,
        start_time: formData.start,
        duration_minutes: formData.durationMinutes,
        capacity: formData.capacity,
        instructor: formData.instructor || null,
        is_recurring: true,
        recurrence_pattern: "weekly",
        is_active: true,
      },
      days: selectedDays.map((day) => dayStringToNumber(day)),
      mode: "replace", // Always use replace to avoid conflicts
    } as any);
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

  const handleGenerateClasses = (startDate: string, endDate: string) => {
    generateClasses({ startDate, endDate });
  };

  const handleCreateSingleClass = (data: {
    date: Date;
    time: string;
    classTypeId: string;
    capacity: number;
    instructor?: string;
  }) => {
    createSingleClass({
      date: data.date.toISOString().split("T")[0],
      time: data.time,
      classTypeId: data.classTypeId,
      capacity: data.capacity,
      instructor: data.instructor,
    });
    setIsCreateClassModalOpen(false);
  };

  const handleCreateRecurringClasses = (data: {
    startDate: Date;
    endDate: Date;
    daysOfWeek: number[];
    time: string;
    classTypeId: string;
    capacity: number;
    instructor?: string;
  }) => {
    createRecurringClasses({
      startDate: data.startDate.toISOString().split("T")[0],
      endDate: data.endDate.toISOString().split("T")[0],
      daysOfWeek: data.daysOfWeek,
      time: data.time,
      classTypeId: data.classTypeId,
      capacity: data.capacity,
      instructor: data.instructor,
    });
    setIsCreateClassModalOpen(false);
  };

  const handleGenerateFromTemplate = (data: {
    startDate: string;
    endDate: string;
  }) => {
    generateClasses(data);
    setIsCreateClassModalOpen(false);
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
            You don&apos;t have permission to access this page.
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

          <div className="space-y-6">
            <ScheduleTabsNew
              classes={classes || []}
              scheduleSlots={scheduleSlots || []}
              weeklyTemplate={weeklyTemplate}
              getClassTypeName={getClassTypeNameById}
              onAddClass={() => setIsCreateClassModalOpen(true)}
              onAddSlot={handleAddSlot}
              onEditClass={(classItem) => {
                // TODO: Implement edit class functionality
                console.log("Edit class:", classItem);
              }}
              onEditSlot={handleEditSlot}
              onDeleteClass={(classId) => {
                // TODO: Implement delete class functionality
                console.log("Delete class:", classId);
              }}
              onDeleteSlot={handleDeleteSlot}
              onViewBookings={(classItem) => {
                // TODO: Implement view bookings functionality
                console.log("View bookings for class:", classItem);
              }}
              onGenerateFromSlot={(slot) => {
                // TODO: Implement generate from slot functionality
                console.log("Generate from slot:", slot);
              }}
              onGenerateClasses={(data) =>
                handleGenerateClasses(data.startDate, data.endDate)
              }
              gymSettingsComponent={
                <GymSettingsCard
                  gymSettings={localGymSettings}
                  onUpdateSettings={handleUpdateGymSettings}
                  isLoading={mutationsLoading}
                />
              }
            />
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
        classTypes={classTypes || []}
        onSave={handleSaveSlot}
        onApplyToDays={handleApplySlotToDays}
        isLoading={mutationsLoading}
        validateForm={() => validateForm(weeklyTemplate)}
        getComputedEnd={getComputedEnd}
      />

      <CreateClassModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        onSave={handleCreateSingleClass}
        onGenerateRecurring={handleCreateRecurringClasses}
        onGenerateFromTemplate={handleGenerateFromTemplate}
        classTypes={classTypes || []}
        isLoading={mutationsLoading}
      />
    </>
  );
}
