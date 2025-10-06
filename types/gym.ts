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
