"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Smartphone, X, Dumbbell } from "lucide-react";
import { PWA_CONFIG } from "@/lib/constants";
import { usePWA } from "@/lib/hooks/use-pwa";

export function InstallPrompt() {
  const { showInstallPrompt, isInstallable, installApp, dismissInstall } =
    usePWA();

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Install {PWA_CONFIG.APP_NAME}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={dismissInstall}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Install {PWA_CONFIG.APP_NAME} for a better experience with offline
          access, quick launch, and push notifications for your bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isInstallable ? (
          <Button onClick={installApp} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Install Now
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              To install this app on your device:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <Smartphone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Mobile:</p>
                  <p className="text-muted-foreground">
                    Tap the share button and select "Add to Home Screen"
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Download className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Desktop:</p>
                  <p className="text-muted-foreground">
                    Look for the install icon in your browser's address bar
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
