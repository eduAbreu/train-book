"use client";

import { Button } from "@/components/ui/button";
import { Plus, Calendar as LucideCalendar, Zap } from "lucide-react";
import type { ClassType } from "@/features/class-types/actions";
import { useCreateClassForm } from "../../hooks/useCreateClassForm";
import type {
  SingleClassData,
  RecurringClassData,
} from "../../hooks/useCreateClassForm";
import { SingleClassForm } from "./SingleClassForm";
import { RecurringClassForm } from "./RecurringClassForm";
import { TemplateGenerationForm } from "./TemplateGenerationForm";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SingleClassData) => void;
  onGenerateRecurring: (data: RecurringClassData) => void;
  onGenerateFromTemplate: (data: {
    startDate: string;
    endDate: string;
  }) => void;
  classTypes: ClassType[];
  isLoading?: boolean;
}

export function CreateClassModal({
  isOpen,
  onClose,
  onSave,
  onGenerateRecurring,
  onGenerateFromTemplate,
  classTypes,
  isLoading = false,
}: CreateClassModalProps) {
  const form = useCreateClassForm(classTypes, isOpen);

  const handleSingleSave = () => {
    if (!form.singleDate || !form.singleTime || !form.singleClassType) return;

    onSave({
      date: form.singleDate,
      time: form.singleTime,
      classTypeId: form.singleClassType,
      capacity: form.singleCapacity,
      instructor: form.singleInstructor || undefined,
    });
  };

  const handleRecurringGenerate = () => {
    if (
      !form.startDate ||
      !form.endDate ||
      form.selectedDays.length === 0 ||
      !form.recurringTime ||
      !form.recurringClassType
    )
      return;

    onGenerateRecurring({
      startDate: form.startDate,
      endDate: form.endDate,
      daysOfWeek: form.selectedDays,
      time: form.recurringTime,
      classTypeId: form.recurringClassType,
      capacity: form.recurringCapacity,
      instructor: form.recurringInstructor || undefined,
    });
  };

  const handleTemplateGenerate = () => {
    if (!form.templateStartDate || !form.templateEndDate) return;

    onGenerateFromTemplate({
      startDate: form.templateStartDate.toISOString().split("T")[0],
      endDate: form.templateEndDate.toISOString().split("T")[0],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Criar Aulas</h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Mode Selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Button
              variant={form.mode === "single" ? "default" : "outline"}
              onClick={() => form.setMode("single")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Plus className="h-6 w-6" />
              <span className="font-medium">Aula Específica</span>
              <span className="text-xs text-muted-foreground">
                Evento único
              </span>
            </Button>

            <Button
              variant={form.mode === "recurring" ? "default" : "outline"}
              onClick={() => form.setMode("recurring")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <LucideCalendar className="h-6 w-6" />
              <span className="font-medium">Horário Recorrente</span>
              <span className="text-xs text-muted-foreground">
                Múltiplas aulas
              </span>
            </Button>

            <Button
              variant={form.mode === "template" ? "default" : "outline"}
              onClick={() => form.setMode("template")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <Zap className="h-6 w-6" />
              <span className="font-medium">Gerar do Template</span>
              <span className="text-xs text-muted-foreground">Automático</span>
            </Button>
          </div>

          {/* Forms */}
          {form.mode === "single" && (
            <SingleClassForm
              date={form.singleDate}
              onDateChange={form.setSingleDate}
              time={form.singleTime}
              onTimeChange={form.setSingleTime}
              classType={form.singleClassType}
              onClassTypeChange={form.setSingleClassType}
              capacity={form.singleCapacity}
              onCapacityChange={form.setSingleCapacity}
              instructor={form.singleInstructor}
              onInstructorChange={form.setSingleInstructor}
              classTypes={classTypes}
              onSave={handleSingleSave}
              isValid={!!form.isSingleValid}
              isLoading={isLoading}
            />
          )}

          {form.mode === "recurring" && (
            <RecurringClassForm
              startDate={form.startDate}
              onStartDateChange={form.setStartDate}
              endDate={form.endDate}
              onEndDateChange={form.setEndDate}
              selectedDays={form.selectedDays}
              onDayToggle={form.handleDayToggle}
              time={form.recurringTime}
              onTimeChange={form.setRecurringTime}
              classType={form.recurringClassType}
              onClassTypeChange={form.setRecurringClassType}
              capacity={form.recurringCapacity}
              onCapacityChange={form.setRecurringCapacity}
              instructor={form.recurringInstructor}
              onInstructorChange={form.setRecurringInstructor}
              classTypes={classTypes}
              preview={form.preview}
              onGenerate={handleRecurringGenerate}
              isValid={!!form.isRecurringValid}
              isLoading={isLoading}
            />
          )}

          {form.mode === "template" && (
            <TemplateGenerationForm
              startDate={form.templateStartDate}
              onStartDateChange={form.setTemplateStartDate}
              endDate={form.templateEndDate}
              onEndDateChange={form.setTemplateEndDate}
              onGenerate={handleTemplateGenerate}
              isValid={!!form.isTemplateValid}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
