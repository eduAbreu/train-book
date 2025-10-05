/**
 * Owner Settings related types
 */

export interface GymFormData {
  name: string;
  location: string;
  email: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
}

export interface GymSettingsFormData {
  allow_waitlist: boolean;
  cancel_limit_hours: number;
}

export interface UpdateGymResult {
  success: boolean;
  error?: string;
  gym?: any;
}

export interface CloseGymResult {
  success: boolean;
  error?: string;
}

// Messages for i18n
export const OwnerSettingsMessages = {
  en: {
    // Success messages
    SETTINGS_SAVED_SUCCESS: "Settings saved successfully",
    GYM_CLOSED_SUCCESS:
      "Gym closed successfully. All students have been unlinked.",
    CHANGES_REVERTED: "All unsaved changes have been discarded",

    // Error messages
    SAVE_FAILED: "Failed to save settings",
    SAVE_FAILED_RETRY: "Failed to save settings. Please try again.",
    CLOSE_GYM_FAILED: "Failed to close gym",
    CLOSE_GYM_FAILED_RETRY: "Failed to close gym. Please try again.",
    VALIDATION_ERROR: "Please fill in all required fields",

    // UI Labels
    SETTINGS_TITLE: "Settings",
    STUDIO_INFORMATION: "Studio Information",
    STUDIO_INFORMATION_DESC:
      "Update your studio details and contact information",
    CLOSE_GYM: "Close Gym",
    CLOSE_GYM_DESC: "Permanent action that closes the gym and removes all data",
    CONFIRM_CLOSURE: "Confirm Closure",
    CONFIRM_CLOSURE_DESC: "Are you sure you want to permanently close the gym",

    // Form labels
    STUDIO_NAME_LABEL: "Studio Name",
    LOCATION_LABEL: "Location",
    EMAIL_LABEL: "Email",
    PHONE_LABEL: "Phone",
    DESCRIPTION_LABEL: "Description",
    STUDIO_LOGO_LABEL: "Studio Logo",

    // Form placeholders
    STUDIO_NAME_PLACEHOLDER: "Enter studio name",
    LOCATION_PLACEHOLDER: "Enter studio location",
    EMAIL_PLACEHOLDER: "Enter contact email",
    PHONE_PLACEHOLDER: "Enter phone number",
    DESCRIPTION_PLACEHOLDER: "Describe your studio...",

    // Action buttons
    SAVE_CHANGES: "Save Changes",
    SAVING: "Saving...",
    REVERT_CHANGES: "Revert Changes",
    CLOSE_GYM_NOW: "Close Gym Now",
    CLOSING: "Closing...",
    CANCEL: "Cancel",
    LOGOUT: "Logout",

    // Status messages
    UNSAVED_CHANGES: "You have unsaved changes",
    ALL_CHANGES_SAVED: "All changes saved",

    // Close gym warnings
    CLOSE_GYM_WARNING_TITLE: "This action will:",
    CLOSE_GYM_WARNING_1: "Disassociate you as the gym owner",
    CLOSE_GYM_WARNING_2: "Cancel all future bookings for the gym",
    CLOSE_GYM_WARNING_3: "Unlink all students (lose access)",
    CLOSE_GYM_WARNING_4:
      "Archive/clear gym data (templates, plans, notifications)",
    CLOSE_GYM_WARNING_5: "Redirect to create a new gym",
    IRREVERSIBLE_WARNING:
      "This action is irreversible. All data will be permanently lost.",

    // Consequences checklist
    CONSEQUENCES_CHECKLIST: "Consequences checklist:",
    CONSEQUENCE_1: "I lose access to all owner functionalities",
    CONSEQUENCE_2: "All future bookings are automatically cancelled",
    CONSEQUENCE_3: "All students are unlinked and lose access",
    CONSEQUENCE_4: "Templates, plans and notifications are removed",
    CONSEQUENCE_5: "Gym data is archived/cleared",
    UNDERSTAND_CONSEQUENCES:
      "I understand the consequences and want to continue",

    // Loading and error states
    LOADING_SETTINGS: "Loading settings...",
    ACCESS_DENIED: "Access Denied",
    ACCESS_DENIED_DESC:
      "You must be an authenticated gym owner to view this page.",
    NO_GYM_FOUND: "No Gym Found",
    NO_GYM_FOUND_DESC: "Please set up your gym first.",
    SET_UP_GYM: "Set Up Gym",
  },
  pt: {
    // Success messages
    SETTINGS_SAVED_SUCCESS: "Configurações salvas com sucesso",
    GYM_CLOSED_SUCCESS:
      "Ginásio encerrado com sucesso. Todos os alunos foram desvinculados.",
    CHANGES_REVERTED: "Todas as alterações não salvas foram descartadas",

    // Error messages
    SAVE_FAILED: "Falha ao salvar configurações",
    SAVE_FAILED_RETRY: "Falha ao salvar configurações. Tente novamente.",
    CLOSE_GYM_FAILED: "Falha ao encerrar ginásio",
    CLOSE_GYM_FAILED_RETRY: "Falha ao encerrar ginásio. Tente novamente.",
    VALIDATION_ERROR: "Por favor, preencha todos os campos obrigatórios",

    // UI Labels
    SETTINGS_TITLE: "Configurações",
    STUDIO_INFORMATION: "Informações do Estúdio",
    STUDIO_INFORMATION_DESC:
      "Atualize os detalhes e informações de contacto do seu estúdio",
    CLOSE_GYM: "Encerrar Ginásio",
    CLOSE_GYM_DESC:
      "Ação permanente que encerra o ginásio e remove todos os dados",
    CONFIRM_CLOSURE: "Confirmar Encerramento",
    CONFIRM_CLOSURE_DESC:
      "Tem a certeza que pretende encerrar permanentemente o ginásio",

    // Form labels
    STUDIO_NAME_LABEL: "Nome do Estúdio",
    LOCATION_LABEL: "Localização",
    EMAIL_LABEL: "Email",
    PHONE_LABEL: "Telefone",
    DESCRIPTION_LABEL: "Descrição",
    STUDIO_LOGO_LABEL: "Logo do Estúdio",

    // Form placeholders
    STUDIO_NAME_PLACEHOLDER: "Digite o nome do estúdio",
    LOCATION_PLACEHOLDER: "Digite a localização do estúdio",
    EMAIL_PLACEHOLDER: "Digite o email de contacto",
    PHONE_PLACEHOLDER: "Digite o número de telefone",
    DESCRIPTION_PLACEHOLDER: "Descreva o seu estúdio...",

    // Action buttons
    SAVE_CHANGES: "Salvar Alterações",
    SAVING: "Salvando...",
    REVERT_CHANGES: "Reverter Alterações",
    CLOSE_GYM_NOW: "Encerrar Ginásio Agora",
    CLOSING: "Encerrando...",
    CANCEL: "Cancelar",
    LOGOUT: "Sair",

    // Status messages
    UNSAVED_CHANGES: "Tem alterações não salvas",
    ALL_CHANGES_SAVED: "Todas as alterações salvas",

    // Close gym warnings
    CLOSE_GYM_WARNING_TITLE: "Esta ação irá:",
    CLOSE_GYM_WARNING_1: "Desassociar-se como proprietário do ginásio",
    CLOSE_GYM_WARNING_2: "Cancelar todas as reservas futuras do ginásio",
    CLOSE_GYM_WARNING_3: "Desvincular todos os alunos (perdem acesso)",
    CLOSE_GYM_WARNING_4:
      "Arquivar/limpar dados do ginásio (templates, planos, notificações)",
    CLOSE_GYM_WARNING_5: "Redirecionar para criação de novo ginásio",
    IRREVERSIBLE_WARNING:
      "Esta ação é irreversível. Todos os dados serão perdidos permanentemente.",

    // Consequences checklist
    CONSEQUENCES_CHECKLIST: "Checklist de consequências:",
    CONSEQUENCE_1: "Perco acesso a todas as funcionalidades de proprietário",
    CONSEQUENCE_2: "Todas as reservas futuras são canceladas automaticamente",
    CONSEQUENCE_3: "Todos os alunos são desvinculados e perdem acesso",
    CONSEQUENCE_4: "Templates, planos e notificações são removidos",
    CONSEQUENCE_5: "Dados do ginásio são arquivados/limpos",
    UNDERSTAND_CONSEQUENCES: "Compreendo as consequências e pretendo continuar",

    // Loading and error states
    LOADING_SETTINGS: "Carregando configurações...",
    ACCESS_DENIED: "Acesso Negado",
    ACCESS_DENIED_DESC:
      "Deve ser um proprietário de ginásio autenticado para ver esta página.",
    NO_GYM_FOUND: "Nenhum Ginásio Encontrado",
    NO_GYM_FOUND_DESC: "Por favor, configure o seu ginásio primeiro.",
    SET_UP_GYM: "Configurar Ginásio",
  },
} as const;

export type OwnerSettingsLocale = keyof typeof OwnerSettingsMessages;
