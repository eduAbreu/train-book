# TrainBook Database Schema

## Overview

This document describes the complete database schema for the TrainBook gym management system using Supabase (PostgreSQL) with Row Level Security (RLS).

## Tables

### 1. profiles

User profiles extending Supabase auth.users

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'student')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  gym_id UUID REFERENCES gyms(id) ON DELETE SET NULL, -- Only for students
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_gym_id ON profiles(gym_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. gyms

Gym information and settings

```sql
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id) -- One gym per owner
);

-- Indexes
CREATE INDEX idx_gyms_owner_id ON gyms(owner_id);
CREATE INDEX idx_gyms_is_active ON gyms(is_active);

-- RLS Policies
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own gym
CREATE POLICY "Owners can manage own gym" ON gyms
  FOR ALL USING (auth.uid() = owner_id);

-- Students can view their gym
CREATE POLICY "Students can view their gym" ON gyms
  FOR SELECT USING (
    id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 3. gym_settings

Gym-specific configuration

```sql
CREATE TABLE gym_settings (
  gym_id UUID PRIMARY KEY REFERENCES gyms(id) ON DELETE CASCADE,
  allow_waitlist BOOLEAN DEFAULT TRUE,
  cancel_limit_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE gym_settings ENABLE ROW LEVEL SECURITY;

-- Only gym owners can manage settings
CREATE POLICY "Owners can manage gym settings" ON gym_settings
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can view their gym settings
CREATE POLICY "Students can view gym settings" ON gym_settings
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 4. class_types

Available class types per gym

```sql
CREATE TABLE class_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id, slug) -- Unique slug per gym
);

-- Indexes
CREATE INDEX idx_class_types_gym_id ON class_types(gym_id);
CREATE INDEX idx_class_types_slug ON class_types(gym_id, slug);

-- RLS Policies
ALTER TABLE class_types ENABLE ROW LEVEL SECURITY;

-- Gym owners can manage class types
CREATE POLICY "Owners can manage class types" ON class_types
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can view their gym's class types
CREATE POLICY "Students can view class types" ON class_types
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 5. weekly_template_slots

Weekly recurring class templates

```sql
CREATE TABLE weekly_template_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK (day IN ('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')),
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  class_type_id UUID NOT NULL REFERENCES class_types(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  instructor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Computed column for end_time
ALTER TABLE weekly_template_slots
ADD COLUMN end_time TIME GENERATED ALWAYS AS (start_time + (duration_minutes || ' minutes')::INTERVAL) STORED;

-- Indexes
CREATE INDEX idx_weekly_slots_gym_id ON weekly_template_slots(gym_id);
CREATE INDEX idx_weekly_slots_day ON weekly_template_slots(day);
CREATE INDEX idx_weekly_slots_class_type ON weekly_template_slots(class_type_id);

-- RLS Policies
ALTER TABLE weekly_template_slots ENABLE ROW LEVEL SECURITY;

-- Gym owners can manage slots
CREATE POLICY "Owners can manage weekly slots" ON weekly_template_slots
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can view their gym's slots
CREATE POLICY "Students can view weekly slots" ON weekly_template_slots
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 6. classes

Individual class instances

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  class_type_id UUID NOT NULL REFERENCES class_types(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  instructor TEXT,
  source_slot_id UUID REFERENCES weekly_template_slots(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_classes_gym_id ON classes(gym_id);
CREATE INDEX idx_classes_date ON classes(date);
CREATE INDEX idx_classes_class_type ON classes(class_type_id);
CREATE INDEX idx_classes_gym_date ON classes(gym_id, date);

-- RLS Policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Gym owners can manage classes
CREATE POLICY "Owners can manage classes" ON classes
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can view their gym's classes
CREATE POLICY "Students can view classes" ON classes
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 7. bookings

Class bookings and waitlist

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- For students
  participant TEXT NOT NULL CHECK (participant IN ('student', 'guest')),
  origin TEXT NOT NULL CHECK (origin IN ('student', 'owner')),
  guest_name TEXT, -- For guest bookings
  guest_email TEXT, -- For guest bookings
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate bookings
  UNIQUE(class_id, user_id) WHERE user_id IS NOT NULL,
  UNIQUE(class_id, guest_name, guest_email) WHERE participant = 'guest'
);

-- Indexes
CREATE INDEX idx_bookings_gym_id ON bookings(gym_id);
CREATE INDEX idx_bookings_class_id ON bookings(class_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_participant ON bookings(participant);

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Gym owners can manage all bookings
CREATE POLICY "Owners can manage bookings" ON bookings
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can manage their own bookings
CREATE POLICY "Students can manage own bookings" ON bookings
  FOR ALL USING (
    user_id = auth.uid() AND participant = 'student'
  );

-- Students can view their gym's bookings
CREATE POLICY "Students can view gym bookings" ON bookings
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 8. plans

Gym membership plans

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  weekly_limit INTEGER, -- NULL means unlimited
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plans_gym_id ON plans(gym_id);
CREATE INDEX idx_plans_is_active ON plans(is_active);

-- RLS Policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Gym owners can manage plans
CREATE POLICY "Owners can manage plans" ON plans
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can view their gym's plans
CREATE POLICY "Students can view plans" ON plans
  FOR SELECT USING (
    gym_id IN (
      SELECT gym_id FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );
```

### 9. student_plans

Student plan assignments

```sql
CREATE TABLE student_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, gym_id) -- One plan per student per gym
);

-- Indexes
CREATE INDEX idx_student_plans_gym_id ON student_plans(gym_id);
CREATE INDEX idx_student_plans_student_id ON student_plans(student_id);
CREATE INDEX idx_student_plans_plan_id ON student_plans(plan_id);
CREATE INDEX idx_student_plans_is_active ON student_plans(is_active);

-- RLS Policies
ALTER TABLE student_plans ENABLE ROW LEVEL SECURITY;

-- Gym owners can manage student plans
CREATE POLICY "Owners can manage student plans" ON student_plans
  FOR ALL USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );

-- Students can view their own plans
CREATE POLICY "Students can view own plans" ON student_plans
  FOR SELECT USING (student_id = auth.uid());
```

### 10. notifications

System notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booked', 'canceled', 'promoted', 'waitlist', 'reminder')),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_gym_id ON notifications(gym_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Gym owners can view all gym notifications
CREATE POLICY "Owners can view gym notifications" ON notifications
  FOR SELECT USING (
    gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  );
```

## Storage Buckets

### gym-assets

Storage for gym logos and cover images

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-assets', 'gym-assets', true);

-- Storage policies
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gym-assets');

CREATE POLICY "Owners can upload gym assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gym-assets' AND
    auth.uid() IN (
      SELECT owner_id FROM gyms WHERE id::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Owners can update gym assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'gym-assets' AND
    auth.uid() IN (
      SELECT owner_id FROM gyms WHERE id::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Owners can delete gym assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gym-assets' AND
    auth.uid() IN (
      SELECT owner_id FROM gyms WHERE id::text = (storage.foldername(name))[2]
    )
  );
```

## Functions and Triggers

### Update timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_settings_updated_at BEFORE UPDATE ON gym_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_types_updated_at BEFORE UPDATE ON class_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_template_slots_updated_at BEFORE UPDATE ON weekly_template_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_plans_updated_at BEFORE UPDATE ON student_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Validate booking constraints

```sql
CREATE OR REPLACE FUNCTION validate_booking_constraints()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is trying to book overlapping classes
  IF NEW.participant = 'student' AND NEW.user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM bookings b
      JOIN classes c1 ON b.class_id = c1.id
      JOIN classes c2 ON NEW.class_id = c2.id
      WHERE b.user_id = NEW.user_id
        AND b.status = 'confirmed'
        AND b.participant = 'student'
        AND c1.gym_id = c2.gym_id
        AND c1.date = c2.date
        AND c1.id != c2.id
        AND (
          (c1.start_time < c2.end_time AND c1.end_time > c2.start_time)
        )
    ) THEN
      RAISE EXCEPTION 'Student cannot book overlapping classes';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_booking_constraints_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION validate_booking_constraints();
```

## Views

### Active bookings count per class

```sql
CREATE VIEW class_booking_counts AS
SELECT
  c.id as class_id,
  c.gym_id,
  c.capacity,
  COUNT(b.id) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'waitlist') as waitlist_bookings,
  c.capacity - COUNT(b.id) FILTER (WHERE b.status = 'confirmed') as available_spots
FROM classes c
LEFT JOIN bookings b ON c.id = b.class_id
GROUP BY c.id, c.gym_id, c.capacity;
```

### Student weekly booking count

```sql
CREATE VIEW student_weekly_bookings AS
SELECT
  b.user_id,
  b.gym_id,
  DATE_TRUNC('week', c.date) as week_start,
  COUNT(b.id) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings
FROM bookings b
JOIN classes c ON b.class_id = c.id
WHERE b.participant = 'student'
  AND c.date >= CURRENT_DATE
GROUP BY b.user_id, b.gym_id, DATE_TRUNC('week', c.date);
```

## Indexes for Performance

### Additional indexes for common queries

```sql
-- For booking availability checks
CREATE INDEX idx_classes_gym_date_time ON classes(gym_id, date, start_time);

-- For student booking history
CREATE INDEX idx_bookings_user_date ON bookings(user_id, created_at DESC);

-- For waitlist management
CREATE INDEX idx_bookings_class_status_created ON bookings(class_id, status, created_at)
WHERE status = 'waitlist';

-- For plan limit checks
CREATE INDEX idx_student_plans_student_active ON student_plans(student_id, is_active)
WHERE is_active = true;
```

## Data Validation

### Check constraints

```sql
-- Ensure end_time > start_time for classes
ALTER TABLE classes ADD CONSTRAINT check_class_times
CHECK (end_time > start_time);

-- Ensure positive capacity
ALTER TABLE classes ADD CONSTRAINT check_positive_capacity
CHECK (capacity > 0);

-- Ensure valid email format for guests
ALTER TABLE bookings ADD CONSTRAINT check_guest_email
CHECK (
  (participant = 'guest' AND guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') OR
  (participant = 'student')
);

-- Ensure weekly_limit is positive or null
ALTER TABLE plans ADD CONSTRAINT check_weekly_limit
CHECK (weekly_limit IS NULL OR weekly_limit > 0);
```

This schema provides a robust foundation for the TrainBook gym management system with proper constraints, indexes, and RLS policies for security and performance.
