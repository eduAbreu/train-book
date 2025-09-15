import { ReactNode } from "react";
import config from "@/config";
import { getSEOTags } from "@/libs/seo";
import { Dumbbell } from "lucide-react";

export const metadata = getSEOTags({
  title: `Sign-in to ${config.appName}`,
  canonicalUrlRelative: "/auth/signin",
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{config.appName}</h1>
          </div>
        </div>
        <div className="min-h-screen flex justify-center pb-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </main>
  );
}
