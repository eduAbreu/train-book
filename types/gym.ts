/**
 * Gym-related types for TrainBook
 */

export interface Gym {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GymSettings {
  gym_id: string;
  allow_waitlist: boolean;
  cancel_limit_hours: number;
  created_at: string;
  updated_at: string;
}

export interface GymWithSettings extends Gym {
  settings: GymSettings;
}

export interface CreateGymData {
  name: string;
  location: string;
  email: string;
  phone?: string;
  description?: string;
}

export interface UpdateGymData {
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
}

export interface GymFormState {
  isSubmitting: boolean;
  error?: string;
  success?: string;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Gym creation result
export interface GymCreationResult {
  success: boolean;
  gym?: Gym;
  error?: string;
  redirectTo?: string;
}

// Gym validation errors
export enum GymErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  GYM_ALREADY_EXISTS = "GYM_ALREADY_EXISTS",
  UNAUTHORIZED = "UNAUTHORIZED",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN = "UNKNOWN",
}

export interface GymError {
  code: GymErrorCode;
  message: string;
  details?: string;
}

// Messages for i18n
export const GymMessages = {
  en: {
    GYM_ALREADY_EXISTS: "You already have a gym registered",
    UNAUTHORIZED: "You are not authorized to create a gym",
    VALIDATION_ERROR: "Please check your input",
    NETWORK_ERROR: "Network error. Please try again",
    UNKNOWN: "An unexpected error occurred",
    GYM_CREATED_SUCCESS: "Gym created successfully!",
    GYM_UPDATED_SUCCESS: "Gym updated successfully!",
    LOADING: "Please wait...",
    CREATE_GYM: "Create Gym",
    UPDATE_GYM: "Update Gym",
    GYM_NAME_LABEL: "Gym Name",
    LOCATION_LABEL: "Location",
    EMAIL_LABEL: "Email",
    PHONE_LABEL: "Phone",
    DESCRIPTION_LABEL: "Description",
    LOGO_LABEL: "Logo",
    COVER_LABEL: "Cover Image",
    GYM_NAME_PLACEHOLDER: "e.g., FitZone Studio",
    LOCATION_PLACEHOLDER: "e.g., 123 Main St, City, State",
    EMAIL_PLACEHOLDER: "gym@example.com",
    PHONE_PLACEHOLDER: "+1 (555) 123-4567",
    DESCRIPTION_PLACEHOLDER: "Tell students about your gym...",
    GYM_NAME_REQUIRED: "Gym name is required",
    LOCATION_REQUIRED: "Location is required",
    EMAIL_REQUIRED: "Email is required",
    INVALID_EMAIL: "Please enter a valid email address",
    GYM_NAME_MIN_LENGTH: "Gym name must be at least 2 characters",
    GYM_NAME_MAX_LENGTH: "Gym name must be less than 100 characters",
    LOCATION_MIN_LENGTH: "Location must be at least 5 characters",
    LOCATION_MAX_LENGTH: "Location must be less than 200 characters",
    DESCRIPTION_MAX_LENGTH: "Description must be less than 500 characters",
  },
  pt: {
    GYM_ALREADY_EXISTS: "Já tens um ginásio registado",
    UNAUTHORIZED: "Não estás autorizado a criar um ginásio",
    VALIDATION_ERROR: "Por favor, verifica os teus dados",
    NETWORK_ERROR: "Erro de rede. Tenta novamente",
    UNKNOWN: "Ocorreu um erro inesperado",
    GYM_CREATED_SUCCESS: "Ginásio criado com sucesso!",
    GYM_UPDATED_SUCCESS: "Ginásio atualizado com sucesso!",
    LOADING: "Por favor aguarda...",
    CREATE_GYM: "Criar Ginásio",
    UPDATE_GYM: "Atualizar Ginásio",
    GYM_NAME_LABEL: "Nome do Ginásio",
    LOCATION_LABEL: "Localização",
    EMAIL_LABEL: "Email",
    PHONE_LABEL: "Telefone",
    DESCRIPTION_LABEL: "Descrição",
    LOGO_LABEL: "Logo",
    COVER_LABEL: "Imagem de Capa",
    GYM_NAME_PLACEHOLDER: "ex: FitZone Studio",
    LOCATION_PLACEHOLDER: "ex: Rua Principal 123, Cidade, Estado",
    EMAIL_PLACEHOLDER: "ginasio@exemplo.com",
    PHONE_PLACEHOLDER: "+351 123 456 789",
    DESCRIPTION_PLACEHOLDER: "Conta aos alunos sobre o teu ginásio...",
    GYM_NAME_REQUIRED: "Nome do ginásio é obrigatório",
    LOCATION_REQUIRED: "Localização é obrigatória",
    EMAIL_REQUIRED: "Email é obrigatório",
    INVALID_EMAIL: "Por favor, digite um email válido",
    GYM_NAME_MIN_LENGTH: "Nome do ginásio deve ter pelo menos 2 caracteres",
    GYM_NAME_MAX_LENGTH: "Nome do ginásio deve ter menos de 100 caracteres",
    LOCATION_MIN_LENGTH: "Localização deve ter pelo menos 5 caracteres",
    LOCATION_MAX_LENGTH: "Localização deve ter menos de 200 caracteres",
    DESCRIPTION_MAX_LENGTH: "Descrição deve ter menos de 500 caracteres",
  },
} as const;

export type GymLocale = keyof typeof GymMessages;

// Class Types (Modalities) interfaces
export interface ClassType {
  id: string;
  gym_id: string;
  name: string;
  slug: string;
  emoji?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateClassTypeData {
  name: string;
  emoji?: string;
  is_active?: boolean;
}

export interface UpdateClassTypeData {
  name?: string;
  emoji?: string;
  is_active?: boolean;
}

// Class Types messages for i18n
export const ClassTypeMessages = {
  en: {
    CLASS_TYPE_CREATED_SUCCESS: "Class type created successfully!",
    CLASS_TYPE_UPDATED_SUCCESS: "Class type updated successfully!",
    CLASS_TYPE_DELETED_SUCCESS: "Class type deleted successfully!",
    CLASS_TYPE_ACTIVATED: "Class type activated",
    CLASS_TYPE_DEACTIVATED: "Class type deactivated",
    CLASS_TYPE_NAME_REQUIRED: "Class type name is required",
    CLASS_TYPE_NAME_DUPLICATE: "A class type with this name already exists",
    CLASS_TYPE_IN_USE: "Cannot delete class type that is being used",
    LOADING: "Loading...",
    CREATE_CLASS_TYPE: "Create Class Type",
    UPDATE_CLASS_TYPE: "Update Class Type",
    DELETE_CLASS_TYPE: "Delete Class Type",
    CLASS_TYPE_NAME_LABEL: "Class Type Name",
    EMOJI_LABEL: "Emoji",
    COLOR_LABEL: "Color",
    IS_ACTIVE_LABEL: "Active",
    CLASS_TYPE_NAME_PLACEHOLDER: "e.g., Yoga, Pilates, CrossFit",
    EMOJI_PLACEHOLDER: "🧘",
    CLASS_TYPE_NAME_MIN_LENGTH: "Class type name must be at least 2 characters",
    CLASS_TYPE_NAME_MAX_LENGTH:
      "Class type name must be less than 50 characters",
  },
  pt: {
    CLASS_TYPE_CREATED_SUCCESS: "Modalidade criada com sucesso!",
    CLASS_TYPE_UPDATED_SUCCESS: "Modalidade atualizada com sucesso!",
    CLASS_TYPE_DELETED_SUCCESS: "Modalidade eliminada com sucesso!",
    CLASS_TYPE_ACTIVATED: "Modalidade ativada",
    CLASS_TYPE_DEACTIVATED: "Modalidade desativada",
    CLASS_TYPE_NAME_REQUIRED: "Nome da modalidade é obrigatório",
    CLASS_TYPE_NAME_DUPLICATE: "Já existe uma modalidade com este nome",
    CLASS_TYPE_IN_USE:
      "Não é possível eliminar modalidade que está a ser usada",
    LOADING: "A carregar...",
    CREATE_CLASS_TYPE: "Criar Modalidade",
    UPDATE_CLASS_TYPE: "Atualizar Modalidade",
    DELETE_CLASS_TYPE: "Eliminar Modalidade",
    CLASS_TYPE_NAME_LABEL: "Nome da Modalidade",
    EMOJI_LABEL: "Emoji",
    COLOR_LABEL: "Cor",
    IS_ACTIVE_LABEL: "Ativa",
    CLASS_TYPE_NAME_PLACEHOLDER: "ex: Yoga, Pilates, CrossFit",
    EMOJI_PLACEHOLDER: "🧘",
    CLASS_TYPE_NAME_MIN_LENGTH:
      "Nome da modalidade deve ter pelo menos 2 caracteres",
    CLASS_TYPE_NAME_MAX_LENGTH:
      "Nome da modalidade deve ter menos de 50 caracteres",
  },
} as const;

export type ClassTypeLocale = keyof typeof ClassTypeMessages;

// Schedule Slots interfaces
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

export interface CreateScheduleSlotData {
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

export interface UpdateScheduleSlotData {
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

// Classes and Bookings interfaces
export interface Class {
  id: string;
  gym_id: string;
  schedule_slot_id: string;
  date: string;
  start_time: string;
  end_time: string;
  class_type_id: string;
  capacity: number;
  instructor?: string;
  status: "scheduled" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
  class_type?: {
    id: string;
    name: string;
    emoji?: string;
  };
  schedule_slot?: ScheduleSlot;
}

export interface Booking {
  id: string;
  gym_id: string;
  class_id: string;
  user_id?: string;
  participant_type: "student" | "guest";
  booking_origin: "student" | "owner";
  guest_name?: string;
  guest_email?: string;
  status: "confirmed" | "waitlist" | "cancelled";
  created_at: string;
  updated_at: string;
  class?: Class;
}

export interface CreateBookingData {
  class_id: string;
  participant_type: "student" | "guest";
  guest_name?: string;
  guest_email?: string;
}

// Class availability interface
export interface ClassAvailability {
  class_id: string;
  gym_id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  instructor?: string;
  class_type_name: string;
  class_type_emoji?: string;
  confirmed_bookings: number;
  waitlist_bookings: number;
  available_spots: number;
  availability_status: "available" | "waitlist" | "full";
}

// Schedule Slots messages for i18n
export const ScheduleSlotMessages = {
  en: {
    SLOT_CREATED_SUCCESS: "Schedule slot created successfully!",
    SLOT_UPDATED_SUCCESS: "Schedule slot updated successfully!",
    SLOT_DELETED_SUCCESS: "Schedule slot deleted successfully!",
    SLOT_ACTIVATED: "Schedule slot activated",
    SLOT_DEACTIVATED: "Schedule slot deactivated",
    SLOT_NAME_REQUIRED: "Schedule slot name is required",
    SLOT_TIME_REQUIRED: "Start time is required",
    SLOT_DURATION_REQUIRED: "Duration is required",
    SLOT_CAPACITY_REQUIRED: "Capacity is required",
    SLOT_DAY_REQUIRED: "Day of week is required",
    SLOT_IN_USE: "Cannot delete slot that is being used",
    LOADING: "Loading...",
    CREATE_SLOT: "Create Schedule Slot",
    UPDATE_SLOT: "Update Schedule Slot",
    DELETE_SLOT: "Delete Schedule Slot",
    DAY_OF_WEEK_LABEL: "Day of Week",
    START_TIME_LABEL: "Start Time",
    DURATION_LABEL: "Duration (minutes)",
    CAPACITY_LABEL: "Capacity",
    INSTRUCTOR_LABEL: "Instructor",
    IS_RECURRING_LABEL: "Recurring",
    RECURRENCE_PATTERN_LABEL: "Recurrence Pattern",
    IS_ACTIVE_LABEL: "Active",
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
    SLOT_ACTIVATED: "Horário ativado",
    SLOT_DEACTIVATED: "Horário desativado",
    SLOT_NAME_REQUIRED: "Nome do horário é obrigatório",
    SLOT_TIME_REQUIRED: "Hora de início é obrigatória",
    SLOT_DURATION_REQUIRED: "Duração é obrigatória",
    SLOT_CAPACITY_REQUIRED: "Capacidade é obrigatória",
    SLOT_DAY_REQUIRED: "Dia da semana é obrigatório",
    SLOT_IN_USE: "Não é possível eliminar horário que está a ser usado",
    LOADING: "A carregar...",
    CREATE_SLOT: "Criar Horário",
    UPDATE_SLOT: "Atualizar Horário",
    DELETE_SLOT: "Eliminar Horário",
    DAY_OF_WEEK_LABEL: "Dia da Semana",
    START_TIME_LABEL: "Hora de Início",
    DURATION_LABEL: "Duração (minutos)",
    CAPACITY_LABEL: "Capacidade",
    INSTRUCTOR_LABEL: "Instrutor",
    IS_RECURRING_LABEL: "Recorrente",
    RECURRENCE_PATTERN_LABEL: "Padrão de Recorrência",
    IS_ACTIVE_LABEL: "Ativo",
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

export type ScheduleSlotLocale = keyof typeof ScheduleSlotMessages;

// Classes and Bookings messages for i18n
export const ClassMessages = {
  en: {
    CLASS_BOOKED_SUCCESS: "Class booked successfully!",
    CLASS_CANCELLED_SUCCESS: "Class booking cancelled successfully!",
    CLASS_FULL: "Class is full",
    CLASS_FULL_WAITLIST_DISABLED: "Class is full and waitlist is not enabled",
    BOOKING_CONFLICT: "You have a conflicting class booking",
    ALREADY_BOOKED: "You have already booked this class",
    CANNOT_CANCEL: "Cannot cancel booking",
    CANCEL_LIMIT_REACHED: "Must cancel at least {hours} hours before class",
    LOADING: "Loading...",
    BOOK_CLASS: "Book Class",
    JOIN_WAITLIST: "Join Waitlist",
    BOOKED: "Booked",
    WAITLISTED: "Waitlisted",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
    CANNOT_BOOK: "Cannot Book",
    BOOKING: "Booking...",
    BOOKING_IN_PROGRESS: "Booking in progress...",
    NO_CLASSES_AVAILABLE: "No Classes Available",
    NO_CLASSES_FOUND: "No Classes Found",
    NO_CLASSES_SCHEDULED: "No classes scheduled for this day",
    STUDIO_NO_SCHEDULE:
      "This studio hasn't set up their class schedule yet. Check back later!",
    NO_CLASSES_MATCH_FILTERS:
      "No classes match your current filters. Try adjusting your search criteria.",
    GENERATE_CLASSES_SUCCESS: "Classes generated successfully!",
    GENERATE_CLASSES_ERROR: "Error generating classes",
    CLASS_STATUS_SCHEDULED: "Scheduled",
    CLASS_STATUS_CANCELLED: "Cancelled",
    CLASS_STATUS_COMPLETED: "Completed",
  },
  pt: {
    CLASS_BOOKED_SUCCESS: "Aula reservada com sucesso!",
    CLASS_CANCELLED_SUCCESS: "Reserva de aula cancelada com sucesso!",
    CLASS_FULL: "Aula está cheia",
    CLASS_FULL_WAITLIST_DISABLED:
      "Aula está cheia e lista de espera não está ativada",
    BOOKING_CONFLICT: "Tens uma aula conflituosa",
    ALREADY_BOOKED: "Já reservaste esta aula",
    CANNOT_CANCEL: "Não é possível cancelar a reserva",
    CANCEL_LIMIT_REACHED:
      "Deves cancelar pelo menos {hours} horas antes da aula",
    LOADING: "A carregar...",
    BOOK_CLASS: "Reservar Aula",
    JOIN_WAITLIST: "Entrar na Lista de Espera",
    BOOKED: "Reservado",
    WAITLISTED: "Lista de Espera",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
    COMPLETED: "Concluído",
    CANNOT_BOOK: "Não é Possível Reservar",
    BOOKING: "A reservar...",
    BOOKING_IN_PROGRESS: "A reservar...",
    NO_CLASSES_AVAILABLE: "Nenhuma Aula Disponível",
    NO_CLASSES_FOUND: "Nenhuma Aula Encontrada",
    NO_CLASSES_SCHEDULED: "Nenhuma aula agendada para este dia",
    STUDIO_NO_SCHEDULE:
      "Este estúdio ainda não configurou o horário das aulas. Volta mais tarde!",
    NO_CLASSES_MATCH_FILTERS:
      "Nenhuma aula corresponde aos teus filtros atuais. Tenta ajustar os critérios de pesquisa.",
    GENERATE_CLASSES_SUCCESS: "Aulas geradas com sucesso!",
    GENERATE_CLASSES_ERROR: "Erro ao gerar aulas",
    CLASS_STATUS_SCHEDULED: "Agendada",
    CLASS_STATUS_CANCELLED: "Cancelada",
    CLASS_STATUS_COMPLETED: "Concluída",
  },
} as const;

export type ClassLocale = keyof typeof ClassMessages;
