// Train Book - Application Constants

import type { DayOfWeekInfo, ColorOption, EmojiOption } from "@/types/gym";
import type { DayOfWeek } from "@/types/database";

// Days of the week configuration
export const DAYS_OF_WEEK: DayOfWeekInfo[] = [
  { key: "Mon", label: "Monday", short: "Mon", index: 1 },
  { key: "Tue", label: "Tuesday", short: "Tue", index: 2 },
  { key: "Wed", label: "Wednesday", short: "Wed", index: 3 },
  { key: "Thu", label: "Thursday", short: "Thu", index: 4 },
  { key: "Fri", label: "Friday", short: "Fri", index: 5 },
  { key: "Sat", label: "Saturday", short: "Sat", index: 6 },
  { key: "Sun", label: "Sunday", short: "Sun", index: 0 },
] as const;

export const DAYS_OF_WEEK_MAP = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day.key] = day;
  return acc;
}, {} as Record<DayOfWeek, DayOfWeekInfo>);

// Time configuration
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 75, label: "1 hour 15 minutes" },
  { value: 90, label: "1 hour 30 minutes" },
  { value: 120, label: "2 hours" },
] as const;

// Class type colors
export const CLASS_TYPE_COLORS: ColorOption[] = [
  { name: "Red", value: "#ef4444", class: "bg-red-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Amber", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Yellow", value: "#eab308", class: "bg-yellow-500" },
  { name: "Lime", value: "#84cc16", class: "bg-lime-500" },
  { name: "Green", value: "#22c55e", class: "bg-green-500" },
  { name: "Emerald", value: "#10b981", class: "bg-emerald-500" },
  { name: "Teal", value: "#14b8a6", class: "bg-teal-500" },
  { name: "Cyan", value: "#06b6d4", class: "bg-cyan-500" },
  { name: "Sky", value: "#0ea5e9", class: "bg-sky-500" },
  { name: "Blue", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Violet", value: "#8b5cf6", class: "bg-violet-500" },
  { name: "Purple", value: "#a855f7", class: "bg-purple-500" },
  { name: "Fuchsia", value: "#d946ef", class: "bg-fuchsia-500" },
  { name: "Pink", value: "#ec4899", class: "bg-pink-500" },
  { name: "Rose", value: "#f43f5e", class: "bg-rose-500" },
] as const;

// Class type emojis
export const CLASS_TYPE_EMOJIS: EmojiOption[] = [
  // Strength & Weights
  { emoji: "🏋️", name: "Weight Lifting", category: "Strength" },
  { emoji: "💪", name: "Muscle", category: "Strength" },
  { emoji: "🔥", name: "Fire", category: "Strength" },

  // Cardio & Running
  { emoji: "🏃", name: "Running", category: "Cardio" },
  { emoji: "🚴", name: "Cycling", category: "Cardio" },
  { emoji: "⚡", name: "Lightning", category: "Cardio" },
  { emoji: "💨", name: "Wind", category: "Cardio" },

  // Yoga & Flexibility
  { emoji: "🧘", name: "Meditation", category: "Yoga" },
  { emoji: "🕉️", name: "Om", category: "Yoga" },
  { emoji: "🌸", name: "Cherry Blossom", category: "Yoga" },
  { emoji: "🍃", name: "Leaves", category: "Yoga" },

  // Boxing & Martial Arts
  { emoji: "🥊", name: "Boxing", category: "Combat" },
  { emoji: "🥋", name: "Martial Arts", category: "Combat" },
  { emoji: "⚔️", name: "Swords", category: "Combat" },

  // Dance & Movement
  { emoji: "💃", name: "Dancing", category: "Dance" },
  { emoji: "🕺", name: "Dancing Man", category: "Dance" },
  { emoji: "🎵", name: "Music", category: "Dance" },
  { emoji: "🎶", name: "Musical Notes", category: "Dance" },

  // Swimming & Water
  { emoji: "🏊", name: "Swimming", category: "Water" },
  { emoji: "🌊", name: "Wave", category: "Water" },
  { emoji: "💧", name: "Droplet", category: "Water" },

  // Sports
  { emoji: "⚽", name: "Soccer", category: "Sports" },
  { emoji: "🏀", name: "Basketball", category: "Sports" },
  { emoji: "🎾", name: "Tennis", category: "Sports" },
  { emoji: "🏐", name: "Volleyball", category: "Sports" },

  // General Fitness
  { emoji: "⭐", name: "Star", category: "General" },
  { emoji: "🎯", name: "Target", category: "General" },
  { emoji: "🚀", name: "Rocket", category: "General" },
  { emoji: "💎", name: "Diamond", category: "General" },
  { emoji: "🏆", name: "Trophy", category: "General" },
  { emoji: "🎖️", name: "Medal", category: "General" },
] as const;

// Booking configuration
export const BOOKING_LIMITS = {
  MAX_ADVANCE_DAYS: 30,
  MIN_CANCEL_HOURS: 2,
  MAX_CANCEL_HOURS: 72,
  DEFAULT_CANCEL_HOURS: 24,
} as const;

export const CAPACITY_LIMITS = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 20,
} as const;

// Plan configuration
export const PLAN_LIMITS = {
  MIN_WEEKLY_LIMIT: 1,
  MAX_WEEKLY_LIMIT: 50,
  DEFAULT_WEEKLY_LIMIT: 8,
} as const;

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  LOGO_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  COVER_MAX_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// Storage paths
export const STORAGE_PATHS = {
  GYM_LOGOS: "gyms/{gymId}/logo",
  GYM_COVERS: "gyms/{gymId}/cover",
} as const;

// Notification types and messages
export const NOTIFICATION_MESSAGES = {
  booked: {
    title: "Class Booked",
    confirmed: "Your class has been confirmed!",
    waitlist: "You've been added to the waitlist.",
  },
  canceled: {
    title: "Class Canceled",
    student: "You have canceled your class.",
    owner: "Your class has been canceled by the gym.",
  },
  promoted: {
    title: "Promoted from Waitlist",
    message: "Great news! You've been promoted from the waitlist.",
  },
  waitlist: {
    title: "Added to Waitlist",
    message:
      "You've been added to the waitlist. We'll notify you if a spot opens up.",
  },
  reminder: {
    title: "Class Reminder",
    day_before: "Don't forget about your class tomorrow!",
    hour_before: "Your class starts in 1 hour.",
  },
  plan_limit: {
    title: "Plan Limit Reached",
    message: "You've reached your weekly class limit.",
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
} as const;

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "MMM d, yyyy",
  INPUT: "yyyy-MM-dd",
  TIME: "HH:mm",
  DATETIME: "MMM d, yyyy HH:mm",
  FULL: "EEEE, MMMM d, yyyy",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  GYMS: "/api/gyms",
  CLASSES: "/api/classes",
  BOOKINGS: "/api/bookings",
  PLANS: "/api/plans",
  NOTIFICATIONS: "/api/notifications",
  UPLOAD: "/api/upload",
} as const;

// PWA configuration
export const PWA_CONFIG = {
  APP_NAME: "Train Book",
  APP_SHORT_NAME: "TrainBook",
  DESCRIPTION: "Modern gym management for owners and students",
  THEME_COLOR: "#570df8",
  BACKGROUND_COLOR: "#ffffff",
  DISPLAY: "standalone",
  ORIENTATION: "portrait",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  NETWORK_ERROR: "Please check your internet connection.",
  BOOKING_FULL: "This class is fully booked.",
  BOOKING_OVERLAP: "You already have a class at this time.",
  BOOKING_DUPLICATE: "You are already booked for this class.",
  BOOKING_PLAN_LIMIT: "You have reached your weekly class limit.",
  BOOKING_TOO_LATE: "Booking is no longer available for this class.",
  CANCEL_TOO_LATE: "It's too late to cancel this class.",
  GYM_INACTIVE: "This gym is no longer active.",
  STUDENT_LIMIT_REACHED: "This gym has reached its student limit.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  GYM_CREATED: "Gym created successfully!",
  GYM_UPDATED: "Gym updated successfully!",
  CLASS_BOOKED: "Class booked successfully!",
  CLASS_CANCELED: "Class canceled successfully!",
  PLAN_ASSIGNED: "Plan assigned successfully!",
  STUDENT_LINKED: "Student linked to gym successfully!",
  STUDENT_UNLINKED: "Student unlinked from gym successfully!",
  SETTINGS_UPDATED: "Settings updated successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  TIME: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
