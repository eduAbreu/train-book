import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ClassType } from "@/features/class-types/actions";
import type { ClassPreview } from "@/app/dashboard/owner/schedule/hooks/useCreateClassForm";
import { ClassPreviewCard } from "./ClassPreviewCard";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

interface RecurringClassFormProps {
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  selectedDays: number[];
  onDayToggle: (day: number) => void;
  time: string;
  onTimeChange: (time: string) => void;
  classType: string;
  onClassTypeChange: (classType: string) => void;
  capacity: number;
  onCapacityChange: (capacity: number) => void;
  instructor: string;
  onInstructorChange: (instructor: string) => void;
  classTypes: ClassType[];
  preview: ClassPreview[];
  onGenerate: () => void;
  isValid: boolean;
  isLoading: boolean;
}

export function RecurringClassForm({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  selectedDays,
  onDayToggle,
  time,
  onTimeChange,
  classType,
  onClassTypeChange,
  capacity,
  onCapacityChange,
  instructor,
  onInstructorChange,
  classTypes,
  preview,
  onGenerate,
  isValid,
  isLoading,
}: RecurringClassFormProps) {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Horário Recorrente</CardTitle>
        <CardDescription>
          Crie múltiplas aulas baseadas em um padrão (ex: Yoga às 9h, Segunda a
          Sexta)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    onStartDateChange(date);
                    setIsStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data de Fim</Label>
            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    onEndDateChange(date);
                    setIsEndDateOpen(false);
                  }}
                  disabled={(date) => (startDate ? date < startDate : false)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dias da Semana</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.value}
                variant={
                  selectedDays.includes(day.value) ? "default" : "outline"
                }
                size="sm"
                onClick={() => onDayToggle(day.value)}
              >
                {day.short}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Hora</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              placeholder="09:00"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Aula</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={classType}
              onChange={(e) => onClassTypeChange(e.target.value)}
            >
              <option value="">Selecionar tipo</option>
              {classTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.emoji} {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Capacidade</Label>
            <Input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => onCapacityChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Instrutor (opcional)</Label>
          <Input
            value={instructor}
            onChange={(e) => onInstructorChange(e.target.value)}
            placeholder="Nome do instrutor"
          />
        </div>

        <ClassPreviewCard preview={preview} />

        <Button
          onClick={onGenerate}
          disabled={!isValid || isLoading || preview.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando {preview.length} aulas...
            </>
          ) : (
            `Gerar ${preview.length} Aulas`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
