import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { SlotCard } from "./SlotCard";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

interface DayScheduleProps {
  day: { key: string; label: string };
  weeklyTemplate: { [key: string]: TimeSlot[] };
  getClassTypeName: (classTypeId: string) => string;
  onAddSlot: () => void;
  onEditSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
}

export function DaySchedule({
  day,
  weeklyTemplate,
  getClassTypeName,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}: DayScheduleProps) {
  const daySlots = (weeklyTemplate[day.key] || []).sort((a, b) => {
    // Sort by start time (HH:MM format)
    return a.start.localeCompare(b.start);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{day.label}</h3>
        <Button onClick={onAddSlot}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      <div className="space-y-3">
        {daySlots.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <p>No classes scheduled for {day.label}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          daySlots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              getClassTypeName={getClassTypeName}
              onEdit={onEditSlot}
              onDelete={onDeleteSlot}
            />
          ))
        )}
      </div>
    </div>
  );
}
