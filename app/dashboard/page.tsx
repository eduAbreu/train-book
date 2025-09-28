/**
 * Dashboard - server-side role router
 * Redirects to /dashboard/owner or /dashboard/student based on profile.role
 */

import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/");
  }

  if (profile.role === "owner") {
    redirect("/dashboard/owner");
  }

  if (profile.role === "student") {
    redirect("/dashboard/student");
  }

  redirect("/");
}
