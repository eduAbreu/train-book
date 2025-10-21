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

interface SingleClassFormProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  time: string;
  onTimeChange: (time: string) => void;
  classType: string;
  onClassTypeChange: (classType: string) => void;
  capacity: number;
  onCapacityChange: (capacity: number) => void;
  instructor: string;
  onInstructorChange: (instructor: string) => void;
  classTypes: ClassType[];
  onSave: () => void;
  isValid: boolean;
  isLoading: boolean;
}

export function SingleClassForm({
  date,
  onDateChange,
  time,
  onTimeChange,
  classType,
  onClassTypeChange,
  capacity,
  onCapacityChange,
  instructor,
  onInstructorChange,
  classTypes,
  onSave,
  isValid,
  isLoading,
}: SingleClassFormProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Aula Específica</CardTitle>
        <CardDescription>
          Crie uma aula para uma data específica (ex: Workshop, Evento especial)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    onDateChange(selectedDate);
                    setIsDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Hora</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              placeholder="09:00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <Button
          onClick={onSave}
          disabled={!isValid || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Aula"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
