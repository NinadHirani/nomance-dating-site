# How to Add Username and Bio Columns to Supabase

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste this SQL:

```sql
-- Add bio column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add username column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
```

5. Click "Run" button
6. You should see: "Success. No rows returned"

## Option 2: Using SQL Migration Files

1. Run the migration file directly:
```bash
psql -h [your-supabase-host] -d [your-database] -U [your-user] -f add-missing-columns.sql
```

## Verify the Columns Exist

After running the SQL, go to:
1. Supabase Dashboard → SQL Editor
2. Run this query:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='profiles' ORDER BY ordinal_position;
```

You should see both `bio` and `username` columns in the results.

## Once Columns Are Added

The website is already set up to use these fields:
- Username: Edit Profile page → Username field (auto-formats to lowercase)
- Bio: Edit Profile page → Your Bio (Aura) field (500 character limit)

Both will automatically save when you click "Save Profile Changes"
