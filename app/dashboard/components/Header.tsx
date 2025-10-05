import React from "react";
import ButtonAccount from "@/components/ButtonAccount";
import Link from "next/link";
import { useAuth } from "@/provider/AuthProvider";

export default function Header() {
  const { isOwner, isStudent } = useAuth();

  return (
    <header className="border-b border-border p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
        </div>
        <div className="flex items-center space-x-4">
          <ButtonAccount />
        </div>
      </div>
    </header>
  );
}
