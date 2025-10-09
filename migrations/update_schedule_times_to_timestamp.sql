-- Migration: Update weekly_template_slots to use timestamp instead of time
-- This migration converts start_time and end_time from time to timestamp

-- Step 1: Add new timestamp columns
ALTER TABLE weekly_template_slots 
ADD COLUMN start_timestamp TIMESTAMP,
ADD COLUMN end_timestamp TIMESTAMP;

-- Step 2: Convert existing time data to timestamp
-- We'll use a reference date (2024-01-01) and combine it with the time values
UPDATE weekly_template_slots 
SET 
  start_timestamp = ('2024-01-01'::date + start_time::time)::timestamp,
  end_timestamp = ('2024-01-01'::date + end_time::time)::timestamp;

-- Step 3: Drop the old time columns (with CASCADE to handle dependencies)
-- Check if columns exist before dropping them
DO $$
BEGIN
    -- Drop start_time if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_template_slots' 
               AND column_name = 'start_time') THEN
        ALTER TABLE weekly_template_slots DROP COLUMN start_time CASCADE;
    END IF;
    
    -- Drop end_time if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_template_slots' 
               AND column_name = 'end_time') THEN
        ALTER TABLE weekly_template_slots DROP COLUMN end_time CASCADE;
    END IF;
END $$;

-- Step 4: Rename the new columns to the original names
ALTER TABLE weekly_template_slots 
RENAME COLUMN start_timestamp TO start_time;

ALTER TABLE weekly_template_slots 
RENAME COLUMN end_timestamp TO end_time;

-- Step 5: Add NOT NULL constraints
ALTER TABLE weekly_template_slots 
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL;

-- Step 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_template_slots_start_time 
ON weekly_template_slots(start_time);

CREATE INDEX IF NOT EXISTS idx_weekly_template_slots_end_time 
ON weekly_template_slots(end_time);

-- Step 7: Add check constraint to ensure times are on the same day
ALTER TABLE weekly_template_slots 
ADD CONSTRAINT check_same_day 
CHECK (DATE(start_time) = DATE(end_time));
