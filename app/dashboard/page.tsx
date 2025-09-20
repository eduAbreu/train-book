/**
 * Dashboard - Página principal do dashboard
 * O redirecionamento baseado em role é feito pelo RoleRedirect no layout
 */

"use client";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// The RoleRedirect component will automatically redirect users to the appropriate dashboard based on their role.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  // This page should never render as RoleRedirect will redirect users
  // to either /dashboard/owner or /dashboard/student based on their role
  // But we'll show a test component for debugging purposes
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}
