# User Preferences Table Setup

If you encounter errors related to the `user_preferences` table not existing, follow these steps to fix the issue:

## Option 1: Run the SQL in Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the SQL Editor 
4. Copy the contents of `src/db/setup-user-preferences.sql`
5. Paste it into the SQL Editor and run it
6. Refresh your application

## Option 2: Set up a migration function

If you have more advanced needs or want to run migrations programmatically:

1. Create an SQL function in the Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
```

2. Run the check script from the terminal:

```bash
node src/scripts/check-supabase.js
```

## Understanding the Error

The error `User preferences table could not be created or accessed` occurs because:

1. The application is trying to store user preferences (like onboarding status)
2. The required database table doesn't exist yet
3. The API is failing to create the table automatically

## Fallback Behavior

The application is designed to gracefully fall back to using localStorage when the database table isn't available. This means your application will still work, but preferences won't be saved to the database until this issue is resolved.

## Database Table Structure

The `user_preferences` table stores:

- User onboarding status and progress
- Company information (name, size, industry)
- Target preferences (industries, company sizes, roles)

## Troubleshooting

If you see `[UserPreferencesProvider] API error: {}` in the console, it means the provider is falling back to localStorage mode. This is a temporary workaround until the database table is created. 