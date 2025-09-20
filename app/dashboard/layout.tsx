import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import { RoleRedirect } from "@/components/RoleRedirect";
import { AuthProvider } from "@/provider/AuthProvider";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <AuthProvider user={user}>
      <RoleRedirect>{children}</RoleRedirect>
    </AuthProvider>
  );
}
