"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock } from "lucide-react";
import { ScheduleCard } from "./ScheduleCard";

interface ScheduleSectionProps {
  type: "classes" | "slots";
  title: string;
  icon: string;
  items: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onGenerate?: (item: any) => void; // Only for slots
  onViewBookings?: (item: any) => void; // Only for classes
  onDuplicate?: (item: any) => void;
  getClassTypeName: (classTypeId: string) => string;
  isLoading?: boolean;
}

export function ScheduleSection({
  type,
  title,
  icon,
  items,
  onAdd,
  onEdit,
  onDelete,
  onGenerate,
  onViewBookings,
  onDuplicate,
  getClassTypeName,
  isLoading = false,
}: ScheduleSectionProps) {
  const isClasses = type === "classes";
  const isSlots = type === "slots";

  // Styles based on type
  const styles = isClasses
    ? {
        border: "border-green-200",
        background: "bg-green-50",
        titleColor: "text-green-700",
        iconColor: "text-green-600",
        buttonColor: "bg-green-600 hover:bg-green-700",
      }
    : {
        border: "border-blue-200",
        background: "bg-blue-50",
        titleColor: "text-blue-700",
        iconColor: "text-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700",
      };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${styles.background} ${styles.border}`}
          >
            <span className={`text-xl ${styles.iconColor}`}>{icon}</span>
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isClasses
                ? "Aulas agendadas que os alunos podem reservar"
                : "Horários disponíveis que podem gerar aulas"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={styles.border}>
            {items.length} {isClasses ? "aulas" : "horários"}
          </Badge>
          <Button onClick={onAdd} size="sm" className={styles.buttonColor}>
            <Plus className="h-4 w-4 mr-2" />
            {isClasses ? "Nova Aula" : "Novo Horário"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className={styles.border}>
            <CardContent className="p-8 text-center">
              <div
                className={`mx-auto w-16 h-16 rounded-full ${styles.background} flex items-center justify-center mb-4`}
              >
                <span className={`text-2xl ${styles.iconColor}`}>{icon}</span>
              </div>
              <h4 className={`font-medium ${styles.titleColor} mb-2`}>
                {isClasses
                  ? "Nenhuma aula agendada"
                  : "Nenhum horário definido"}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {isClasses
                  ? "Crie aulas específicas ou gere a partir dos horários disponíveis"
                  : "Defina horários recorrentes para gerar aulas automaticamente"}
              </p>
              <Button onClick={onAdd} size="sm" className={styles.buttonColor}>
                <Plus className="h-4 w-4 mr-2" />
                {isClasses ? "Criar Primeira Aula" : "Definir Primeiro Horário"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <ScheduleCard
              key={item.id}
              type={isClasses ? "class" : "slot"}
              data={{
                ...item,
                class_type: {
                  name: getClassTypeName(
                    item.class_type_id || item.classTypeId
                  ),
                  emoji: item.class_type?.emoji || "🏃",
                },
              }}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
              onGenerate={
                isSlots && onGenerate ? () => onGenerate(item) : undefined
              }
              onViewBookings={
                isClasses && onViewBookings
                  ? () => onViewBookings(item)
                  : undefined
              }
              onDuplicate={onDuplicate ? () => onDuplicate(item) : undefined}
            />
          ))
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
