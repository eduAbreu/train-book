"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { useAuth } from "@/provider/AuthProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createClient } from "@/libs/supabase/client";
import { joinGym } from "@/features/gym/actions";
import { log } from "@/libs/log";
import { Gym } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchGyms() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("gyms")
    .select("id, name, logo_url, location")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Gym[];
}

export default function ChooseGymOnboarding() {
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const {
    isAuthenticated,
    isStudent,
    hasCompletedOnboarding,
    hasGym,
    isFetched,
  } = useAuth();

  useEffect(() => {
    if (isFetched && (!isAuthenticated || !isStudent)) {
      router.push("/");
    }
  }, [isAuthenticated, isStudent, router, isFetched]);

  useEffect(() => {
    if (isFetched && hasCompletedOnboarding && hasGym) {
      router.push("/dashboard/student");
    }
  }, [hasCompletedOnboarding, hasGym, router, isFetched]);

  const {
    data: gyms = [],
    isLoading: gymsLoading,
    isError: gymsError,
    isFetched: gymsFetched,
  } = useQuery({
    queryKey: ["gyms"],
    queryFn: fetchGyms,
    enabled: isFetched && isAuthenticated && isStudent,
  });

  const joinMutation = useMutation({
    mutationFn: async (gymId: string) => {
      setJoiningId(gymId);
      const res = await joinGym(gymId);
      if (!res.success) throw new Error(res.error || "Failed to join gym");
      return res;
    },
    onSuccess: (res) => {
      // Refresh user/profile state via full navigation
      router.push(res.redirectTo || "/dashboard/student");
      router.refresh();
    },
    onError: () => {
      setJoiningId(null);
    },
  });

  // Filter gyms based on search query
  const filteredGyms = useMemo(() => {
    if (!searchQuery.trim()) return gyms;

    const query = searchQuery.toLowerCase().trim();
    return gyms.filter(
      (gym) =>
        gym.name.toLowerCase().includes(query) ||
        gym.location.toLowerCase().includes(query)
    );
  }, [gyms, searchQuery]);

  const handleSelectGym = (gymId: string) => {
    if (joinMutation.isPending) return;
    joinMutation.mutate(gymId);
  };

  const clearSearch = () => {
    setSearchQuery("");
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

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Choose Your Studio</h1>
        <p className="text-muted-foreground">
          Select a studio to start booking your fitness sessions
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search gyms by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            disabled={gymsLoading || gyms?.length === 0}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {gymsLoading || !gymsFetched ? (
        <>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </>
      ) : gymsError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-red-600 text-center">Failed to load gyms</p>
          </CardContent>
        </Card>
      ) : gyms?.length === 0 && gymsFetched ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No studios available yet. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : filteredGyms?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No gyms found matching "{searchQuery}"
            </p>
            <Button variant="outline" onClick={clearSearch} className="mt-4">
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul>
          {filteredGyms.map((gym) => (
            <li
              key={gym.id}
              className="hover:bg-neutral-100 transition-bg px-2 py-4 border-b-2 border-neutral-300 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={gym.logo_url} alt={gym.name} />
                    <AvatarFallback>{gym.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {gym.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {gym.location}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleSelectGym(gym.id)}
                  disabled={joinMutation.isPending && joiningId === gym.id}
                  className="cursor-pointer"
                >
                  {joinMutation.isPending && joiningId === gym.id
                    ? "Joining..."
                    : "Join This Studio"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
