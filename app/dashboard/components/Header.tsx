import React from "react";
import ButtonAccount from "@/components/ButtonAccount";
import Link from "next/link";
import { useAuth } from "@/provider/AuthProvider";
import { usePathname } from "next/navigation";

export default function Header() {
  const { isOwner, isStudent } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="border-b border-border p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold">
            <Link
              href={
                isOwner
                  ? "/dashboard/owner"
                  : isStudent
                    ? "/dashboard/student"
                    : "/dashboard"
              }
            >
              Dashboard
            </Link>
          </h1>

          {isOwner && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard/owner/modalities"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard/owner/modalities")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Modalidades
              </Link>
              <Link
                href="/dashboard/owner/schedule"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard/owner/schedule")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Horários
              </Link>
              <Link
                href="/dashboard/owner/settings"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/dashboard/owner/settings")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Configurações
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ButtonAccount />
        </div>
      </div>
    </header>
  );
}
