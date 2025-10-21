import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  User,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClassListItemProps {
  classItem: any;
  getClassTypeName: (classTypeId: string) => string;
  onEdit: (classItem: any) => void;
  onDelete: (classId: string) => void;
  onViewBookings: (classItem: any) => void;
}

export function ClassListItem({
  classItem,
  getClassTypeName,
  onEdit,
  onDelete,
  onViewBookings,
}: ClassListItemProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">
                  {classItem.class_type?.emoji}{" "}
                  {getClassTypeName(classItem.class_type_id)}
                </h4>
                <p className="text-sm text-green-600 mb-2">
                  {format(new Date(classItem.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                <div className="flex items-center gap-4 text-sm text-green-700">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {classItem.start_time} - {classItem.end_time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {classItem.capacity} pessoas
                      {classItem.confirmed_bookings !== undefined && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({classItem.confirmed_bookings} reservadas)
                        </span>
                      )}
                    </span>
                  </div>
                  {classItem.instructor && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{classItem.instructor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <Badge
              variant={
                classItem.status === "scheduled" ? "default" : "secondary"
              }
              className="bg-green-100 text-green-800"
            >
              {classItem.status === "scheduled"
                ? "Agendada"
                : classItem.status === "cancelled"
                  ? "Cancelada"
                  : "Concluída"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 mt-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewBookings(classItem)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Reservas
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(classItem)}>
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(classItem.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
