"use client";

import { usePWA } from "@/lib/hooks/use-pwa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, Download, Check } from "lucide-react";

interface PWAStatusProps {
  showOfflineAlert?: boolean;
  showInstallButton?: boolean;
}

export function PWAStatus({
  showOfflineAlert = true,
  showInstallButton = true,
}: PWAStatusProps) {
  const {
    isOnline,
    isInstalled,
    isInstallable,
    installApp,
    showInstallPrompt,
  } = usePWA();

  return (
    <div className="space-y-2">
      {/* Offline Alert */}
      {showOfflineAlert && !isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Some features may not be available.
          </AlertDescription>
        </Alert>
      )}

      {/* Online Status (subtle) */}
      {showOfflineAlert && isOnline && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </div>
      )}

      {/* Install Button */}
      {showInstallButton && showInstallPrompt && !isInstalled && (
        <div className="flex items-center space-x-2">
          {isInstallable ? (
            <Button onClick={installApp} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          ) : (
            <div className="flex items-center text-sm text-muted-foreground">
              <Check className="h-3 w-3 mr-1" />
              App Installed
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mini version for headers/toolbars
export function PWAStatusMini() {
  const { isOnline, isInstalled, isInstallable, installApp } = usePWA();

  if (isInstalled) {
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        <Check className="h-3 w-3 mr-1" />
        Installed
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center text-xs text-destructive">
        <WifiOff className="h-3 w-3 mr-1" />
        Offline
      </div>
    );
  }

  if (isInstallable) {
    return (
      <Button
        onClick={installApp}
        size="sm"
        variant="ghost"
        className="h-6 px-2 text-xs"
      >
        <Download className="h-3 w-3 mr-1" />
        Install
      </Button>
    );
  }

  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <Wifi className="h-3 w-3 mr-1" />
      Online
    </div>
  );
}
