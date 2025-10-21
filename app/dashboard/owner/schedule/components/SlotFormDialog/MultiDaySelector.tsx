import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DAYS = [
  { key: "Mon", label: "Monday" },
  { key: "Tue", label: "Tuesday" },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday" },
  { key: "Fri", label: "Friday" },
  { key: "Sat", label: "Saturday" },
  { key: "Sun", label: "Sunday" },
];

interface MultiDaySelectorProps {
  selectedDays: string[];
  onDayToggle: (day: string, checked: boolean) => void;
  isLoading?: boolean;
}

export function MultiDaySelector({
  selectedDays,
  onDayToggle,
  isLoading,
}: MultiDaySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Apply to Days</Label>
      <div className="grid grid-cols-2 gap-2">
        {DAYS.map((day) => (
          <div key={day.key} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${day.key}`}
              checked={selectedDays.includes(day.key)}
              onCheckedChange={(checked) =>
                onDayToggle(day.key, checked as boolean)
              }
              disabled={isLoading}
            />
            <Label htmlFor={`day-${day.key}`} className="text-sm font-normal">
              {day.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
