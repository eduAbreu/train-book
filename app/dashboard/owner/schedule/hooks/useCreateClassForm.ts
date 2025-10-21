import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { ClassType } from "@/features/class-types/actions";

export interface SingleClassData {
  date: Date;
  time: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

export interface RecurringClassData {
  startDate: Date;
  endDate: Date;
  daysOfWeek: number[];
  time: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

export interface ClassPreview {
  date: string;
  dayOfWeek: string;
  time: string;
  classType: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda", short: "Seg" },
  { value: 2, label: "Terça", short: "Ter" },
  { value: 3, label: "Quarta", short: "Qua" },
  { value: 4, label: "Quinta", short: "Qui" },
  { value: 5, label: "Sexta", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

export function useCreateClassForm(classTypes: ClassType[], isOpen: boolean) {
  const [mode, setMode] = useState<"single" | "recurring" | "template">(
    "single"
  );

  // Single class state
  const [singleDate, setSingleDate] = useState<Date>();
  const [singleTime, setSingleTime] = useState("");
  const [singleClassType, setSingleClassType] = useState("");
  const [singleCapacity, setSingleCapacity] = useState(1);
  const [singleInstructor, setSingleInstructor] = useState("");

  // Recurring class state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [recurringTime, setRecurringTime] = useState("");
  const [recurringClassType, setRecurringClassType] = useState("");
  const [recurringCapacity, setRecurringCapacity] = useState(1);
  const [recurringInstructor, setRecurringInstructor] = useState("");

  // Template generation state
  const [templateStartDate, setTemplateStartDate] = useState<Date>();
  const [templateEndDate, setTemplateEndDate] = useState<Date>();

  // Preview state
  const [preview, setPreview] = useState<ClassPreview[]>([]);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode("single");
      setSingleDate(undefined);
      setSingleTime("");
      setSingleClassType(classTypes[0]?.id || "");
      setSingleCapacity(1);
      setSingleInstructor("");
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedDays([]);
      setRecurringTime("");
      setRecurringClassType(classTypes[0]?.id || "");
      setRecurringCapacity(1);
      setRecurringInstructor("");
      setTemplateStartDate(undefined);
      setTemplateEndDate(undefined);
      setPreview([]);
    }
  }, [isOpen, classTypes]);

  // Generate preview for recurring classes
  const generatePreview = async () => {
    if (
      !startDate ||
      !endDate ||
      selectedDays.length === 0 ||
      !recurringTime ||
      !recurringClassType
    ) {
      setPreview([]);
      return;
    }

    setIsGeneratingPreview(true);

    try {
      const previewData: ClassPreview[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (selectedDays.includes(dayOfWeek)) {
          const classType = classTypes.find(
            (ct) => ct.id === recurringClassType
          );
          previewData.push({
            date: format(currentDate, "dd/MM/yyyy"),
            dayOfWeek: DAYS_OF_WEEK[dayOfWeek].short,
            time: recurringTime,
            classType: classType?.name || "Unknown",
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setPreview(previewData);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Update preview when recurring data changes
  useEffect(() => {
    if (mode === "recurring") {
      generatePreview();
    }
  }, [
    startDate,
    endDate,
    selectedDays,
    recurringTime,
    recurringClassType,
    mode,
  ]);

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  // Validation
  const isSingleValid = singleDate && singleTime && singleClassType;
  const isRecurringValid =
    startDate &&
    endDate &&
    selectedDays.length > 0 &&
    recurringTime &&
    recurringClassType;
  const isTemplateValid = templateStartDate && templateEndDate;

  return {
    // Mode
    mode,
    setMode,

    // Single class
    singleDate,
    setSingleDate,
    singleTime,
    setSingleTime,
    singleClassType,
    setSingleClassType,
    singleCapacity,
    setSingleCapacity,
    singleInstructor,
    setSingleInstructor,

    // Recurring class
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedDays,
    setSelectedDays,
    recurringTime,
    setRecurringTime,
    recurringClassType,
    setRecurringClassType,
    recurringCapacity,
    setRecurringCapacity,
    recurringInstructor,
    setRecurringInstructor,
    handleDayToggle,

    // Template
    templateStartDate,
    setTemplateStartDate,
    templateEndDate,
    setTemplateEndDate,

    // Preview
    preview,
    isGeneratingPreview,

    // Validation
    isSingleValid,
    isRecurringValid,
    isTemplateValid,
  };
}
