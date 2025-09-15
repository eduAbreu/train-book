"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface Gym {
  id: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  description?: string;
  ownerId: string;
}

export default function SetupGymOnboarding() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem("booking-session");
    if (!session) {
      router.push("/");
      return;
    }

    const user = JSON.parse(session);
    if (user.role !== "owner") {
      router.push("/");
      return;
    }

    if (user.onboardingCompleted) {
      router.push("/owner/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const session = localStorage.getItem("booking-session");
      if (!session) throw new Error("No session found");

      const user = JSON.parse(session);

      // Create gym
      const newGym: Gym = {
        id: Date.now().toString(),
        name,
        location,
        email,
        phone,
        description,
        ownerId: user.id,
      };

      // Save gym to localStorage
      const existingGyms = JSON.parse(
        localStorage.getItem("booking-gyms") || "[]"
      );
      existingGyms.push(newGym);
      localStorage.setItem("booking-gyms", JSON.stringify(existingGyms));

      // Update user onboarding status
      user.onboardingCompleted = true;
      user.gymId = newGym.id;
      localStorage.setItem("booking-session", JSON.stringify(user));

      router.push("/owner/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("booking-session");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Setup Your Studio</CardTitle>
            <CardDescription>
              Let&apos;s get your studio ready for bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studio-name">Studio Name *</Label>
                <Input
                  id="studio-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., FitZone Studio"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., 123 Main St, City, State"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studio-email">Email *</Label>
                  <Input
                    id="studio-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="studio@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell students about your studio..."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Studio..." : "Create Studio"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
