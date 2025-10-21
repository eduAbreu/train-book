import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClassCalendar } from "../ClassCalendar/ClassCalendar";

interface ClassesTabProps {
  classes: any[];
  getClassTypeName: (classTypeId: string) => string;
  onAddClass: () => void;
  onEditClass: (classItem: any) => void;
  onDeleteClass: (classId: string) => void;
  onViewBookings: (classItem: any) => void;
}

export function ClassesTab({
  classes,
  getClassTypeName,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onViewBookings,
}: ClassesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aulas Agendadas</h2>
          <p className="text-muted-foreground">
            Gerencie as aulas que os alunos podem reservar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onAddClass}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        </div>
      </div>

      <ClassCalendar
        classes={classes}
        getClassTypeName={getClassTypeName}
        onAddClass={onAddClass}
        onEditClass={onEditClass}
        onDeleteClass={onDeleteClass}
        onViewBookings={onViewBookings}
        isLoading={false}
      />
    </div>
  );
}
