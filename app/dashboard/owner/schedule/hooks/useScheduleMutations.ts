import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/AuthProvider";
import {
  createWeeklyTemplateSlot,
  updateWeeklyTemplateSlot,
  deleteWeeklyTemplateSlot,
  applySlotToDays,
} from "@/features/schedule/actions";
import { updateGymSettings } from "@/features/gym-settings/actions";
import type {
  CreateSlotData,
  UpdateSlotData,
  ApplySlotToDaysData,
  GymSettings,
} from "@/types/schedule";
import toast from "react-hot-toast";

export function useScheduleMutations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Create slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (data: CreateSlotData) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await createWeeklyTemplateSlot(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      toast.success("Time slot created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create time slot");
    },
  });

  // Update slot mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({
      slotId,
      data,
    }: {
      slotId: string;
      data: UpdateSlotData;
    }) => {
      const result = await updateWeeklyTemplateSlot(slotId, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      toast.success("Time slot updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update time slot");
    },
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const result = await deleteWeeklyTemplateSlot(slotId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      toast.success("Time slot deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete time slot");
    },
  });

  // Apply slot to days mutation
  const applySlotToDaysMutation = useMutation({
    mutationFn: async (data: ApplySlotToDaysData) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await applySlotToDays(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      const messages = [];
      if (result.createdDays.length > 0) {
        messages.push(`Created in ${result.createdDays.length} days`);
      }
      if (result.skippedDays.length > 0) {
        messages.push(
          `${result.skippedDays.length} days skipped due to conflicts`
        );
      }
      if (result.replacedDays.length > 0) {
        messages.push(`${result.replacedDays.length} replaced`);
      }
      toast.success(messages.join("; "));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply slot to days");
    },
  });

  // Update gym settings mutation
  const updateGymSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<GymSettings>) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await updateGymSettings(profile.gym_id, {
        allow_waitlist: settings.allow_waitlist,
        cancel_limit_hours: settings.cancel_limit_hours,
      });
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gym-settings"] });
      toast.success("Gym settings updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update gym settings");
    },
  });

  return {
    createSlot: createSlotMutation.mutate,
    updateSlot: updateSlotMutation.mutate,
    deleteSlot: deleteSlotMutation.mutate,
    applySlotToDays: applySlotToDaysMutation.mutate,
    updateGymSettings: updateGymSettingsMutation.mutate,

    // Loading states
    isCreating: createSlotMutation.isPending,
    isUpdating: updateSlotMutation.isPending,
    isDeleting: deleteSlotMutation.isPending,
    isApplying: applySlotToDaysMutation.isPending,
    isUpdatingSettings: updateGymSettingsMutation.isPending,
    isLoading:
      createSlotMutation.isPending ||
      updateSlotMutation.isPending ||
      deleteSlotMutation.isPending ||
      applySlotToDaysMutation.isPending ||
      updateGymSettingsMutation.isPending,
  };
}
