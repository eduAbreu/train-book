# Database Migrations

This directory contains database migration scripts for the TrainBook application.

## Recent Changes

### Schedule Time Migration (Date Objects)

**Migration File**: `update_schedule_times_to_timestamp.sql`

**Purpose**: Migrate from TIME columns to TIMESTAMP columns for better date/time handling and validation.

**Changes**:

- Convert `start_time` and `end_time` from `TIME` to `TIMESTAMP` in `weekly_template_slots` table
- Convert `start_time` and `end_time` from `TIME` to `TIMESTAMP` in `classes` table
- Add constraints to ensure start and end times are on the same day
- Add indexes for better performance on timestamp columns

**Benefits**:

1. **Simplified Validation**: No more complex string-to-time conversions
2. **Better Performance**: Direct timestamp comparisons instead of string parsing
3. **Type Safety**: TypeScript Date objects work seamlessly with database timestamps
4. **Future-Proof**: Easier to add timezone support if needed

**Code Changes**:

- Updated TypeScript interfaces to use `Date` instead of `string` for time fields
- Added utility functions for converting between time strings and Date objects
- Improved validation logic to only validate when necessary
- Enhanced overlap detection using Date object comparisons

**Validation Improvements**:

- New slots: Only validate when start time and days are selected
- Editing slots: Only validate when time fields are actually changed
- Better user experience with fewer premature validation errors

## Running Migrations

1. **Backup your database** before running any migrations
2. Run the migration script in your Supabase SQL editor or via CLI
3. Test the application thoroughly after migration
4. Monitor for any issues with existing data

## Rollback

If you need to rollback the timestamp migration:

```sql
-- This is a complex rollback that would need to be carefully planned
-- Consider the impact on existing data before proceeding
-- Contact the development team for assistance with rollback procedures
```

## Testing

After running migrations:

1. Test creating new time slots
2. Test editing existing time slots
3. Test applying slots to multiple days
4. Verify validation works correctly
5. Check for any data inconsistencies
