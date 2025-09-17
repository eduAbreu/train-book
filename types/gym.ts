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
