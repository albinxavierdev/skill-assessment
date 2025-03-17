# Supabase Setup Instructions

## Issue Identified
The database connection is now working correctly with the updated API keys. The column names in the database are using camelCase (without underscores), and we've updated the code to match this schema.

## Steps to Fix

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ewbbyudhpxsfknheuzuw/settings/api

2. Copy the following API keys:
   - **Project API keys** > **anon public** - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** > **service_role secret** - This is your `SUPABASE_SERVICE_ROLE_KEY`

3. Update your `.env.local` file with these new keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ewbbyudhpxsfknheuzuw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key_here
   ```

4. Restart your Next.js development server after updating the keys.

## Database Schema
Based on our tests, your database has a `students` table with the following columns:
- `id` (UUID, primary key)
- `name` (text)
- `email` (text)
- `phone` (text)
- `collegename` (text) - Note: camelCase, not snake_case
- `degree` (text)
- `passingyear` (text or integer) - Note: camelCase, not snake_case
- `domaininterest` (text) - Note: camelCase, not snake_case
- `created_at` (timestamp)

## Code Changes Made
1. Updated the field mapping in `supabaseService.ts` to use camelCase for database columns:
   - `collegeName` → `collegename`
   - `passingYear` → `passingyear`
   - `domainInterest` → `domaininterest`

2. Added additional logging to help diagnose issues

3. Added a specific test for the admin client to verify it can bypass RLS

## Admin Client
The admin client is working correctly and can bypass Row Level Security (RLS). This is important for operations that require elevated privileges, such as:
- Creating users
- Accessing data across all users
- Performing administrative tasks

The admin client is used when the `SUPABASE_SERVICE_ROLE_KEY` environment variable is available, which it is in your current setup.

## Testing
You can test the database connection by running:
```
node test-db-connection.js
```

This will check your database schema, attempt to insert a test student record, and verify that the admin client can bypass RLS.

## Next Steps
1. Continue using the application with the updated code
2. Monitor the logs for any errors
3. If you need to modify the database schema, use the `create_students_table.sql` file as a reference 