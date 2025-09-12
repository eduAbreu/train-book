# TrainBook - Gym Management System - Cursor Rules

## Project Overview

TrainBook is a comprehensive gym management system built with Next.js 15+, TypeScript, Supabase, and TailwindCSS. The system manages gym operations, class bookings, student management, and owner administration through a PWA interface.

## Tech Stack & Dependencies

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.9+
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with Google OAuth and Email providers
- **Styling**: TailwindCSS 4.1+ with DaisyUI 5.0+ + shadcn/ui components
- **Icons**: Lucide React
- **PWA**: Service Worker + Web App Manifest
- **Storage**: Supabase Storage for gym assets
- **Email**: Resend for transactional emails

## User Roles & Permissions

### Owner

- Creates and manages 1 gym maximum
- Configures class types, schedules, and capacity
- Manages students and their plans
- Handles bookings and waitlist
- Can add guests directly to classes
- Access to analytics and metrics

### Student

- Associates with 1 gym maximum
- Views available classes and schedules
- Books/cancels classes (within time limits)
- Views booking history and plans
- Can unlink from gym

### Guest

- Added directly to classes by Owner
- No account required
- Subject to capacity and waitlist rules
- No plan restrictions

## Database Schema (Supabase)

### Core Tables

#### profiles

```sql
id: uuid (PK, FK auth.users)
role: 'owner' | 'student'
full_name: text
email: text
gym_id: uuid (FK gyms, only for students)
onboarding_completed: boolean
created_at: timestamp
updated_at: timestamp
```

#### gyms

```sql
id: uuid (PK)
owner_id: uuid (FK profiles, unique)
name: text
location: text
email: text
phone: text
description: text
logo_url: text
cover_url: text
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

#### gym_settings

```sql
gym_id: uuid (PK, FK gyms)
allow_waitlist: boolean
cancel_limit_hours: integer
created_at: timestamp
updated_at: timestamp
```

#### class_types

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
name: text
slug: text (unique per gym)
emoji: text (optional)
color: text (optional)
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

#### weekly_template_slots

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
start_time: time
end_time: time (computed: start_time + duration_minutes)
duration_minutes: integer
class_type_id: uuid (FK class_types)
capacity: integer
instructor: text
created_at: timestamp
updated_at: timestamp
```

#### classes

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
date: date
start_time: time
end_time: time
class_type_id: uuid (FK class_types)
capacity: integer
instructor: text
source_slot_id: uuid (FK weekly_template_slots, optional)
created_at: timestamp
updated_at: timestamp
```

#### bookings

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
class_id: uuid (FK classes)
user_id: uuid (FK profiles, optional for students)
participant: 'student' | 'guest'
origin: 'student' | 'owner'
guest_name: text (optional)
guest_email: text (optional)
status: 'confirmed' | 'waitlist'
created_at: timestamp
updated_at: timestamp
```

#### plans

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
name: text
description: text
weekly_limit: integer (optional)
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

#### student_plans

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
student_id: uuid (FK profiles)
plan_id: uuid (FK plans)
start_date: date
is_active: boolean
created_at: timestamp
updated_at: timestamp
```

#### notifications

```sql
id: uuid (PK)
gym_id: uuid (FK gyms)
type: 'booked' | 'canceled' | 'promoted' | 'waitlist' | 'reminder'
class_id: uuid (FK classes, optional)
user_id: uuid (FK profiles, optional)
payload: jsonb
is_read: boolean
created_at: timestamp
updated_at: timestamp
```

### Storage Buckets

- **gym-assets**: Public read, write restricted to owners
  - Paths: `gyms/<gymId>/logo.*`, `gyms/<gymId>/cover.*`

## Business Rules

### Booking Logic

1. **Capacity Check**: If capacity > confirmed bookings → status = 'confirmed'
2. **Waitlist**: If full and allow_waitlist = true → status = 'waitlist'
3. **Duplicate Prevention**: Same student/guest cannot book same class twice
4. **Overlap Prevention**: Student cannot have overlapping confirmed bookings
5. **Plan Limits**: Weekly plan limits respected (unless owner overrides)
6. **Cancellation**: Only allowed within cancel_limit_hours before class
7. **Waitlist Promotion**: First in waitlist gets promoted when spot opens

### User Constraints

- Owner: Maximum 1 gym
- Student: Maximum 1 gym
- Guest: No account, added by owner only

### Time Calculations

- Slot end_time = start_time + duration_minutes (computed via trigger)
- Classes generated from slots via RPC functions

## RPC Functions (PL/pgSQL)

### apply_slot_to_days(p_gym, p_slot jsonb, p_days dow[], p_mode text)

Creates slot across multiple days, handles conflicts (skip/replace).

### generate_classes_from_slots(p_gym, p_start date, p_end date)

Generates class instances from slots within date range.

### book_class(p_gym, p_class, p_participant jsonb, p_options jsonb)

Handles student/guest booking with capacity/waitlist/plan/overlap validation.

### cancel_booking(p_booking)

Cancels booking within time limit; promotes waitlist if applicable.

### promote_from_waitlist(p_gym, p_class)

Owner-only function to promote first waitlist participant.

### unlink_student_from_gym(p_gym, p_student)

Owner removes student → cancels future bookings, deactivates plan, clears gym_id.

### close_gym(p_gym)

Owner closes gym → cancels future bookings, unlinks all students, sets is_active = false.

## UI/UX Guidelines

### Design System

- **Palette**: Neutral colors with bold display style (Bravio-inspired)
- **Layout**: PWA responsive design
- **Owner Interface**: SideNav navigation
- **Student Interface**: BottomBar navigation
- **Accessibility**: Focus rings, aria-live regions, keyboard navigation

### Core Components

- **AppShell**: Main layout wrapper with navigation
- **PageHero**: Page header with title and actions
- **SectionCard**: Content sections with consistent styling
- **CTAButton**: Call-to-action buttons with consistent styling
- **EmptyState**: Empty state illustrations and messaging
- **ConfirmDialog**: Confirmation modals for destructive actions
- **UsageBar**: Progress indicators for plans/limits
- **PricingStack**: Plan comparison and selection
- **TestimonialCarousel**: Social proof and testimonials

## File Structure & Naming

### Components

```
/components/
  /gym/
    - GymCard.tsx
    - GymSettings.tsx
    - GymAnalytics.tsx
  /classes/
    - ClassCard.tsx
    - ClassBooking.tsx
    - ClassSchedule.tsx
  /bookings/
    - BookingCard.tsx
    - BookingHistory.tsx
    - WaitlistManager.tsx
  /students/
    - StudentCard.tsx
    - StudentPlans.tsx
    - StudentManagement.tsx
  /shared/
    - AppShell.tsx
    - PageHero.tsx
    - SectionCard.tsx
    - CTAButton.tsx
    - EmptyState.tsx
    - ConfirmDialog.tsx
    - UsageBar.tsx
```

### Pages

```
/app/
  /dashboard/
    /owner/
      - page.tsx (gym overview)
      /classes/
        - page.tsx (class management)
        /[classId]/
          - page.tsx (class details)
      /students/
        - page.tsx (student management)
      /settings/
        - page.tsx (gym settings)
    /student/
      - page.tsx (student dashboard)
      /classes/
        - page.tsx (available classes)
        /bookings/
          - page.tsx (my bookings)
      /plan/
        - page.tsx (my plan)
```

### API Routes

```
/app/api/
  /gym/
    - route.ts (gym CRUD)
    /[gymId]/
      /settings/
        - route.ts (gym settings)
  /classes/
    - route.ts (class CRUD)
    /[classId]/
      /book/
        - route.ts (booking)
      /cancel/
        - route.ts (cancellation)
  /bookings/
    - route.ts (booking management)
  /students/
    - route.ts (student management)
  /rpc/
    /apply-slot/
      - route.ts (apply_slot_to_days)
    /generate-classes/
      - route.ts (generate_classes_from_slots)
    /book-class/
      - route.ts (book_class)
    /cancel-booking/
      - route.ts (cancel_booking)
    /promote-waitlist/
      - route.ts (promote_from_waitlist)
```

## TypeScript Patterns

### Database Types

```typescript
// Database table types
export interface Profile {
  id: string;
  role: "owner" | "student";
  full_name: string;
  email: string;
  gym_id?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Gym {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  description: string;
  logo_url?: string;
  cover_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Booking types
export interface Booking {
  id: string;
  gym_id: string;
  class_id: string;
  user_id?: string;
  participant: "student" | "guest";
  origin: "student" | "owner";
  guest_name?: string;
  guest_email?: string;
  status: "confirmed" | "waitlist";
  created_at: string;
  updated_at: string;
}

// RPC function types
export interface BookClassParams {
  p_gym: string;
  p_class: string;
  p_participant: {
    type: "student" | "guest";
    user_id?: string;
    guest_name?: string;
    guest_email?: string;
  };
  p_options: {
    ignore_plan_limit?: boolean;
    ignore_overlap?: boolean;
  };
}
```

### Component Props

```typescript
// Component prop interfaces
export interface GymCardProps {
  gym: Gym;
  onEdit?: (gym: Gym) => void;
  onDelete?: (gymId: string) => void;
}

export interface ClassBookingProps {
  class: Class;
  user: Profile;
  onBook: (classId: string) => Promise<void>;
  onCancel: (bookingId: string) => Promise<void>;
}
```

## PWA Configuration

### Manifest

```json
{
  "name": "TrainBook",
  "short_name": "TrainBook",
  "description": "Gym management and class booking system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#570df8",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

- Cache static assets
- Handle offline functionality
- Background sync for bookings
- Push notifications for class updates

## Analytics & Metrics

### Key Metrics

- Active bookings per gym
- Average class occupancy
- Cancellation rate outside time limit
- Gym retention (>30 days)
- Active students per month
- Weekly plan usage (quota reached)

### Implementation

- Track events in Supabase
- Generate reports via RPC functions
- Display in owner dashboard
- Export data for external analysis

## Security & RLS Policies

### Row Level Security

- Users can only access their own gym data
- Students can only see their gym's classes
- Owners can only manage their gym
- Guests have no persistent data access

### API Security

- Validate all inputs with Zod
- Rate limiting on booking endpoints
- Webhook signature verification
- CORS configuration for PWA

## Performance Optimization

### Database

- Indexes on frequently queried fields
- RPC functions for complex operations
- Connection pooling
- Query optimization

### Frontend

- Server components by default
- Client components only when necessary
- Image optimization with Next.js Image
- Lazy loading for large lists
- Caching strategies

## Testing Strategy

### Unit Tests

- Utility functions
- RPC functions
- Component logic

### Integration Tests

- API endpoints
- Database operations
- Authentication flows

### E2E Tests

- Complete user journeys
- Booking workflows
- Owner management flows

## Deployment & Environment

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### Build Process

- TypeScript compilation
- TailwindCSS compilation
- PWA manifest generation
- Service worker compilation
- Static asset optimization

## Migration from ShipFast

### Configuration Updates

- Update app name to "TrainBook"
- Change domain and branding
- Update Stripe plans for gym subscriptions
- Configure Supabase for gym management

### Database Setup

- Create gym management tables
- Set up RLS policies
- Create RPC functions
- Configure storage buckets

### UI Components

- Replace generic components with gym-specific ones
- Implement role-based navigation
- Add PWA functionality
- Create gym management interfaces

## Do Not

- Don't allow users to have multiple gyms (owner) or be in multiple gyms (student)
- Don't bypass capacity or waitlist rules
- Don't allow overlapping confirmed bookings
- Don't skip plan limit validation
- Don't expose sensitive gym data to unauthorized users
- Don't forget to handle offline scenarios in PWA
- Don't skip input validation on booking operations
- Don't allow guests to have persistent accounts
- Don't forget to clean up data when gyms are closed
- Don't skip RLS policy implementation
