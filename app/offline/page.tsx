"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WifiOff, RefreshCw, Dumbbell, Calendar, Users } from "lucide-react";
import { PWA_CONFIG } from "@/lib/constants";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Dumbbell className="h-5 w-5" />
              {PWA_CONFIG.APP_NAME} - Offline
            </CardTitle>
            <CardDescription>
              You're currently offline, but you can still access some features
              of {PWA_CONFIG.APP_NAME}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-left space-y-3">
              <h4 className="font-medium text-sm">Available offline:</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  View previously loaded classes
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  Check your booking history
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Browse gym information
                </div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                We'll automatically reconnect when your connection is restored.
              </p>
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="font-medium text-sm">Pro Tip</h4>
              <p className="text-xs text-muted-foreground">
                Install {PWA_CONFIG.APP_NAME} as an app for better offline
                experience and faster loading times.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
