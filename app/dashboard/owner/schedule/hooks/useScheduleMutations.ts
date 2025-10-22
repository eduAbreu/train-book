import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/AuthProvider";
import {
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  applySlotToDays,
  generateClassesFromSlots,
  createSingleClass,
  createRecurringClasses,
} from "@/features/schedule/actions-new";
import { updateGymSettings } from "@/features/gym-settings/actions";
import type {
  CreateSlotData,
  UpdateSlotData,
  ApplySlotToDaysData,
} from "@/features/schedule/actions-new";
import type { GymSettings } from "@/types/schedule";
import toast from "react-hot-toast";

export function useScheduleMutations() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Create slot mutation (new structure)
  const createSlotMutation = useMutation({
    mutationFn: async (data: CreateSlotData) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await createScheduleSlot(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-slots"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      toast.success("Schedule slot created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create schedule slot");
    },
  });

  // Update slot mutation (new structure)
  const updateSlotMutation = useMutation({
    mutationFn: async ({
      slotId,
      data,
    }: {
      slotId: string;
      data: UpdateSlotData;
    }) => {
      const result = await updateScheduleSlot(slotId, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-slots"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      toast.success("Schedule slot updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update schedule slot");
    },
  });

  // Delete slot mutation (new structure)
  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const result = await deleteScheduleSlot(slotId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-slots"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-template-slots"] });
      toast.success("Schedule slot deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete schedule slot");
    },
  });

  // Apply slot to days mutation (new structure)
  const applySlotToDaysMutation = useMutation({
    mutationFn: async (data: ApplySlotToDaysData) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await applySlotToDays(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["schedule-slots"] });
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

  // Create single class mutation
  const createSingleClassMutation = useMutation({
    mutationFn: async (data: {
      date: string;
      time: string;
      classTypeId: string;
      capacity: number;
      instructor?: string;
    }) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await createSingleClass(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Aula criada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao criar aula");
    },
  });

  // Create recurring classes mutation
  const createRecurringClassesMutation = useMutation({
    mutationFn: async (data: {
      startDate: string;
      endDate: string;
      daysOfWeek: number[];
      time: string;
      classTypeId: string;
      capacity: number;
      instructor?: string;
    }) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await createRecurringClasses(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success(`${result.created_count} aulas criadas com sucesso!`);
    },
    onError: (error) => {
      toast.error(error.message || "Falha ao criar aulas");
    },
  });

  // Generate classes from slots mutation
  const generateClassesMutation = useMutation({
    mutationFn: async ({
      startDate,
      endDate,
    }: {
      startDate: string;
      endDate: string;
    }) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await generateClassesFromSlots(
        profile.gym_id,
        startDate,
        endDate
      );
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["schedule-slots"] });
      toast.success(`Generated ${result.generated_count} classes successfully`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate classes");
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
    createSingleClass: createSingleClassMutation.mutate,
    createRecurringClasses: createRecurringClassesMutation.mutate,
    generateClasses: generateClassesMutation.mutate,
    updateGymSettings: updateGymSettingsMutation.mutate,

    // Loading states
    isCreating: createSlotMutation.isPending,
    isUpdating: updateSlotMutation.isPending,
    isDeleting: deleteSlotMutation.isPending,
    isApplying: applySlotToDaysMutation.isPending,
    isCreatingSingleClass: createSingleClassMutation.isPending,
    isCreatingRecurringClasses: createRecurringClassesMutation.isPending,
    isGeneratingClasses: generateClassesMutation.isPending,
    isUpdatingSettings: updateGymSettingsMutation.isPending,
    isLoading:
      createSlotMutation.isPending ||
      updateSlotMutation.isPending ||
      deleteSlotMutation.isPending ||
      applySlotToDaysMutation.isPending ||
      createSingleClassMutation.isPending ||
      createRecurringClassesMutation.isPending ||
      generateClassesMutation.isPending ||
      updateGymSettingsMutation.isPending,
  };
}
