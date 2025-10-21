/**
 * Schedule-related types for TrainBook
 */

export interface ScheduleSlot {
  id: string;
  gym_id: string;
  class_type_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;
  end_time: string;
  duration_minutes: number;
  capacity: number;
  instructor?: string;
  is_recurring: boolean;
  recurrence_pattern: "weekly" | "biweekly" | "monthly" | "none";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  class_type?: {
    id: string;
    name: string;
    emoji?: string;
  };
}

export interface CreateSlotData {
  class_type_id: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  instructor?: string;
  is_recurring?: boolean;
  recurrence_pattern?: "weekly" | "biweekly" | "monthly" | "none";
  is_active?: boolean;
}

export interface UpdateSlotData {
  class_type_id?: string;
  day_of_week?: number;
  start_time?: string;
  duration_minutes?: number;
  capacity?: number;
  instructor?: string;
  is_recurring?: boolean;
  recurrence_pattern?: "weekly" | "biweekly" | "monthly" | "none";
  is_active?: boolean;
}

// Legacy interface for backward compatibility
export interface WeeklyTemplateSlot {
  id: string;
  gym_id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  class_type_id: string;
  class_type?: {
    id: string;
    name: string;
    emoji?: string;
  };
  capacity: number;
  instructor?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplySlotToDaysData {
  slot: Omit<CreateSlotData, "day">;
  days: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
  mode: "skip" | "replace";
}

export interface ApplySlotResult {
  createdDays: string[];
  skippedDays: string[];
  replacedDays: string[];
}

export interface GymSettings {
  gym_id: string;
  allow_waitlist: boolean;
  cancel_limit_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGymSettingsData {
  allow_waitlist?: boolean;
  cancel_limit_hours?: number;
}

export interface UpdateGymSettingsData {
  allow_waitlist?: boolean;
  cancel_limit_hours?: number;
}

// Legacy interface for backward compatibility with existing schedule page
export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

export interface WeeklyTemplate {
  [key: string]: TimeSlot[];
}

export interface Day {
  key: string;
  label: string;
}

// Schedule messages for i18n
export const ScheduleMessages = {
  en: {
    SLOT_CREATED_SUCCESS: "Schedule slot created successfully!",
    SLOT_UPDATED_SUCCESS: "Schedule slot updated successfully!",
    SLOT_DELETED_SUCCESS: "Schedule slot deleted successfully!",
    SLOTS_APPLIED_SUCCESS: "Slots applied to multiple days successfully!",
    SETTINGS_UPDATED_SUCCESS: "Gym settings updated successfully!",
    GENERATE_CLASSES_SUCCESS: "Classes generated successfully!",
    GENERATE_CLASSES_ERROR: "Error generating classes",
    VALIDATION_ERROR: "Please check your input",
    TIME_OVERLAP_ERROR: "Time slot overlaps with existing class",
    CROSS_DAY_ERROR:
      "Duration makes the class cross to the next day; reduce duration or change start time.",
    SLOT_IN_USE_ERROR: "Cannot delete slot that is being used in classes",
    UNAUTHORIZED: "You are not authorized to perform this action",
    NETWORK_ERROR: "Network error. Please try again",
    UNKNOWN: "An unexpected error occurred",
    LOADING: "Loading...",
    ADD_CLASS: "Add Class",
    EDIT_CLASS: "Edit Class",
    DELETE_CLASS: "Delete Class",
    GENERATE_CLASSES: "Generate Classes",
    START_TIME_LABEL: "Start Time",
    DURATION_LABEL: "Duration (minutes)",
    END_TIME_LABEL: "End Time (calculated)",
    CLASS_TYPE_LABEL: "Class Type",
    CAPACITY_LABEL: "Capacity",
    INSTRUCTOR_LABEL: "Instructor",
    DAY_OF_WEEK_LABEL: "Day of Week",
    IS_RECURRING_LABEL: "Recurring",
    RECURRENCE_PATTERN_LABEL: "Recurrence Pattern",
    IS_ACTIVE_LABEL: "Active",
    APPLY_TO_DAYS_LABEL: "Apply to other days (optional)",
    CONFLICT_MODE_LABEL: "Conflict behavior",
    SKIP_CONFLICTS: "Skip days with conflicts",
    REPLACE_CONFLICTS: "Replace conflicting slots on those days",
    ALLOW_WAITLIST_LABEL: "Allow Waitlist",
    CANCEL_LIMIT_LABEL: "Cancellation Limit (hours)",
    ALLOW_WAITLIST_DESCRIPTION:
      "Let students join waitlist when classes are full",
    CANCEL_LIMIT_DESCRIPTION:
      "Minimum hours before class to allow cancellation",
    DAY_SUNDAY: "Sunday",
    DAY_MONDAY: "Monday",
    DAY_TUESDAY: "Tuesday",
    DAY_WEDNESDAY: "Wednesday",
    DAY_THURSDAY: "Thursday",
    DAY_FRIDAY: "Friday",
    DAY_SATURDAY: "Saturday",
    RECURRENCE_WEEKLY: "Weekly",
    RECURRENCE_BIWEEKLY: "Bi-weekly",
    RECURRENCE_MONTHLY: "Monthly",
    RECURRENCE_NONE: "None",
  },
  pt: {
    SLOT_CREATED_SUCCESS: "Horário criado com sucesso!",
    SLOT_UPDATED_SUCCESS: "Horário atualizado com sucesso!",
    SLOT_DELETED_SUCCESS: "Horário eliminado com sucesso!",
    SLOTS_APPLIED_SUCCESS: "Horários aplicados a vários dias com sucesso!",
    SETTINGS_UPDATED_SUCCESS:
      "Configurações do ginásio atualizadas com sucesso!",
    GENERATE_CLASSES_SUCCESS: "Aulas geradas com sucesso!",
    GENERATE_CLASSES_ERROR: "Erro ao gerar aulas",
    VALIDATION_ERROR: "Por favor, verifica os teus dados",
    TIME_OVERLAP_ERROR: "Horário sobrepõe-se com uma aula existente",
    CROSS_DAY_ERROR:
      "A duração faz a aula passar para o dia seguinte; reduz a duração ou altera a hora de início.",
    SLOT_IN_USE_ERROR:
      "Não é possível eliminar horário que está a ser usado em aulas",
    UNAUTHORIZED: "Não estás autorizado a realizar esta ação",
    NETWORK_ERROR: "Erro de rede. Tenta novamente",
    UNKNOWN: "Ocorreu um erro inesperado",
    LOADING: "A carregar...",
    ADD_CLASS: "Adicionar Aula",
    EDIT_CLASS: "Editar Aula",
    DELETE_CLASS: "Eliminar Aula",
    GENERATE_CLASSES: "Gerar Aulas",
    START_TIME_LABEL: "Hora de Início",
    DURATION_LABEL: "Duração (minutos)",
    END_TIME_LABEL: "Hora de Fim (calculada)",
    CLASS_TYPE_LABEL: "Tipo de Aula",
    CAPACITY_LABEL: "Capacidade",
    INSTRUCTOR_LABEL: "Instrutor",
    DAY_OF_WEEK_LABEL: "Dia da Semana",
    IS_RECURRING_LABEL: "Recorrente",
    RECURRENCE_PATTERN_LABEL: "Padrão de Recorrência",
    IS_ACTIVE_LABEL: "Ativo",
    APPLY_TO_DAYS_LABEL: "Aplicar a outros dias (opcional)",
    CONFLICT_MODE_LABEL: "Comportamento de conflitos",
    SKIP_CONFLICTS: "Ignorar dias com conflito",
    REPLACE_CONFLICTS: "Substituir slots conflitantes nesses dias",
    ALLOW_WAITLIST_LABEL: "Permitir Lista de Espera",
    CANCEL_LIMIT_LABEL: "Limite de Cancelamento (horas)",
    ALLOW_WAITLIST_DESCRIPTION:
      "Permitir que alunos se inscrevam na lista de espera quando as aulas estão cheias",
    CANCEL_LIMIT_DESCRIPTION:
      "Horas mínimas antes da aula para permitir cancelamento",
    DAY_SUNDAY: "Domingo",
    DAY_MONDAY: "Segunda-feira",
    DAY_TUESDAY: "Terça-feira",
    DAY_WEDNESDAY: "Quarta-feira",
    DAY_THURSDAY: "Quinta-feira",
    DAY_FRIDAY: "Sexta-feira",
    DAY_SATURDAY: "Sábado",
    RECURRENCE_WEEKLY: "Semanal",
    RECURRENCE_BIWEEKLY: "Quinzenal",
    RECURRENCE_MONTHLY: "Mensal",
    RECURRENCE_NONE: "Nenhuma",
  },
} as const;

export type ScheduleLocale = keyof typeof ScheduleMessages;
