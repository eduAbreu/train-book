"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useClassCalendar, isValidDate } from "../../hooks/useClassCalendar";
import { CalendarWithMarkers } from "./CalendarWithMarkers";
import { ClassListItem } from "./ClassListItem";

interface ClassCalendarProps {
  classes: any[];
  getClassTypeName: (classTypeId: string) => string;
  onAddClass: () => void;
  onEditClass: (classItem: any) => void;
  onDeleteClass: (classId: string) => void;
  onViewBookings: (classItem: any) => void;
  isLoading?: boolean;
}

export function ClassCalendar({
  classes,
  getClassTypeName,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onViewBookings,
}: ClassCalendarProps) {
  const { selectedDate, setSelectedDate, selectedDateClasses, classesByDate } =
    useClassCalendar(classes);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Aulas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center flex-col items-center">
            <CalendarWithMarkers
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              classesByDate={classesByDate}
            />
          </CardContent>
        </Card>
      </div>

      {/* All Classes */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {selectedDate && isValidDate(selectedDate)
                    ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })
                    : "Selecione uma data"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedDateClasses.length}{" "}
                  {selectedDateClasses.length === 1 ? "aula" : "aulas"}{" "}
                  agendadas
                </p>
              </div>
              <Button onClick={onAddClass} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Aula
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDateClasses.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhuma aula agendada
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedDate && isValidDate(selectedDate)
                    ? "Não há aulas para este dia"
                    : "Selecione uma data para ver as aulas"}
                </p>
                {selectedDate && isValidDate(selectedDate) && (
                  <Button onClick={onAddClass} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Aula
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDateClasses.map((classItem) => (
                  <ClassListItem
                    key={classItem.id}
                    classItem={classItem}
                    getClassTypeName={getClassTypeName}
                    onEdit={onEditClass}
                    onDelete={onDeleteClass}
                    onViewBookings={onViewBookings}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
