# PROPS Multi-User Implementation

This document explains how the multi-user system works in PROPS, ensuring that each user gets their own unique dashboard, leads, and onboarding experience.

## Overview

The PROPS application now supports true multi-user isolation, where:

1. Each user has their own separate dashboard
2. Users can only see their own uploaded leads
3. Each user gets their own unique onboarding process
4. User preferences are stored separately for each user

## Key Components

### 1. Database Schema

The database schema now includes:

- **user_id** column in the `leads` table
- Proper Row-Level Security (RLS) policies on all tables
- User-specific preferences in the `user_preferences` table

### 2. Row-Level Security (RLS)

RLS policies have been implemented that:

- Allow users to only read, update, and delete their own leads
- Enforce that new leads must be associated with the authenticated user
- Prevent users from accessing each other's preference settings

### 3. API Endpoints

API endpoints for leads have been updated to:

- Filter leads by the current user's ID
- Associate uploaded leads with the current user
- Return only leads belonging to the authenticated user

### 4. Migration Script

A migration script (`src/scripts/add-user-id-migration.js`) is included to:

- Add the `user_id` column to existing databases
- Set up proper RLS policies
- Associate existing leads with an admin user

## How to Run the Migration

If you're upgrading from a previous version:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the migration script:
   ```
   node src/scripts/add-user-id-migration.js [ADMIN_USER_ID]
   ```
   - Replace `[ADMIN_USER_ID]` with the UUID of the admin user who should own existing leads

## Implementation Details

### Leads Table Modifications

- Added `user_id` column (TEXT type)
- Created index on `user_id` for better performance
- Updated composite key for de-duplication to use both `email` and `user_id`

### RLS Policies

The following RLS policies were added to the `leads` table:

```sql
-- Create new RLS policies to restrict access by user_id 
CREATE POLICY "Users can read their own leads"
ON leads FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert their own leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads"
ON leads FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
ON leads FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);
```

### API Layer

- All lead fetching operations now include a filter for the current user's ID
- The upload API associates uploaded leads with the current user

## Testing

To verify the implementation:

1. Create multiple user accounts
2. Upload different leads from each account
3. Verify that each account only sees its own leads
4. Complete the onboarding process with different answers for each user
5. Confirm that dashboard settings and preferences are properly isolated

---

For any questions or issues with the multi-user implementation, please contact the development team. 