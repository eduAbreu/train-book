import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";
import type { GymSettings } from "@/types/schedule";

interface GymSettingsCardProps {
  gymSettings?: GymSettings;
  onUpdateSettings: (settings: Partial<GymSettings>) => void;
  isLoading?: boolean;
}

export function GymSettingsCard({
  gymSettings,
  onUpdateSettings,
  isLoading,
}: GymSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Studio Settings</span>
        </CardTitle>
        <CardDescription>Configure booking policies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Waitlist</Label>
            <p className="text-sm text-muted-foreground">
              Let students join waitlist when classes are full
            </p>
          </div>
          <Switch
            checked={gymSettings?.allow_waitlist ?? true}
            onCheckedChange={(checked) =>
              onUpdateSettings({
                allow_waitlist: checked,
              })
            }
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-limit">Cancellation Limit (hours)</Label>
          <Input
            id="cancel-limit"
            type="number"
            min="0"
            value={gymSettings?.cancel_limit_hours ?? 24}
            onChange={(e) =>
              onUpdateSettings({
                cancel_limit_hours: Math.max(
                  0,
                  Number.parseInt(e.target.value) || 0
                ),
              })
            }
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Minimum hours before class to allow cancellation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
