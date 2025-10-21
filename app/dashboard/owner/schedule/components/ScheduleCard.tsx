"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  User,
  Edit,
  Trash2,
  Zap,
  Eye,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SlotData {
  id: string;
  class_type: {
    name: string;
    emoji: string;
  };
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  instructor?: string;
  is_active: boolean;
}

interface ClassData {
  id: string;
  class_type: {
    name: string;
    emoji: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  instructor?: string;
  status: string;
  confirmed_bookings?: number;
}

interface ScheduleCardProps {
  type: "slot" | "class";
  data: SlotData | ClassData;
  onEdit: () => void;
  onDelete: () => void;
  onGenerate?: () => void; // Only for slots
  onViewBookings?: () => void; // Only for classes
  onDuplicate?: () => void;
}

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function ScheduleCard({
  type,
  data,
  onEdit,
  onDelete,
  onGenerate,
  onViewBookings,
  onDuplicate,
}: ScheduleCardProps) {
  const isSlot = type === "slot";
  const isClass = type === "class";

  // Styles based on type
  const styles = isSlot
    ? {
        border: "border-blue-200",
        background: "bg-blue-50",
        titleColor: "text-blue-700",
        iconColor: "text-blue-600",
        badgeColor: "bg-blue-100 text-blue-800",
      }
    : {
        border: "border-green-200",
        background: "bg-green-50",
        titleColor: "text-green-700",
        iconColor: "text-green-600",
        badgeColor: "bg-green-100 text-green-800",
      };

  const slotData = data as SlotData;
  const classData = data as ClassData;

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        styles.border,
        styles.background
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header with icon and title */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  styles.background,
                  styles.border
                )}
              >
                {isSlot ? (
                  <Calendar className={cn("h-5 w-5", styles.iconColor)} />
                ) : (
                  <Calendar className={cn("h-5 w-5", styles.iconColor)} />
                )}
              </div>
              <div>
                <h4 className={cn("font-semibold text-lg", styles.titleColor)}>
                  {data.class_type.emoji} {data.class_type.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {data.start_time} - {data.end_time}
                  </span>
                </div>
              </div>
            </div>

            {/* Content based on type */}
            <div className="space-y-2">
              {isSlot && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {DAYS_OF_WEEK[slotData.day_of_week]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{slotData.capacity} pessoas</span>
                  </div>
                  {slotData.instructor && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{slotData.instructor}</span>
                    </div>
                  )}
                </div>
              )}

              {isClass && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(classData.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {classData.capacity} pessoas
                      {classData.confirmed_bookings !== undefined && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({classData.confirmed_bookings} reservadas)
                        </span>
                      )}
                    </span>
                  </div>
                  {classData.instructor && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{classData.instructor}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status badges */}
              <div className="flex gap-2">
                {isSlot && (
                  <Badge
                    variant={slotData.is_active ? "default" : "secondary"}
                    className={styles.badgeColor}
                  >
                    {slotData.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                )}
                {isClass && (
                  <Badge
                    variant={
                      classData.status === "scheduled" ? "default" : "secondary"
                    }
                    className={styles.badgeColor}
                  >
                    {classData.status === "scheduled"
                      ? "Agendada"
                      : classData.status === "cancelled"
                        ? "Cancelada"
                        : "Concluída"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 ml-4">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Contextual actions */}
            <div className="flex gap-1">
              {isSlot && onGenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerate}
                  className="h-8 text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Gerar
                </Button>
              )}
              {isClass && onViewBookings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewBookings}
                  className="h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDuplicate}
                  className="h-8 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Duplicar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
