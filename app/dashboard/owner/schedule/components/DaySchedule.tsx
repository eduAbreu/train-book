import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { SlotCard } from "./SlotCard";
import { ScheduleSection } from "./ScheduleSection";

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
  classes?: any[];
  scheduleSlots?: any[];
  getClassTypeName: (classTypeId: string) => string;
  onAddSlot: () => void;
  onEditSlot: (slot: TimeSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onEditClass?: (classItem: any) => void;
  onDeleteClass?: (classId: string) => void;
  onViewBookings?: (classItem: any) => void;
  onGenerateFromSlot?: (slot: any) => void;
}

export function DaySchedule({
  day,
  weeklyTemplate,
  classes = [],
  scheduleSlots = [],
  getClassTypeName,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onEditClass,
  onDeleteClass,
  onViewBookings,
  onGenerateFromSlot,
}: DayScheduleProps) {
  const daySlots = (weeklyTemplate[day.key] || []).sort((a, b) => {
    return a.start.localeCompare(b.start);
  });

  // Filter slots for this day
  const dayScheduleSlots = scheduleSlots.filter((slot) => {
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayIndex = dayMap.indexOf(day.key);
    return slot.day_of_week === dayIndex;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{day.label}</h3>
        <Button onClick={onAddSlot}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Classes Section */}
      <ScheduleSection
        type="classes"
        title="Aulas Agendadas"
        icon="📅"
        items={classes}
        onAdd={onAddSlot}
        onEdit={onEditClass || (() => {})}
        onDelete={onDeleteClass || (() => {})}
        onViewBookings={onViewBookings}
        getClassTypeName={getClassTypeName}
      />

      {/* Slots Section */}
      <ScheduleSection
        type="slots"
        title="Horários Disponíveis"
        icon="📋"
        items={dayScheduleSlots}
        onAdd={onAddSlot}
        onEdit={(slot) => onEditSlot(slot as any)}
        onDelete={(slot) => onDeleteSlot(slot.id)}
        onGenerate={onGenerateFromSlot}
        getClassTypeName={getClassTypeName}
      />

      {/* Empty state */}
      {classes.length === 0 &&
        daySlots.length === 0 &&
        dayScheduleSlots.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">
                  Nenhuma aula agendada para {day.label}
                </h4>
                <p className="text-sm mb-4">
                  Crie aulas específicas ou defina horários recorrentes
                </p>
                <Button onClick={onAddSlot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Começar a Agendar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
