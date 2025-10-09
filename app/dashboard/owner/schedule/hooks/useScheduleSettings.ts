import { useState } from "react";
import type { GymSettings } from "@/types/schedule";

export function useScheduleSettings(initialSettings?: GymSettings) {
  const [gymSettings, setGymSettings] = useState<GymSettings | undefined>(
    initialSettings
  );

  const updateSettings = (newSettings: Partial<GymSettings>) => {
    setGymSettings(
      (prev) =>
        ({
          ...prev,
          ...newSettings,
        }) as GymSettings
    );
  };

  return {
    gymSettings,
    updateSettings,
    setGymSettings,
  };
}
