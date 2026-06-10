# Complete Setup Guide for Username & Bio Editing

## Step 1: Verify Database Columns Exist

Go to **Supabase Dashboard** → **SQL Editor** → **New Query**

Run this SQL to check if columns exist:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('bio', 'username')
ORDER BY ordinal_position;
```

You should see exactly 2 rows with:
- bio | text | YES
- username | text | YES

If you see 0 rows or missing columns, run this to add them:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Verify the columns were created
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

## Step 2: Edit Profile Page Walkthrough

The edit profile page is here: `/profile/edit`

### Fields that should be editable:
1. **Full Name** - Located at top left
2. **Username** - Located at top right (auto-formats to lowercase)
3. **Birth Date** - Located at middle left
4. **Gender** - Located at middle right
5. **What Are You Looking For?** - Full width dropdown
6. **Your Bio (Aura)** - Large text area with 500 character counter

### How to Use:
1. Navigate to `/profile/edit` in your browser
2. Fill in the Username field (optional but recommended)
3. Fill in the Bio field (optional but recommended)
4. Click "Save Profile Changes" button
5. You should see a green success toast and be redirected to /profile

## Step 3: Debug Console Messages

When you save, open **Browser DevTools** (F12 or Inspect) → **Console**

You should see logs like:
```
🔵 Saving profile data: {id: "...", username: "john_doe", bio: "Hello world", ...}
🔵 Username value: "john_doe"
🔵 Bio value: "Hello world"
✅ Profile saved successfully
```

If you see errors instead, note the error message and share it.

## Step 4: Verify Data Was Saved

1. Go to Supabase Dashboard → Table Editor → profiles table
2. Find your user row (by ID)
3. Check the `bio` and `username` columns have your data

## Troubleshooting

### Issue: Fields are empty on page load
**Solution**: Make sure your profile exists in the database. Create one by completing onboarding first.

### Issue: Can't type in Username or Bio fields
**Solution**: Check that there are no readonly or disabled attributes. The fields should be fully editable.

### Issue: Error when saving
**Solution**: Check the console error message. Most common issues:
- Username is already taken (must be unique)
- Database columns don't exist (run Step 1 SQL)
- Not authenticated (go to /auth first)

### Issue: Data doesn't appear after saving
**Solution**:
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser DevTools Console for errors
- Verify in Supabase dashboard that data was actually saved

## Current Implementation Details

**Username Field:**
- Auto-formats to lowercase
- Only allows alphanumeric characters and underscores
- Must be unique
- Optional to fill in

**Bio Field:**
- Max 500 characters (enforced by database)
- Shows live character counter
- Optional to fill in
- Displays on public profile view

**Save Behavior:**
- Both fields save as NULL if empty
- Profile is upserted (created or updated)
- Redirects to /profile after successful save
- Shows success toast notification
