"use client";

import type React from "react";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/libs/supabase/client";
import { createGym } from "@/features/gym/actions";
import { ImageUpload } from "@/components/gym/ImageUpload";
import { GymMessages, type ImageUploadResult } from "@/types/gym";
import { log } from "@/libs/log";
import { useAuth } from "@/provider/AuthProvider";

function SubmitButton() {
  const { pending } = useFormStatus();
  const messages = GymMessages.en;

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? messages.LOADING : messages.CREATE_GYM}
    </Button>
  );
}

export default function SetupGymOnboarding() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const {
    isAuthenticated,
    isOwner,
    hasCompletedOnboarding,
    hasGym,
    isFetched,
  } = useAuth();

  const messages = GymMessages.en;

  useEffect(() => {
    if (isFetched && (!isAuthenticated || !isOwner)) {
      router.push("/");
    }
  }, [isAuthenticated, isOwner, router, isFetched]);

  useEffect(() => {
    if (isFetched && hasCompletedOnboarding && hasGym) {
      router.push("/dashboard/owner");
    }
  }, [hasCompletedOnboarding, hasGym, router, isFetched]);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        // Add image URLs to form data if they exist
        if (logoUrl) {
          formData.append("logo_url", logoUrl);
        }

        await createGym(formData).then((result) => {
          if (result.success) {
            router.push("/dashboard");
          }
          if (result.error) {
            setError(result.error);
          }
        });
        // Server action will redirect on success
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        log.error("Gym creation failed", { error: errorMessage });
      }
    });
  };

  const handleLogoUpload = (result: ImageUploadResult) => {
    if (result.success) {
      setLogoUrl(result.url);
      if (result.error) {
        setError(result.error);
      }
    } else {
      setError(result.error || "Failed to upload logo");
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      log.error("Logout error", { error });
      router.push("/");
    }
  };

  return (
    <>
      <div className="flex items-center justify-end">
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Your Gym</CardTitle>
          <CardDescription>
            Let&apos;s get your gym ready for bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{messages.GYM_NAME_LABEL} *</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={messages.GYM_NAME_PLACEHOLDER}
                required
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{messages.LOCATION_LABEL} *</Label>
              <Input
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={messages.LOCATION_PLACEHOLDER}
                required
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{messages.EMAIL_LABEL} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={messages.EMAIL_PLACEHOLDER}
                  required
                  aria-describedby={error ? "error-message" : undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{messages.PHONE_LABEL}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={messages.PHONE_PLACEHOLDER}
                  aria-describedby={error ? "error-message" : undefined}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{messages.DESCRIPTION_LABEL}</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={messages.DESCRIPTION_PLACEHOLDER}
                rows={4}
                aria-describedby={error ? "error-message" : undefined}
              />
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                label={messages.LOGO_LABEL}
                type="logo"
                onUpload={handleLogoUpload}
                disabled={isPending}
              />
            </div>

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </>
  );
}
