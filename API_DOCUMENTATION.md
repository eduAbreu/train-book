# TrainBook API Documentation

## Overview

This document describes all API endpoints and RPC functions for the TrainBook gym management system.

## Authentication

All API endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Gym Management

#### GET /api/gym

Get current user's gym (owner) or associated gym (student)

**Response:**

```typescript
{
  success: boolean;
  data?: {
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
    settings: {
      allow_waitlist: boolean;
      cancel_limit_hours: number;
    };
    created_at: string;
    updated_at: string;
  };
  error?: string;
}
```

#### POST /api/gym

Create a new gym (owner only)

**Request Body:**

```typescript
{
  name: string;
  location: string;
  email: string;
  phone?: string;
  description?: string;
}
```

#### PUT /api/gym

Update gym information (owner only)

**Request Body:**

```typescript
{
  name?: string;
  location?: string;
  email?: string;
  phone?: string;
  description?: string;
}
```

#### POST /api/gym/logo

Upload gym logo (owner only)

**Request:** Multipart form data with `logo` file

#### POST /api/gym/cover

Upload gym cover image (owner only)

**Request:** Multipart form data with `cover` file

#### PUT /api/gym/settings

Update gym settings (owner only)

**Request Body:**

```typescript
{
  allow_waitlist?: boolean;
  cancel_limit_hours?: number;
}
```

### 2. Class Types Management

#### GET /api/class-types

Get all class types for current gym

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    name: string;
    slug: string;
    emoji?: string;
    color?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}
```

#### POST /api/class-types

Create new class type (owner only)

**Request Body:**

```typescript
{
  name: string;
  slug: string;
  emoji?: string;
  color?: string;
}
```

#### PUT /api/class-types/[id]

Update class type (owner only)

**Request Body:**

```typescript
{
  name?: string;
  slug?: string;
  emoji?: string;
  color?: string;
  is_active?: boolean;
}
```

#### DELETE /api/class-types/[id]

Delete class type (owner only)

### 3. Weekly Template Slots

#### GET /api/slots

Get all weekly template slots for current gym

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    start_time: string;
    end_time: string;
    duration_minutes: number;
    class_type_id: string;
    class_type: {
      name: string;
      emoji?: string;
      color?: string;
    };
    capacity: number;
    instructor?: string;
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}
```

#### POST /api/slots

Create new weekly template slot (owner only)

**Request Body:**

```typescript
{
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  start_time: string; // HH:MM format
  duration_minutes: number;
  class_type_id: string;
  capacity: number;
  instructor?: string;
}
```

#### POST /api/slots/apply-to-days

Apply slot to multiple days (owner only)

**Request Body:**

```typescript
{
  slot: {
    start_time: string;
    duration_minutes: number;
    class_type_id: string;
    capacity: number;
    instructor?: string;
  };
  days: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>;
  mode: 'skip' | 'replace'; // How to handle conflicts
}
```

#### PUT /api/slots/[id]

Update weekly template slot (owner only)

#### DELETE /api/slots/[id]

Delete weekly template slot (owner only)

### 4. Classes Management

#### GET /api/classes

Get classes for current gym with optional filters

**Query Parameters:**

- `start_date`: Start date filter (YYYY-MM-DD)
- `end_date`: End date filter (YYYY-MM-DD)
- `class_type_id`: Filter by class type
- `instructor`: Filter by instructor

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    date: string;
    start_time: string;
    end_time: string;
    class_type: {
      id: string;
      name: string;
      emoji?: string;
      color?: string;
    };
    capacity: number;
    instructor?: string;
    booking_counts: {
      confirmed: number;
      waitlist: number;
      available: number;
    };
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}
```

#### POST /api/classes/generate

Generate classes from weekly slots (owner only)

**Request Body:**

```typescript
{
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}
```

#### POST /api/classes

Create individual class (owner only)

**Request Body:**

```typescript
{
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  class_type_id: string;
  capacity: number;
  instructor?: string;
  source_slot_id?: string;
}
```

#### PUT /api/classes/[id]

Update class (owner only)

#### DELETE /api/classes/[id]

Delete class (owner only)

### 5. Bookings Management

#### GET /api/bookings

Get bookings for current user or gym

**Query Parameters:**

- `class_id`: Filter by class
- `status`: Filter by status ('confirmed' | 'waitlist')
- `participant`: Filter by participant type ('student' | 'guest')

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    class_id: string;
    class: {
      id: string;
      date: string;
      start_time: string;
      end_time: string;
      class_type: {
        name: string;
        emoji?: string;
        color?: string;
      };
      instructor?: string;
    };
    user_id?: string;
    participant: 'student' | 'guest';
    origin: 'student' | 'owner';
    guest_name?: string;
    guest_email?: string;
    status: 'confirmed' | 'waitlist';
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}
```

#### POST /api/bookings

Book a class

**Request Body:**

```typescript
{
  class_id: string;
  participant: 'student' | 'guest';
  guest_name?: string; // Required for guest bookings
  guest_email?: string; // Required for guest bookings
  options?: {
    ignore_plan_limit?: boolean; // Owner only
    ignore_overlap?: boolean; // Owner only
  };
}
```

#### DELETE /api/bookings/[id]

Cancel booking

#### POST /api/bookings/[id]/promote

Promote from waitlist (owner only)

### 6. Plans Management

#### GET /api/plans

Get all plans for current gym

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    name: string;
    description?: string;
    weekly_limit?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}
```

#### POST /api/plans

Create new plan (owner only)

**Request Body:**

```typescript
{
  name: string;
  description?: string;
  weekly_limit?: number; // null for unlimited
}
```

#### PUT /api/plans/[id]

Update plan (owner only)

#### DELETE /api/plans/[id]

Delete plan (owner only)

### 7. Student Plans Management

#### GET /api/student-plans

Get student plans for current gym (owner) or own plans (student)

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    student_id: string;
    student: {
      full_name: string;
      email: string;
    };
    plan_id: string;
    plan: {
      name: string;
      description?: string;
      weekly_limit?: number;
    };
    start_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  error?: string;
}
```

#### POST /api/student-plans

Assign plan to student (owner only)

**Request Body:**

```typescript
{
  student_id: string;
  plan_id: string;
  start_date?: string; // Defaults to today
}
```

#### PUT /api/student-plans/[id]

Update student plan (owner only)

#### DELETE /api/student-plans/[id]

Remove student plan (owner only)

### 8. Notifications

#### GET /api/notifications

Get user notifications

**Query Parameters:**

- `is_read`: Filter by read status
- `type`: Filter by notification type
- `limit`: Number of notifications to return (default: 50)

**Response:**

```typescript
{
  success: boolean;
  data?: Array<{
    id: string;
    gym_id: string;
    type: 'booked' | 'canceled' | 'promoted' | 'waitlist' | 'reminder';
    class_id?: string;
    class?: {
      date: string;
      start_time: string;
      class_type: {
        name: string;
        emoji?: string;
      };
    };
    payload: Record<string, any>;
    is_read: boolean;
    created_at: string;
  }>;
  error?: string;
}
```

#### PUT /api/notifications/[id]/read

Mark notification as read

#### PUT /api/notifications/read-all

Mark all notifications as read

## RPC Functions

### 1. apply_slot_to_days

Apply a weekly template slot to multiple days

**Function Signature:**

```sql
apply_slot_to_days(
  p_gym_id UUID,
  p_slot JSONB,
  p_days TEXT[],
  p_mode TEXT DEFAULT 'skip'
)
```

**Parameters:**

- `p_gym_id`: Gym ID
- `p_slot`: Slot configuration as JSON
- `p_days`: Array of days ('Mon', 'Tue', etc.)
- `p_mode`: 'skip' or 'replace' for handling conflicts

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("apply_slot_to_days", {
  p_gym_id: "gym-uuid",
  p_slot: {
    start_time: "09:00",
    duration_minutes: 60,
    class_type_id: "class-type-uuid",
    capacity: 20,
    instructor: "John Doe",
  },
  p_days: ["Mon", "Wed", "Fri"],
  p_mode: "skip",
});
```

### 2. generate_classes_from_slots

Generate individual classes from weekly template slots

**Function Signature:**

```sql
generate_classes_from_slots(
  p_gym_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
```

**Parameters:**

- `p_gym_id`: Gym ID
- `p_start_date`: Start date for generation
- `p_end_date`: End date for generation

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("generate_classes_from_slots", {
  p_gym_id: "gym-uuid",
  p_start_date: "2024-01-01",
  p_end_date: "2024-01-31",
});
```

### 3. book_class

Book a class with validation

**Function Signature:**

```sql
book_class(
  p_gym_id UUID,
  p_class_id UUID,
  p_participant JSONB,
  p_options JSONB DEFAULT '{}'
)
```

**Parameters:**

- `p_gym_id`: Gym ID
- `p_class_id`: Class ID to book
- `p_participant`: Participant information
- `p_options`: Booking options

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("book_class", {
  p_gym_id: "gym-uuid",
  p_class_id: "class-uuid",
  p_participant: {
    type: "student",
    user_id: "user-uuid",
  },
  p_options: {
    ignore_plan_limit: false,
    ignore_overlap: false,
  },
});
```

### 4. cancel_booking

Cancel a booking with waitlist promotion

**Function Signature:**

```sql
cancel_booking(p_booking_id UUID)
```

**Parameters:**

- `p_booking_id`: Booking ID to cancel

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("cancel_booking", {
  p_booking_id: "booking-uuid",
});
```

### 5. promote_from_waitlist

Promote first waitlist participant to confirmed

**Function Signature:**

```sql
promote_from_waitlist(
  p_gym_id UUID,
  p_class_id UUID
)
```

**Parameters:**

- `p_gym_id`: Gym ID
- `p_class_id`: Class ID

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("promote_from_waitlist", {
  p_gym_id: "gym-uuid",
  p_class_id: "class-uuid",
});
```

### 6. unlink_student_from_gym

Remove student from gym and clean up data

**Function Signature:**

```sql
unlink_student_from_gym(
  p_gym_id UUID,
  p_student_id UUID
)
```

**Parameters:**

- `p_gym_id`: Gym ID
- `p_student_id`: Student ID to unlink

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("unlink_student_from_gym", {
  p_gym_id: "gym-uuid",
  p_student_id: "student-uuid",
});
```

### 7. close_gym

Close gym and clean up all data

**Function Signature:**

```sql
close_gym(p_gym_id UUID)
```

**Parameters:**

- `p_gym_id`: Gym ID to close

**Example Usage:**

```typescript
const { data, error } = await supabase.rpc("close_gym", {
  p_gym_id: "gym-uuid",
});
```

## Error Handling

### Standard Error Response

```typescript
{
  success: false;
  error: string;
  code?: string; // Error code for client handling
  details?: any; // Additional error details
}
```

### Common Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User not authorized for action
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `BUSINESS_RULE_VIOLATION`: Business rule violation
- `CAPACITY_EXCEEDED`: Class at capacity
- `OVERLAP_DETECTED`: Overlapping booking detected
- `PLAN_LIMIT_EXCEEDED`: Weekly plan limit exceeded
- `CANCELLATION_TOO_LATE`: Cancellation outside time limit

## Rate Limiting

### Limits

- General API: 100 requests per minute per user
- Booking operations: 10 requests per minute per user
- File uploads: 5 requests per minute per user

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Stripe Webhooks

- `customer.subscription.created`: New gym subscription
- `customer.subscription.updated`: Subscription plan change
- `customer.subscription.deleted`: Subscription cancelled
- `invoice.payment_succeeded`: Payment successful
- `invoice.payment_failed`: Payment failed

### Internal Webhooks

- `booking.created`: New booking created
- `booking.cancelled`: Booking cancelled
- `booking.promoted`: Waitlist promotion
- `class.created`: New class created
- `class.updated`: Class updated
- `class.deleted`: Class deleted

## SDK Examples

### TypeScript/JavaScript

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Book a class
async function bookClass(classId: string) {
  const { data, error } = await supabase.rpc("book_class", {
    p_gym_id: "gym-uuid",
    p_class_id: classId,
    p_participant: {
      type: "student",
      user_id: "user-uuid",
    },
    p_options: {},
  });

  if (error) throw error;
  return data;
}

// Get classes
async function getClasses(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("classes")
    .select(
      `
      *,
      class_type:class_types(*),
      booking_counts:class_booking_counts(*)
    `
    )
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date")
    .order("start_time");

  if (error) throw error;
  return data;
}
```

This API documentation provides comprehensive coverage of all endpoints and RPC functions needed for the TrainBook gym management system.
