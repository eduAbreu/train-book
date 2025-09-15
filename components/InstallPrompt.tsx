"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual installation instructions
      setShowPrompt(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Install App</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Install TrainBook for a better experience with offline access and
          quick launch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {deferredPrompt ? (
          <Button onClick={handleInstallClick} className="w-full">
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
                    Tap the share button and select &quot;Add to Home
                    Screen&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Download className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Desktop:</p>
                  <p className="text-muted-foreground">
                    Look for the install icon in your browser&apos;s address bar
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
