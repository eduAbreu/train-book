import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/AuthProvider";
import { getScheduleSlots, getClasses } from "@/features/schedule/actions-new";
import { getWeeklyTemplateSlots } from "@/features/schedule/actions";
import { getGymSettings } from "@/features/gym-settings/actions";
import { getClassTypes as getClassTypesAction } from "@/features/class-types/actions";
import type {
  ScheduleSlot,
  WeeklyTemplateSlot,
  GymSettings,
} from "@/types/schedule";
import type { ClassType } from "@/features/class-types/actions";

export function useScheduleData() {
  const { profile, isOwner, hasGym, isFetched } = useAuth();

  // Fetch class types
  const {
    data: classTypes,
    isLoading: classTypesLoading,
    error: classTypesError,
    isFetched: isClassTypesFetched,
    isSuccess: isClassTypesSuccess,
  } = useQuery({
    queryKey: ["class-types", profile?.gym_id],
    queryFn: async () => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await getClassTypesAction(profile.gym_id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: isFetched && isOwner && hasGym && !!profile?.gym_id,
  });

  // Fetch schedule slots (new structure)
  const {
    data: scheduleSlots,
    isLoading: slotsLoading,
    error: slotsError,
    isFetched: isSlotsFetched,
    isSuccess: isSlotsSuccess,
  } = useQuery({
    queryKey: ["schedule-slots", profile?.gym_id],
    queryFn: async () => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await getScheduleSlots(profile.gym_id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: isFetched && isOwner && hasGym && !!profile?.gym_id,
  });

  // Fetch weekly template slots (legacy for backward compatibility)
  const {
    data: weeklySlots,
    isLoading: legacySlotsLoading,
    error: legacySlotsError,
    isFetched: isLegacySlotsFetched,
    isSuccess: isLegacySlotsSuccess,
  } = useQuery({
    queryKey: ["weekly-template-slots", profile?.gym_id],
    queryFn: async () => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await getWeeklyTemplateSlots(profile.gym_id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: isFetched && isOwner && hasGym && !!profile?.gym_id,
  });

  // Fetch classes
  const {
    data: classes,
    isLoading: classesLoading,
    error: classesError,
    isFetched: isClassesFetched,
    isSuccess: isClassesSuccess,
  } = useQuery({
    queryKey: ["classes", profile?.gym_id],
    queryFn: async () => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await getClasses(profile.gym_id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: isFetched && isOwner && hasGym && !!profile?.gym_id,
  });

  // Fetch gym settings
  const {
    data: gymSettings,
    isLoading: settingsLoading,
    error: settingsError,
    isFetched: isSettingsFetched,
    isSuccess: isSettingsSuccess,
  } = useQuery({
    queryKey: ["gym-settings", profile?.gym_id],
    queryFn: async () => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await getGymSettings(profile.gym_id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: isFetched && isOwner && hasGym && !!profile?.gym_id,
  });

  return {
    // Data
    classTypes: classTypes as ClassType[] | undefined,
    scheduleSlots: scheduleSlots as ScheduleSlot[] | undefined,
    weeklySlots: weeklySlots as WeeklyTemplateSlot[] | undefined, // Legacy
    classes: classes as any[] | undefined,
    gymSettings: gymSettings as GymSettings | undefined,

    // Loading states
    classTypesLoading,
    slotsLoading,
    legacySlotsLoading,
    classesLoading,
    settingsLoading,
    isLoading:
      classTypesLoading || slotsLoading || classesLoading || settingsLoading,

    // Error states
    classTypesError,
    slotsError,
    legacySlotsError,
    classesError,
    settingsError,
    hasError: !!(
      classTypesError ||
      slotsError ||
      classesError ||
      settingsError
    ),

    // Success states
    isClassTypesSuccess,
    isSlotsSuccess,
    isLegacySlotsSuccess,
    isClassesSuccess,
    isSettingsSuccess,
    isDataReady:
      isClassTypesSuccess &&
      isSlotsSuccess &&
      isClassesSuccess &&
      isSettingsSuccess,

    // Fetched states
    isClassTypesFetched,
    isSlotsFetched,
    isLegacySlotsFetched,
    isClassesFetched,
    isSettingsFetched,
    isFetched:
      isClassTypesFetched &&
      isSlotsFetched &&
      isClassesFetched &&
      isSettingsFetched,
  };
}
