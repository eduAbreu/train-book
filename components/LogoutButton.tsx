"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/libs/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    queryClient.invalidateQueries();
  };

  return (
    <div className="flex items-center justify-end">
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};
