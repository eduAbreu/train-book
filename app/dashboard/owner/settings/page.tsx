"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  LogOut,
  AlertTriangle,
  Building,
} from "lucide-react";
import { useAuth } from "@/provider/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/libs/supabase/client";
import { ImageUpload } from "@/components/gym/ImageUpload";
import {
  updateGym,
  getGymWithSettings,
  closeGym,
} from "@/features/gym/actions";
import { log } from "@/libs/log";
import toast from "react-hot-toast";
import type { Gym, GymSettings } from "@/types/gym";
import type { GymFormData } from "@/types/owner-settings";
import { OwnerSettingsMessages } from "@/types/owner-settings";
import Header from "../../components/Header";

export default function OwnerSettings() {
  const [currentGym, setCurrentGym] = useState<GymFormData | null>(null);
  const [originalGym, setOriginalGym] = useState<GymFormData | null>(null);
  const [isCloseGymDialogOpen, setIsCloseGymDialogOpen] = useState(false);
  const [understandConsequences, setUnderstandConsequences] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use English messages for now (can be made dynamic later)
  const messages = OwnerSettingsMessages.en;

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
      router.push("/dashboard");
    }
  }, [isOwner, hasGym, router, isFetched]);

  // Fetch gym data
  const {
    data: gymData,
    isLoading: gymLoading,
    error: gymError,
    isFetched: isGymFetched,
    isSuccess: isGymSuccess,
  } = useQuery({
    queryKey: ["gym-with-settings", profile?.gym_id],
    queryFn: async () => {
      return await getGymWithSettings(profile.gym_id);
    },
    enabled: isFetched && isOwner && hasGym,
  });

  // Initialize form data when gym data loads
  useEffect(() => {
    if (gymData && isGymFetched && isGymSuccess) {
      const formData: GymFormData = {
        name: gymData.gym.name,
        location: gymData.gym.location,
        email: gymData.gym.email,
        phone: gymData.gym.phone || "",
        description: gymData.gym.description || "",
        logo_url: gymData.gym.logo_url || "",
        cover_url: gymData.gym.cover_url || "",
      };
      setOriginalGym(formData);
      setCurrentGym(formData);
    }
  }, [gymData, isGymFetched, isGymSuccess]);

  // Check for changes
  const hasChanges = useMemo(() => {
    if (!originalGym || !currentGym) return false;
    return JSON.stringify(originalGym) !== JSON.stringify(currentGym);
  }, [originalGym, currentGym]);

  // Update gym mutation
  const updateGymMutation = useMutation({
    mutationFn: async (formData: GymFormData) => {
      if (!profile?.gym_id) throw new Error("No gym ID found");

      const data = new FormData();
      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("email", formData.email);
      if (formData.phone) data.append("phone", formData.phone);
      if (formData.description)
        data.append("description", formData.description);
      if (formData.logo_url) data.append("logo_url", formData.logo_url);
      if (formData.cover_url) data.append("cover_url", formData.cover_url);

      return await updateGym(profile.gym_id, data);
    },
    onSuccess: (result) => {
      if (result.success) {
        setOriginalGym({ ...currentGym! });
        queryClient.invalidateQueries({ queryKey: ["gym-with-settings"] });
        toast.success(messages.SETTINGS_SAVED_SUCCESS);
      } else {
        toast.error(result.error || messages.SAVE_FAILED);
      }
    },
    onError: (error) => {
      toast.error(messages.SAVE_FAILED_RETRY);
      log.error("Gym update error", { error });
    },
  });

  const handleSave = () => {
    if (!currentGym) return;

    // Validate required fields
    const requiredFields = ["name", "location", "email"];
    const missingFields = requiredFields.filter(
      (field) => !currentGym[field as keyof GymFormData]?.toString().trim()
    );

    if (missingFields.length > 0) {
      toast.error(`${messages.VALIDATION_ERROR}: ${missingFields.join(", ")}`);
      return;
    }

    updateGymMutation.mutate(currentGym);
  };

  const handleRevert = () => {
    if (originalGym) {
      setCurrentGym({ ...originalGym });
      toast.success(messages.CHANGES_REVERTED);
    }
  };

  // Close gym mutation
  const closeGymMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.gym_id) throw new Error("No gym ID found");
      return await closeGym(profile.gym_id);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(messages.GYM_CLOSED_SUCCESS);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        router.push("/onboarding/setup-gym");
      } else {
        toast.error(result.error || messages.CLOSE_GYM_FAILED);
      }
    },
    onError: (error) => {
      toast.error(messages.CLOSE_GYM_FAILED_RETRY);
      log.error("Gym closure error", { error });
    },
    onSettled: () => {
      setIsCloseGymDialogOpen(false);
      setUnderstandConsequences(false);
    },
  });

  const handleCloseGym = () => {
    closeGymMutation.mutate();
  };

  // Loading state
  if (authLoading || gymLoading || !isFetched) {
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
  if (gymError || !user || !profile || !isOwner || !hasGym) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {messages.ACCESS_DENIED}
          </h2>
          <p className="text-red-600">{messages.ACCESS_DENIED_DESC}</p>
        </div>
      </div>
    );
  }

  // No gym data
  if (!currentGym) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-yellow-500 text-6xl">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {messages.NO_GYM_FOUND}
          </h2>
          <p className="text-gray-600">{messages.NO_GYM_FOUND_DESC}</p>
          <Button onClick={() => router.push("/onboarding/setup-gym")}>
            {messages.SET_UP_GYM}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <main className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{messages.STUDIO_INFORMATION}</CardTitle>
                  <CardDescription>
                    {messages.STUDIO_INFORMATION_DESC}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {messages.STUDIO_NAME_LABEL} *
                      </Label>
                      <Input
                        id="name"
                        value={currentGym.name}
                        onChange={(e) =>
                          setCurrentGym({ ...currentGym, name: e.target.value })
                        }
                        placeholder={messages.STUDIO_NAME_PLACEHOLDER}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        {messages.LOCATION_LABEL} *
                      </Label>
                      <Input
                        id="location"
                        value={currentGym.location}
                        onChange={(e) =>
                          setCurrentGym({
                            ...currentGym,
                            location: e.target.value,
                          })
                        }
                        placeholder={messages.LOCATION_PLACEHOLDER}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{messages.EMAIL_LABEL} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={currentGym.email}
                        onChange={(e) =>
                          setCurrentGym({
                            ...currentGym,
                            email: e.target.value,
                          })
                        }
                        placeholder={messages.EMAIL_PLACEHOLDER}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{messages.PHONE_LABEL}</Label>
                      <Input
                        id="phone"
                        value={currentGym.phone || ""}
                        onChange={(e) =>
                          setCurrentGym({
                            ...currentGym,
                            phone: e.target.value,
                          })
                        }
                        placeholder={messages.PHONE_PLACEHOLDER}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {messages.DESCRIPTION_LABEL}
                    </Label>
                    <Textarea
                      id="description"
                      value={currentGym.description || ""}
                      onChange={(e) =>
                        setCurrentGym({
                          ...currentGym,
                          description: e.target.value,
                        })
                      }
                      placeholder={messages.DESCRIPTION_PLACEHOLDER}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{messages.CLOSE_GYM}</span>
                  </CardTitle>
                  <CardDescription>{messages.CLOSE_GYM_DESC}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-sm">
                      {messages.CLOSE_GYM_WARNING_TITLE}
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {messages.CLOSE_GYM_WARNING_1}</li>
                      <li>
                        • <strong>{messages.CLOSE_GYM_WARNING_2}</strong>
                      </li>
                      <li>
                        • <strong>{messages.CLOSE_GYM_WARNING_3}</strong>
                      </li>
                      <li>
                        • <strong>{messages.CLOSE_GYM_WARNING_4}</strong>
                      </li>
                      <li>• {messages.CLOSE_GYM_WARNING_5}</li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ {messages.IRREVERSIBLE_WARNING}
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => setIsCloseGymDialogOpen(true)}
                    className="w-full"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    {messages.CLOSE_GYM_NOW}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Images Column */}
            <div className="space-y-6">
              <ImageUpload
                gymId={profile.gym_id}
                type="logo"
                label={messages.STUDIO_LOGO_LABEL}
                currentUrl={currentGym.logo_url}
                onUpload={(result) => {
                  if (result.success && result.url) {
                    setCurrentGym({ ...currentGym, logo_url: result.url });
                  }
                }}
              />
            </div>
          </div>

          {/* Fixed Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {hasChanges
                  ? messages.UNSAVED_CHANGES
                  : messages.ALL_CHANGES_SAVED}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRevert}
                  disabled={!hasChanges || updateGymMutation.isPending}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {messages.REVERT_CHANGES}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || updateGymMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateGymMutation.isPending
                    ? messages.SAVING
                    : messages.SAVE_CHANGES}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom padding to account for fixed action bar */}
          <div className="h-20" />
        </main>

        <Dialog
          open={isCloseGymDialogOpen}
          onOpenChange={setIsCloseGymDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>{messages.CONFIRM_CLOSURE}</span>
              </DialogTitle>
              <DialogDescription>
                {messages.CONFIRM_CLOSURE_DESC}{" "}
                <strong>{currentGym.name}</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">
                  {messages.CONSEQUENCES_CHECKLIST}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ {messages.CONSEQUENCE_1}</li>
                  <li>✓ {messages.CONSEQUENCE_2}</li>
                  <li>✓ {messages.CONSEQUENCE_3}</li>
                  <li>✓ {messages.CONSEQUENCE_4}</li>
                  <li>✓ {messages.CONSEQUENCE_5}</li>
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="understand-consequences"
                  checked={understandConsequences}
                  onCheckedChange={(checked) =>
                    setUnderstandConsequences(checked === true)
                  }
                />
                <label
                  htmlFor="understand-consequences"
                  className="text-sm font-medium"
                >
                  {messages.UNDERSTAND_CONSEQUENCES}
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCloseGymDialogOpen(false);
                  setUnderstandConsequences(false);
                }}
                disabled={closeGymMutation.isPending}
              >
                {messages.CANCEL}
              </Button>
              <Button
                variant="destructive"
                onClick={handleCloseGym}
                disabled={!understandConsequences || closeGymMutation.isPending}
              >
                {closeGymMutation.isPending ? "Closing..." : "Close Gym Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
