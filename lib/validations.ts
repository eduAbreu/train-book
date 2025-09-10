// Train Book - Validation Schemas using Zod

import { z } from "zod";
import {
  REGEX_PATTERNS,
  BOOKING_LIMITS,
  CAPACITY_LIMITS,
  PLAN_LIMITS,
} from "./constants";

// Common schemas
export const emailSchema = z.string().email("Invalid email address");
export const phoneSchema = z
  .string()
  .regex(REGEX_PATTERNS.PHONE, "Invalid phone number")
  .optional()
  .or(z.literal(""));
export const slugSchema = z
  .string()
  .regex(
    REGEX_PATTERNS.SLUG,
    "Invalid slug format (use lowercase letters, numbers, and hyphens)"
  );
export const timeSchema = z
  .string()
  .regex(REGEX_PATTERNS.TIME, "Invalid time format (HH:MM)");
export const colorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, "Invalid color format (hex)");
export const uuidSchema = z.string().uuid("Invalid UUID format");

// Profile schemas
export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: emailSchema.optional(),
});

export const onboardingSchema = z.object({
  role: z.enum(["owner", "student"], {
    required_error: "Please select a role",
  }),
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  gym_code: z.string().optional(), // For students joining existing gym
});

// Gym schemas
export const gymCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Gym name must be at least 2 characters")
    .max(100, "Gym name must be less than 100 characters"),
  location: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  logo_url: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  cover_url: z.string().url("Invalid cover URL").optional().or(z.literal("")),
});

export const gymUpdateSchema = gymCreateSchema.partial();

export const gymSettingsSchema = z.object({
  allow_waitlist: z.boolean(),
  cancel_limit_hours: z
    .number()
    .min(
      BOOKING_LIMITS.MIN_CANCEL_HOURS,
      `Minimum ${BOOKING_LIMITS.MIN_CANCEL_HOURS} hours`
    )
    .max(
      BOOKING_LIMITS.MAX_CANCEL_HOURS,
      `Maximum ${BOOKING_LIMITS.MAX_CANCEL_HOURS} hours`
    ),
});

// Class type schemas
export const classTypeCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Class type name is required")
    .max(50, "Name must be less than 50 characters"),
  slug: slugSchema,
  emoji: z
    .string()
    .max(10, "Emoji must be less than 10 characters")
    .optional()
    .or(z.literal("")),
  color: colorSchema.optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export const classTypeUpdateSchema = classTypeCreateSchema
  .partial()
  .omit({ slug: true });

// Weekly template slot schemas
export const weeklySlotCreateSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], {
    required_error: "Day is required",
  }),
  start_time: timeSchema,
  duration_minutes: z
    .number()
    .min(15, "Minimum duration is 15 minutes")
    .max(480, "Maximum duration is 8 hours")
    .multipleOf(15, "Duration must be in 15-minute increments"),
  class_type_id: uuidSchema,
  capacity: z
    .number()
    .min(CAPACITY_LIMITS.MIN, `Minimum capacity is ${CAPACITY_LIMITS.MIN}`)
    .max(CAPACITY_LIMITS.MAX, `Maximum capacity is ${CAPACITY_LIMITS.MAX}`),
  instructor: z
    .string()
    .max(100, "Instructor name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

export const weeklySlotUpdateSchema = weeklySlotCreateSchema.partial();

export const bulkSlotCreateSchema = z.object({
  slot: weeklySlotCreateSchema.omit({ day: true }),
  days: z
    .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .min(1, "At least one day must be selected"),
  mode: z.enum(["skip", "replace"]).default("skip"),
});

// Class schemas
export const classCreateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  start_time: timeSchema,
  end_time: timeSchema,
  class_type_id: uuidSchema,
  capacity: z
    .number()
    .min(CAPACITY_LIMITS.MIN, `Minimum capacity is ${CAPACITY_LIMITS.MIN}`)
    .max(CAPACITY_LIMITS.MAX, `Maximum capacity is ${CAPACITY_LIMITS.MAX}`),
  instructor: z
    .string()
    .max(100, "Instructor name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
});

export const classUpdateSchema = classCreateSchema.partial();

export const generateClassesSchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format (YYYY-MM-DD)"),
  })
  .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Start date must be before or equal to end date",
    path: ["end_date"],
  });

// Booking schemas
export const studentBookingSchema = z.object({
  class_id: uuidSchema,
  participant: z.literal("student"),
  origin: z.literal("student"),
  options: z
    .object({
      ignore_plan_limit: z.boolean().default(false),
      force_confirmed: z.boolean().default(false),
    })
    .optional(),
});

export const guestBookingSchema = z.object({
  class_id: uuidSchema,
  participant: z.literal("guest"),
  origin: z.literal("owner"),
  guest_name: z
    .string()
    .min(1, "Guest name is required")
    .max(100, "Guest name must be less than 100 characters"),
  guest_email: emailSchema,
  options: z
    .object({
      force_confirmed: z.boolean().default(false),
    })
    .optional(),
});

export const ownerStudentBookingSchema = z.object({
  class_id: uuidSchema,
  participant: z.literal("student"),
  origin: z.literal("owner"),
  user_id: uuidSchema,
  options: z
    .object({
      ignore_plan_limit: z.boolean().default(true),
      force_confirmed: z.boolean().default(false),
    })
    .optional(),
});

export const bookingRequestSchema = z.discriminatedUnion("participant", [
  studentBookingSchema,
  guestBookingSchema,
  ownerStudentBookingSchema,
]);

// Plan schemas
export const planCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Plan name is required")
    .max(100, "Plan name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  weekly_limit: z
    .number()
    .min(
      PLAN_LIMITS.MIN_WEEKLY_LIMIT,
      `Minimum weekly limit is ${PLAN_LIMITS.MIN_WEEKLY_LIMIT}`
    )
    .max(
      PLAN_LIMITS.MAX_WEEKLY_LIMIT,
      `Maximum weekly limit is ${PLAN_LIMITS.MAX_WEEKLY_LIMIT}`
    )
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

export const planUpdateSchema = planCreateSchema.partial();

export const studentPlanAssignSchema = z.object({
  student_id: uuidSchema,
  plan_id: uuidSchema,
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

// Filter schemas
export const classFiltersSchema = z
  .object({
    date_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    date_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    class_type_ids: z.array(uuidSchema).optional(),
    status: z.array(z.enum(["confirmed", "waitlist"])).optional(),
    instructor: z.string().optional(),
    available_only: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.date_from && data.date_to) {
        return new Date(data.date_from) <= new Date(data.date_to);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["date_to"],
    }
  );

export const bookingFiltersSchema = z
  .object({
    date_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    date_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    class_type_ids: z.array(uuidSchema).optional(),
    status: z.array(z.enum(["confirmed", "waitlist"])).optional(),
    participant: z.array(z.enum(["student", "guest"])).optional(),
    user_id: uuidSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.date_from && data.date_to) {
        return new Date(data.date_from) <= new Date(data.date_to);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["date_to"],
    }
  );

export const studentFiltersSchema = z.object({
  search: z.string().optional(),
  plan_id: uuidSchema.optional(),
  active_only: z.boolean().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, "Page must be at least 1").default(1),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

// File upload schemas
export const fileUploadSchema = z
  .object({
    file: z.instanceof(File, { message: "File is required" }),
    type: z.enum(["logo", "cover"], {
      required_error: "File type is required",
    }),
  })
  .refine(
    (data) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      return allowedTypes.includes(data.file.type);
    },
    {
      message: "File must be a JPEG, PNG, or WebP image",
      path: ["file"],
    }
  )
  .refine(
    (data) => {
      const maxSize = data.type === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB for logo, 5MB for cover
      return data.file.size <= maxSize;
    },
    {
      message: "File size is too large",
      path: ["file"],
    }
  );

// Search schema
export const searchSchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must be less than 100 characters"),
  type: z.enum(["gyms", "classes", "students"]).optional(),
  filters: z.record(z.any()).optional(),
});

// Notification schema
export const notificationUpdateSchema = z.object({
  is_read: z.boolean(),
});

// Analytics schemas
export const analyticsDateRangeSchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format (YYYY-MM-DD)"),
  })
  .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Start date must be before or equal to end date",
    path: ["end_date"],
  });

// Export all schema types for TypeScript inference
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type GymCreateInput = z.infer<typeof gymCreateSchema>;
export type GymUpdateInput = z.infer<typeof gymUpdateSchema>;
export type GymSettingsInput = z.infer<typeof gymSettingsSchema>;
export type ClassTypeCreateInput = z.infer<typeof classTypeCreateSchema>;
export type ClassTypeUpdateInput = z.infer<typeof classTypeUpdateSchema>;
export type WeeklySlotCreateInput = z.infer<typeof weeklySlotCreateSchema>;
export type WeeklySlotUpdateInput = z.infer<typeof weeklySlotUpdateSchema>;
export type BulkSlotCreateInput = z.infer<typeof bulkSlotCreateSchema>;
export type ClassCreateInput = z.infer<typeof classCreateSchema>;
export type ClassUpdateInput = z.infer<typeof classUpdateSchema>;
export type GenerateClassesInput = z.infer<typeof generateClassesSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;
export type StudentPlanAssignInput = z.infer<typeof studentPlanAssignSchema>;
export type ClassFiltersInput = z.infer<typeof classFiltersSchema>;
export type BookingFiltersInput = z.infer<typeof bookingFiltersSchema>;
export type StudentFiltersInput = z.infer<typeof studentFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;
export type AnalyticsDateRangeInput = z.infer<typeof analyticsDateRangeSchema>;
