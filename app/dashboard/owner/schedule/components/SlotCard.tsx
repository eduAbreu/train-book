import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { calculateDurationFromSlot } from "@/lib/schedule";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

interface SlotCardProps {
  slot: TimeSlot;
  getClassTypeName: (classTypeId: string) => string;
  onEdit: (slot: TimeSlot) => void;
  onDelete: (slotId: string) => void;
}

export function SlotCard({
  slot,
  getClassTypeName,
  onEdit,
  onDelete,
}: SlotCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div className="font-medium">
              {slot.start}–{slot.end} • {calculateDurationFromSlot(slot)} min
            </div>
            <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
              {getClassTypeName(slot.classTypeId)}
            </div>
            <div className="text-sm text-muted-foreground">
              {slot.capacity} spots
            </div>
            <div className="text-sm text-muted-foreground">
              {slot.instructor}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(slot)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(slot.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
