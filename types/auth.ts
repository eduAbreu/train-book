/**
 * Authentication types for TrainBook
 */

export type UserRole = "owner" | "student";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  gym_id?: string;
  onboarding_completed: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  redirectTo?: string;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EMAIL_IN_USE = "EMAIL_IN_USE",
  ROLE_CONFLICT = "ROLE_CONFLICT",
  UNKNOWN = "UNKNOWN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: string;
}

export interface AuthFormState {
  isSubmitting: boolean;
  error?: string;
  success?: string;
}

// Messages for i18n
export const AuthMessages = {
  en: {
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_IN_USE: "An account with this email already exists",
    ROLE_CONFLICT: "Role conflict detected",
    UNKNOWN: "An unexpected error occurred",
    VALIDATION_ERROR: "Please check your input",
    NETWORK_ERROR: "Network error. Please try again",
    SIGNUP_SUCCESS: "Account created successfully",
    SIGNIN_SUCCESS: "Signed in successfully",
    LOADING: "Please wait...",
    CONTINUE_WITH_EMAIL: "Continue with Email",
    CREATE_ACCOUNT: "Create Account",
    SIGN_IN: "Sign In",
    EMAIL_PLACEHOLDER: "your@email.com",
    PASSWORD_PLACEHOLDER: "Enter your password",
    NAME_PLACEHOLDER: "Your full name",
    EMAIL_LABEL: "Email",
    PASSWORD_LABEL: "Password",
    NAME_LABEL: "Full Name",
    EMAIL_REQUIRED: "Email is required",
    PASSWORD_REQUIRED: "Password is required",
    NAME_REQUIRED: "Name is required",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
    INVALID_EMAIL: "Please enter a valid email address",
  },
  pt: {
    INVALID_CREDENTIALS: "Email ou password inválidos",
    EMAIL_IN_USE: "Já existe uma conta com este email",
    ROLE_CONFLICT: "Conflito de papel detectado",
    UNKNOWN: "Ocorreu um erro inesperado",
    VALIDATION_ERROR: "Por favor, verifique os seus dados",
    NETWORK_ERROR: "Erro de rede. Tente novamente",
    SIGNUP_SUCCESS: "Conta criada com sucesso",
    SIGNIN_SUCCESS: "Login realizado com sucesso",
    LOADING: "Por favor aguarde...",
    CONTINUE_WITH_EMAIL: "Continuar com Email",
    CREATE_ACCOUNT: "Criar Conta",
    SIGN_IN: "Entrar",
    EMAIL_PLACEHOLDER: "seu@email.com",
    PASSWORD_PLACEHOLDER: "Digite sua senha",
    NAME_PLACEHOLDER: "Seu nome completo",
    EMAIL_LABEL: "Email",
    PASSWORD_LABEL: "Senha",
    NAME_LABEL: "Nome Completo",
    EMAIL_REQUIRED: "Email é obrigatório",
    PASSWORD_REQUIRED: "Senha é obrigatória",
    NAME_REQUIRED: "Nome é obrigatório",
    PASSWORD_MIN_LENGTH: "Senha deve ter pelo menos 8 caracteres",
    INVALID_EMAIL: "Por favor, digite um email válido",
  },
} as const;

export type Locale = keyof typeof AuthMessages;
