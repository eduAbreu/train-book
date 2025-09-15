/**
 * Validation schemas using Zod for TrainBook
 */

import { z } from "zod";
import { AuthMessages, Locale } from "@/types/auth";

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

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

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
