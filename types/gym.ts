// Train Book - Gym Related Types

import type {
  Gym,
  GymSettings,
  ClassType,
  WeeklyTemplateSlot,
  Class,
  Booking,
  Plan,
  StudentPlan,
  Profile,
  DayOfWeek,
  BookingStatus,
  ParticipantType,
  BookingOrigin,
} from "./database";

// Extended types with relations
export interface GymWithSettings extends Gym {
  gym_settings: GymSettings | null;
  owner: Pick<Profile, "id" | "full_name" | "email"> | null;
}

export interface GymWithDetails extends GymWithSettings {
  class_types: ClassType[];
  weekly_template_slots: WeeklyTemplateSlot[];
  _count: {
    students: number;
    classes: number;
    bookings: number;
  };
}

export interface ClassTypeWithSlots extends ClassType {
  weekly_template_slots: WeeklyTemplateSlot[];
}

export interface WeeklyTemplateSlotWithClassType extends WeeklyTemplateSlot {
  class_type: ClassType;
}

export interface ClassWithDetails extends Class {
  class_type: ClassType;
  bookings: BookingWithParticipant[];
  _count: {
    confirmed: number;
    waitlist: number;
  };
}

export interface BookingWithParticipant extends Booking {
  user?: Pick<Profile, "id" | "full_name" | "email"> | null;
  class: Pick<Class, "id" | "date" | "start_time" | "end_time"> & {
    class_type: Pick<ClassType, "id" | "name" | "emoji" | "color">;
  };
}

export interface PlanWithStudents extends Plan {
  student_plans: (StudentPlan & {
    student: Pick<Profile, "id" | "full_name" | "email">;
  })[];
}

export interface StudentWithPlan extends Profile {
  student_plan?: StudentPlan & {
    plan: Plan;
  };
  gym?: Pick<Gym, "id" | "name" | "logo_url">;
}

// Form types
export interface GymFormData {
  name: string;
  location?: string;
  email?: string;
  phone?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
}

export interface GymSettingsFormData {
  allow_waitlist: boolean;
  cancel_limit_hours: number;
}

export interface ClassTypeFormData {
  name: string;
  slug: string;
  emoji?: string;
  color?: string;
  is_active: boolean;
}

export interface WeeklySlotFormData {
  day: DayOfWeek;
  start_time: string;
  duration_minutes: number;
  class_type_id: string;
  capacity: number;
  instructor?: string;
  is_active: boolean;
}

export interface PlanFormData {
  name: string;
  description?: string;
  weekly_limit?: number;
  is_active: boolean;
}

// Booking types
export interface BookingRequest {
  class_id: string;
  participant: ParticipantType;
  origin: BookingOrigin;
  guest_name?: string;
  guest_email?: string;
  options?: {
    ignore_plan_limit?: boolean;
    force_confirmed?: boolean;
  };
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  status: BookingStatus;
  message?: string;
  waitlist_position?: number;
}

// Calendar types
export interface CalendarDay {
  date: string;
  classes: ClassWithDetails[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

// Schedule types
export interface ScheduleSlot {
  id: string;
  time: string;
  duration: number;
  classes: ClassWithDetails[];
}

export interface DaySchedule {
  date: string;
  day: DayOfWeek;
  slots: ScheduleSlot[];
}

export interface WeekSchedule {
  startDate: string;
  endDate: string;
  days: DaySchedule[];
}

// Analytics types
export interface GymMetrics {
  total_students: number;
  active_students: number;
  total_classes: number;
  total_bookings: number;
  confirmed_bookings: number;
  waitlist_bookings: number;
  average_occupancy: number;
  cancellation_rate: number;
  retention_rate: number;
}

export interface ClassMetrics {
  class_id: string;
  date: string;
  start_time: string;
  class_type: Pick<ClassType, "name" | "emoji" | "color">;
  capacity: number;
  confirmed: number;
  waitlist: number;
  occupancy_rate: number;
  no_shows: number;
}

export interface StudentMetrics {
  student_id: string;
  full_name: string;
  email: string;
  total_bookings: number;
  confirmed_bookings: number;
  canceled_bookings: number;
  no_shows: number;
  plan_usage: number;
  plan_limit: number | null;
  last_booking: string | null;
}

// Notification payload types
export interface BookedNotificationPayload {
  class_id: string;
  class_name: string;
  date: string;
  start_time: string;
  status: BookingStatus;
  waitlist_position?: number;
}

export interface CanceledNotificationPayload {
  class_id: string;
  class_name: string;
  date: string;
  start_time: string;
  canceled_by: "student" | "owner";
}

export interface PromotedNotificationPayload {
  class_id: string;
  class_name: string;
  date: string;
  start_time: string;
  from_position: number;
}

export interface WaitlistNotificationPayload {
  class_id: string;
  class_name: string;
  date: string;
  start_time: string;
  position: number;
}

export interface ReminderNotificationPayload {
  class_id: string;
  class_name: string;
  date: string;
  start_time: string;
  reminder_type: "day_before" | "hour_before";
}

export interface PlanLimitNotificationPayload {
  plan_name: string;
  current_usage: number;
  weekly_limit: number;
  week_start: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Filter and search types
export interface ClassFilters {
  date_from?: string;
  date_to?: string;
  class_type_ids?: string[];
  status?: BookingStatus[];
  instructor?: string;
  available_only?: boolean;
}

export interface BookingFilters {
  date_from?: string;
  date_to?: string;
  class_type_ids?: string[];
  status?: BookingStatus[];
  participant?: ParticipantType[];
  user_id?: string;
}

export interface StudentFilters {
  search?: string;
  plan_id?: string;
  active_only?: boolean;
}

// Utility types
export interface TimeSlot {
  start: string;
  end: string;
  duration: number;
}

export interface DayOfWeekInfo {
  key: DayOfWeek;
  label: string;
  short: string;
  index: number;
}

export interface ColorOption {
  name: string;
  value: string;
  class: string;
}

export interface EmojiOption {
  emoji: string;
  name: string;
  category: string;
}
