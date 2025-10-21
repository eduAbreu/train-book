import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { isValidDate } from "@/app/dashboard/owner/schedule/hooks/useClassCalendar";

interface CalendarWithMarkersProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  classesByDate: Record<string, any[]>;
}

export function CalendarWithMarkers({
  selectedDate,
  onDateChange,
  classesByDate,
}: CalendarWithMarkersProps) {
  return (
    <div className="flex justify-center flex-col items-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date && isValidDate(date)) {
            onDateChange(date);
          }
        }}
        locale={ptBR}
        className="rounded-md border"
        numberOfMonths={2}
        modifiers={{
          hasClasses: (date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            return classesByDate[dateKey]?.length > 0;
          },
        }}
        modifiersStyles={{
          hasClasses: {
            backgroundColor: "rgb(34 197 94 / 0.1)",
            color: "rgb(21 128 61)",
          },
        }}
      />
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-100 rounded-full" />
          <span>Dias com aulas</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-blue-100 rounded-full" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
          <span>Dia selecionado</span>
        </div>
      </div>
    </div>
  );
}
