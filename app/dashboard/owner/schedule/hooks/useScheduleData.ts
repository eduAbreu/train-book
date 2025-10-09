import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/AuthProvider";
import { getWeeklyTemplateSlots } from "@/features/schedule/actions";
import { getGymSettings } from "@/features/gym-settings/actions";
import { getClassTypes as getClassTypesAction } from "@/features/class-types/actions";
import type { WeeklyTemplateSlot, GymSettings } from "@/types/schedule";
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

  // Fetch weekly template slots
  const {
    data: weeklySlots,
    isLoading: slotsLoading,
    error: slotsError,
    isFetched: isSlotsFetched,
    isSuccess: isSlotsSuccess,
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
    weeklySlots: weeklySlots as WeeklyTemplateSlot[] | undefined,
    gymSettings: gymSettings as GymSettings | undefined,

    // Loading states
    classTypesLoading,
    slotsLoading,
    settingsLoading,
    isLoading: classTypesLoading || slotsLoading || settingsLoading,

    // Error states
    classTypesError,
    slotsError,
    settingsError,
    hasError: !!(classTypesError || slotsError || settingsError),

    // Success states
    isClassTypesSuccess,
    isSlotsSuccess,
    isSettingsSuccess,
    isDataReady: isClassTypesSuccess && isSlotsSuccess && isSettingsSuccess,

    // Fetched states
    isClassTypesFetched,
    isSlotsFetched,
    isSettingsFetched,
    isFetched: isClassTypesFetched && isSlotsFetched && isSettingsFetched,
  };
}
