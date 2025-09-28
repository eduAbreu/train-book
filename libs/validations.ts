/**
 * Validation schemas using Zod for TrainBook
 */

import { z } from "zod";
import { AuthMessages, Locale } from "@/types/auth";
import { GymMessages, GymLocale } from "@/types/gym";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters");

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  );

// Sign up validation schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: nameSchema,
});

// Sign in validation schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Gym validation schemas
export const gymNameSchema = z
  .string()
  .min(1, "Gym name is required")
  .min(2, "Gym name must be at least 2 characters")
  .max(100, "Gym name must be less than 100 characters");

export const locationSchema = z
  .string()
  .min(1, "Location is required")
  .min(5, "Location must be at least 5 characters")
  .max(200, "Location must be less than 200 characters");

export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) =>
      !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, "")),
    "Please enter a valid phone number"
  );

export const descriptionSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || val.length <= 500,
    "Description must be less than 500 characters"
  );

// Gym creation validation schema
export const createGymSchema = z.object({
  name: gymNameSchema,
  location: locationSchema,
  email: emailSchema,
  phone: phoneSchema,
  description: descriptionSchema,
});

// Gym update validation schema
export const updateGymSchema = z.object({
  name: gymNameSchema.optional(),
  location: locationSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  description: descriptionSchema,
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateGymInput = z.infer<typeof createGymSchema>;
export type UpdateGymInput = z.infer<typeof updateGymSchema>;

// Validation helper functions
export function validateSignUp(data: unknown): {
  success: boolean;
  data?: SignUpInput;
  error?: string;
} {
  try {
    const validatedData = signUpSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
}

export function validateSignIn(data: unknown): {
  success: boolean;
  data?: SignInInput;
  error?: string;
} {
  try {
    const validatedData = signInSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
}

// Localized validation messages
export function getLocalizedValidationError(
  error: string,
  locale: Locale = "en"
): string {
  const messages = AuthMessages[locale];

  // Map common validation errors to localized messages
  if (
    error.includes("Email is required") ||
    error.includes("Email é obrigatório")
  ) {
    return messages.EMAIL_REQUIRED;
  }
  if (
    error.includes("Password is required") ||
    error.includes("Senha é obrigatória")
  ) {
    return messages.PASSWORD_REQUIRED;
  }
  if (
    error.includes("Name is required") ||
    error.includes("Nome é obrigatório")
  ) {
    return messages.NAME_REQUIRED;
  }
  if (
    error.includes("at least 8 characters") ||
    error.includes("pelo menos 8 caracteres")
  ) {
    return messages.PASSWORD_MIN_LENGTH;
  }
  if (error.includes("valid email") || error.includes("email válido")) {
    return messages.INVALID_EMAIL;
  }

  return error; // Return original error if no mapping found
}

// Gym validation helper functions
export function validateCreateGym(data: unknown): {
  success: boolean;
  data?: CreateGymInput;
  error?: string;
} {
  try {
    const validatedData = createGymSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
}

export function validateUpdateGym(data: unknown): {
  success: boolean;
  data?: UpdateGymInput;
  error?: string;
} {
  try {
    const validatedData = updateGymSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: "Validation failed" };
  }
}

// Localized gym validation messages
export function getLocalizedGymValidationError(
  error: string,
  locale: GymLocale = "en"
): string {
  const messages = GymMessages[locale];

  // Map common validation errors to localized messages
  if (
    error.includes("Gym name is required") ||
    error.includes("Nome do ginásio é obrigatório")
  ) {
    return messages.GYM_NAME_REQUIRED;
  }
  if (
    error.includes("Location is required") ||
    error.includes("Localização é obrigatória")
  ) {
    return messages.LOCATION_REQUIRED;
  }
  if (
    error.includes("Email is required") ||
    error.includes("Email é obrigatório")
  ) {
    return messages.EMAIL_REQUIRED;
  }
  if (
    error.includes("at least 2 characters") ||
    error.includes("pelo menos 2 caracteres")
  ) {
    return messages.GYM_NAME_MIN_LENGTH;
  }
  if (
    error.includes("less than 100 characters") ||
    error.includes("menos de 100 caracteres")
  ) {
    return messages.GYM_NAME_MAX_LENGTH;
  }
  if (
    error.includes("at least 5 characters") ||
    error.includes("pelo menos 5 caracteres")
  ) {
    return messages.LOCATION_MIN_LENGTH;
  }
  if (
    error.includes("less than 200 characters") ||
    error.includes("menos de 200 caracteres")
  ) {
    return messages.LOCATION_MAX_LENGTH;
  }
  if (
    error.includes("less than 500 characters") ||
    error.includes("menos de 500 caracteres")
  ) {
    return messages.DESCRIPTION_MAX_LENGTH;
  }
  if (error.includes("valid email") || error.includes("email válido")) {
    return messages.INVALID_EMAIL;
  }

  return error; // Return original error if no mapping found
}
