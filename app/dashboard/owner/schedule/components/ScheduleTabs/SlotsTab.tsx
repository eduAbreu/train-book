import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScheduleSection } from "../ScheduleSection";

interface SlotsTabProps {
  scheduleSlots: any[];
  getClassTypeName: (classTypeId: string) => string;
  onAddSlot: () => void;
  onEditSlot: (slot: any) => void;
  onDeleteSlot: (slotId: string) => void;
  onGenerateFromSlot: (slot: any) => void;
}

export function SlotsTab({
  scheduleSlots,
  getClassTypeName,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  onGenerateFromSlot,
}: SlotsTabProps) {
  const [slotFilter, setSlotFilter] = useState("active");

  // Filter slots based on selected filter
  const filteredSlots = scheduleSlots.filter((slot) => {
    switch (slotFilter) {
      case "active":
        return slot.is_active;
      case "inactive":
        return !slot.is_active;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Horários Disponíveis</h2>
          <p className="text-muted-foreground">
            Defina horários recorrentes para gerar aulas automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <Button onClick={onAddSlot}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Horário
          </Button>
        </div>
      </div>

      <ScheduleSection
        type="slots"
        title="Horários Disponíveis"
        icon="📋"
        items={filteredSlots}
        onAdd={onAddSlot}
        onEdit={onEditSlot}
        onDelete={onDeleteSlot}
        onGenerate={onGenerateFromSlot}
        getClassTypeName={getClassTypeName}
      />
    </div>
  );
}
