"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/AuthProvider";
import { ModalityFormDialog } from "./components/ModalityFormDialog";
import { ModalityList } from "./components/ModalityList";
import {
  getClassTypes,
  createClassType,
  updateClassType,
  toggleClassTypeActive,
  type ClassType,
  type CreateClassTypeData,
  type UpdateClassTypeData,
} from "@/features/class-types/actions";
import { ClassTypeMessages } from "@/types/gym";
import toast from "react-hot-toast";
import Header from "../../components/Header";

const QUICK_SUGGESTIONS = [
  "Bodybuilding",
  "Yoga",
  "Pilates",
  "HIIT",
  "Strength",
  "Mobility",
  "Cross Training",
  "Spinning",
  "Boxing",
  "Dance",
  "Stretching",
];

export default function OwnerModalities() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<ClassType | null>(
    null
  );
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use English messages for now (can be made dynamic later)
  const messages = ClassTypeMessages.en;

  const {
    user,
    profile,
    loading: authLoading,
    isOwner,
    hasGym,
    isFetched,
  } = useAuth();

  // Auth guards
  useEffect(() => {
    if (isFetched && (!isOwner || !hasGym)) {
      router.push("/dashboard/owner");
    }
  }, [isOwner, hasGym, router, isFetched]);

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
      const result = await getClassTypes(profile.gym_id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: isFetched && isOwner && hasGym && !!profile?.gym_id,
  });

  // Create class type mutation
  const createClassTypeMutation = useMutation({
    mutationFn: async (data: CreateClassTypeData) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      const result = await createClassType(profile.gym_id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-types"] });
      toast.success(messages.CLASS_TYPE_CREATED_SUCCESS);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create class type");
    },
  });

  // Update class type mutation
  const updateClassTypeMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateClassTypeData;
    }) => {
      const result = await updateClassType(id, data);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-types"] });
      toast.success(messages.CLASS_TYPE_UPDATED_SUCCESS);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update class type");
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const result = await toggleClassTypeActive(id, isActive);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["class-types"] });
      toast.success(
        data.is_active
          ? messages.CLASS_TYPE_ACTIVATED
          : messages.CLASS_TYPE_DEACTIVATED
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update class type");
    },
  });

  const handleAddModality = () => {
    setEditingModality(null);
    setIsDialogOpen(true);
  };

  const handleEditModality = (modality: ClassType) => {
    setEditingModality(modality);
    setIsDialogOpen(true);
  };

  const handleSaveModality = (
    modalityData: CreateClassTypeData | UpdateClassTypeData
  ) => {
    if (editingModality) {
      updateClassTypeMutation.mutate({
        id: editingModality.id,
        data: modalityData as UpdateClassTypeData,
      });
    } else {
      createClassTypeMutation.mutate(modalityData as CreateClassTypeData);
    }
  };

  const handleToggleActive = (modalityId: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id: modalityId, isActive });
  };

  const handleQuickAdd = (suggestionName: string) => {
    if (!profile?.gym_id) return;

    // Check if suggestion already exists
    const exists = classTypes?.some(
      (ct) => ct.name.toLowerCase() === suggestionName.toLowerCase()
    );

    if (exists) {
      toast.error(messages.CLASS_TYPE_NAME_DUPLICATE);
      return;
    }

    createClassTypeMutation.mutate({
      name: suggestionName,
      is_active: true,
    });
  };

  // Loading state
  if (authLoading || classTypesLoading || !isFetched) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // Error state
  if (classTypesError || !user || !profile || !isOwner || !hasGym) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Access Denied
          </h2>
          <p className="text-red-600">
            You don't have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  // No gym data
  if (!profile?.gym_id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-yellow-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900">No Gym Found</h2>
          <p className="text-gray-600">Please set up your gym first</p>
          <Button onClick={() => router.push("/onboarding/setup-gym")}>
            Set Up Gym
          </Button>
        </div>
      </div>
    );
  }

  const activeModalities = classTypes?.filter((m) => m.is_active) || [];
  const inactiveModalities = classTypes?.filter((m) => !m.is_active) || [];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Studio Modalities</h1>
              <p className="text-muted-foreground">
                Manage your class types and modalities
              </p>
            </div>
            <Button onClick={handleAddModality}>
              <Plus className="h-4 w-4 mr-2" />
              New Modality
            </Button>
          </div>

          <div className="space-y-8">
            {/* Quick Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Suggestions</CardTitle>
                <CardDescription>
                  Click to add popular modalities to your studio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion) => {
                    const exists = classTypes?.some(
                      (m) => m.name.toLowerCase() === suggestion.toLowerCase()
                    );

                    return (
                      <Button
                        key={suggestion}
                        variant={exists ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleQuickAdd(suggestion)}
                        disabled={exists || createClassTypeMutation.isPending}
                      >
                        {suggestion} {exists && "✓"}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Modalities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Active Modalities ({activeModalities.length})
                </h2>
              </div>
              <ModalityList
                modalities={activeModalities}
                onEdit={handleEditModality}
                onToggleActive={handleToggleActive}
                isLoading={toggleActiveMutation.isPending}
              />
            </div>

            {/* Inactive Modalities */}
            {inactiveModalities.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground">
                  Inactive Modalities ({inactiveModalities.length})
                </h2>
                <ModalityList
                  modalities={inactiveModalities}
                  onEdit={handleEditModality}
                  onToggleActive={handleToggleActive}
                  isLoading={toggleActiveMutation.isPending}
                />
              </div>
            )}
          </div>
        </main>

        <ModalityFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          modality={editingModality}
          onSave={handleSaveModality}
          isLoading={
            createClassTypeMutation.isPending ||
            updateClassTypeMutation.isPending
          }
        />
      </div>
    </>
  );
}
