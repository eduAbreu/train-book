import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DaySchedule } from "./DaySchedule";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

interface ScheduleTabsProps {
  activeDay: string;
  onDayChange: (day: string) => void;
  weeklyTemplate: { [key: string]: TimeSlot[] };
  getClassTypeName: (classTypeId: string) => string;
  onAddSlot: () => void;
  onEditSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
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

export function ScheduleTabs({
  activeDay,
  onDayChange,
  weeklyTemplate,
  getClassTypeName,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}: ScheduleTabsProps) {
  return (
    <Tabs value={activeDay} onValueChange={onDayChange}>
      <TabsList className="grid w-full grid-cols-7">
        {DAYS.map((day) => (
          <TabsTrigger key={day.key} value={day.key} className="text-xs">
            {day.label.slice(0, 3)}
          </TabsTrigger>
        ))}
      </TabsList>

      {DAYS.map((day) => (
        <TabsContent key={day.key} value={day.key} className="space-y-4">
          <DaySchedule
            day={day}
            weeklyTemplate={weeklyTemplate}
            getClassTypeName={getClassTypeName}
            onAddSlot={onAddSlot}
            onEditSlot={onEditSlot}
            onDeleteSlot={onDeleteSlot}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
