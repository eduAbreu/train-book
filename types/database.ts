// Train Book - Database Types
// Generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "owner" | "student";
export type ParticipantType = "student" | "guest";
export type BookingOrigin = "student" | "owner";
export type BookingStatus = "confirmed" | "waitlist";
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type NotificationType =
  | "booked"
  | "canceled"
  | "promoted"
  | "waitlist"
  | "reminder"
  | "plan_limit";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          email: string | null;
          gym_id: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name?: string | null;
          email?: string | null;
          gym_id?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string | null;
          email?: string | null;
          gym_id?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gyms: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          location: string | null;
          email: string | null;
          phone: string | null;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          location?: string | null;
          email?: string | null;
          phone?: string | null;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          location?: string | null;
          email?: string | null;
          phone?: string | null;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gym_settings: {
        Row: {
          gym_id: string;
          allow_waitlist: boolean;
          cancel_limit_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          gym_id: string;
          allow_waitlist?: boolean;
          cancel_limit_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          gym_id?: string;
          allow_waitlist?: boolean;
          cancel_limit_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_types: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          slug: string;
          emoji: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          slug: string;
          emoji?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          name?: string;
          slug?: string;
          emoji?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      weekly_template_slots: {
        Row: {
          id: string;
          gym_id: string;
          day: DayOfWeek;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          class_type_id: string;
          capacity: number;
          instructor: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          day: DayOfWeek;
          start_time: string;
          end_time?: string;
          duration_minutes: number;
          class_type_id: string;
          capacity: number;
          instructor?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          day?: DayOfWeek;
          start_time?: string;
          end_time?: string;
          duration_minutes?: number;
          class_type_id?: string;
          capacity?: number;
          instructor?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          gym_id: string;
          date: string;
          start_time: string;
          end_time: string;
          class_type_id: string;
          capacity: number;
          instructor: string | null;
          source_slot_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          date: string;
          start_time: string;
          end_time: string;
          class_type_id: string;
          capacity: number;
          instructor?: string | null;
          source_slot_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          class_type_id?: string;
          capacity?: number;
          instructor?: string | null;
          source_slot_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          gym_id: string;
          class_id: string;
          user_id: string | null;
          participant: ParticipantType;
          origin: BookingOrigin;
          guest_name: string | null;
          guest_email: string | null;
          status: BookingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          class_id: string;
          user_id?: string | null;
          participant: ParticipantType;
          origin: BookingOrigin;
          guest_name?: string | null;
          guest_email?: string | null;
          status: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          class_id?: string;
          user_id?: string | null;
          participant?: ParticipantType;
          origin?: BookingOrigin;
          guest_name?: string | null;
          guest_email?: string | null;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          description: string | null;
          weekly_limit: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          description?: string | null;
          weekly_limit?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          name?: string;
          description?: string | null;
          weekly_limit?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_plans: {
        Row: {
          id: string;
          gym_id: string;
          student_id: string;
          plan_id: string;
          start_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          student_id: string;
          plan_id: string;
          start_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          student_id?: string;
          plan_id?: string;
          start_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          gym_id: string;
          type: NotificationType;
          class_id: string | null;
          user_id: string | null;
          payload: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          type: NotificationType;
          class_id?: string | null;
          user_id?: string | null;
          payload: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          gym_id?: string;
          type?: NotificationType;
          class_id?: string | null;
          user_id?: string | null;
          payload?: Json;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      apply_slot_to_days: {
        Args: {
          p_gym_id: string;
          p_slot: Json;
          p_days: DayOfWeek[];
          p_mode: "skip" | "replace";
        };
        Returns: Json;
      };
      generate_classes_from_slots: {
        Args: {
          p_gym_id: string;
          p_start_date: string;
          p_end_date: string;
        };
        Returns: Json;
      };
      book_class: {
        Args: {
          p_gym_id: string;
          p_class_id: string;
          p_participant: Json;
          p_options: Json;
        };
        Returns: Json;
      };
      cancel_booking: {
        Args: {
          p_booking_id: string;
        };
        Returns: Json;
      };
      promote_from_waitlist: {
        Args: {
          p_gym_id: string;
          p_class_id: string;
        };
        Returns: Json;
      };
      unlink_student_from_gym: {
        Args: {
          p_gym_id: string;
          p_student_id: string;
        };
        Returns: Json;
      };
      close_gym: {
        Args: {
          p_gym_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for common operations
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Specific table types
export type Profile = Tables<"profiles">;
export type Gym = Tables<"gyms">;
export type GymSettings = Tables<"gym_settings">;
export type ClassType = Tables<"class_types">;
export type WeeklyTemplateSlot = Tables<"weekly_template_slots">;
export type Class = Tables<"classes">;
export type Booking = Tables<"bookings">;
export type Plan = Tables<"plans">;
export type StudentPlan = Tables<"student_plans">;
export type Notification = Tables<"notifications">;

// Insert types
export type ProfileInsert = TablesInsert<"profiles">;
export type GymInsert = TablesInsert<"gyms">;
export type GymSettingsInsert = TablesInsert<"gym_settings">;
export type ClassTypeInsert = TablesInsert<"class_types">;
export type WeeklyTemplateSlotInsert = TablesInsert<"weekly_template_slots">;
export type ClassInsert = TablesInsert<"classes">;
export type BookingInsert = TablesInsert<"bookings">;
export type PlanInsert = TablesInsert<"plans">;
export type StudentPlanInsert = TablesInsert<"student_plans">;
export type NotificationInsert = TablesInsert<"notifications">;

// Update types
export type ProfileUpdate = TablesUpdate<"profiles">;
export type GymUpdate = TablesUpdate<"gyms">;
export type GymSettingsUpdate = TablesUpdate<"gym_settings">;
export type ClassTypeUpdate = TablesUpdate<"class_types">;
export type WeeklyTemplateSlotUpdate = TablesUpdate<"weekly_template_slots">;
export type ClassUpdate = TablesUpdate<"classes">;
export type BookingUpdate = TablesUpdate<"bookings">;
export type PlanUpdate = TablesUpdate<"plans">;
export type StudentPlanUpdate = TablesUpdate<"student_plans">;
export type NotificationUpdate = TablesUpdate<"notifications">;
