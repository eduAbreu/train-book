import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ScheduleOverviewProps {
  weeklyTemplate: { [key: string]: any[] };
  getSlotCount: (day: string) => number;
}

const DAYS = [
  { key: "Mon", label: "Monday" },
  { key: "Tue", label: "Tuesday" },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday" },
  { key: "Fri", label: "Friday" },
  { key: "Sat", label: "Saturday" },
  { key: "Sun", label: "Sunday" },
];

export function ScheduleOverview({
  weeklyTemplate,
  getSlotCount,
}: ScheduleOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Weekly Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day) => (
            <div key={day.key} className="text-center p-2 border rounded">
              <div className="text-sm font-medium">{day.label.slice(0, 3)}</div>
              <div className="text-2xl font-bold text-primary">
                {getSlotCount(day.key)}
              </div>
              <div className="text-xs text-muted-foreground">classes</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
