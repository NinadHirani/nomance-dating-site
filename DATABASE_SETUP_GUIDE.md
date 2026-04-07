# Database & Storage Setup Guide

## ✅ What's Been Done

1. **Storage Buckets Created:**
   - ✅ `posts` bucket - for aura/post media (images & videos)
   - ✅ `stories` bucket - for temporary story media

2. **Database Schema File Created:**
   - `database-setup.sql` - Contains all table definitions with proper relationships, indexes, and RLS policies

## 📋 Setup Instructions

### Step 1: Execute SQL Schema

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `database-setup.sql` and paste it into the editor
6. Click **Run** button
7. Wait for execution to complete (should see ✅ for each statement)

### Step 2: Verify Tables

After running the SQL, you should see these tables in your Supabase dashboard under **Table Editor**:
- `profiles` - User profiles with bio, intent, values, etc.
- `posts` - Auras/posts with media support
- `stories` - Temporary 24-hour stories with media
- `post_skips` - Track skipped posts
- `user_blocks` - Block users
- `matches` - Match history between users
- `messages` - Messages between matched users
- `discovery_history` - Track user discovery
- `reports` - Report posts/users

### Step 3: Test Upload

Try uploading a story or aura and it should:
1. Upload media to Supabase Storage
2. Save metadata to database
3. Appear in real-time on the feed

## 🎯 Features Now Available

### Stories (24-hour temporary media)
- Upload images or videos
- Auto-expires after 24 hours
- Real-time display in feed
- Shown at top of homefeed

### Posts/Auras (permanent content)
- Upload images or videos
- Optional text content
- Real-time display
- Like/engagement tracking
- User can delete their own posts

### Database Features
- ✅ Real-time updates with Supabase subscriptions
- ✅ Proper indexing for fast queries
- ✅ Row Level Security (RLS) for data privacy
- ✅ Foreign key relationships
- ✅ Cascading deletes
- ✅ Timestamps for all records

## 🔐 Security

- All tables have Row Level Security enabled
- Users can only modify their own data
- Profiles are publicly readable (for search)
- Blocked content is filtered automatically
- Reports are tracked for moderation

## 🚀 Next Steps

1. Run the database setup SQL
2. Test by uploading a story in the app
3. Verify it appears in real-time on the feed
4. Upload an aura/post and verify it displays correctly

## 📝 Table Structure

### profiles
```
- id (UUID, PRIMARY KEY - links to auth.users)
- full_name, birth_date, gender
- bio, avatar_url
- intent (relationship type)
- values (array of chosen values)
- location_lat, location_lng
- quality_score, mood
- created_at, updated_at
```

### posts
```
- id (UUID, auto-generated)
- user_id (references profiles)
- content (text)
- image_url (media URL from storage)
- media_type (image or video)
- likes_count
- created_at, updated_at
```

### stories
```
- id (UUID, auto-generated)
- user_id (references profiles)
- image_url (media URL from storage)
- media_type (image or video)
- expires_at (24 hours from creation)
- created_at
```

## 🆘 Troubleshooting

**Upload fails:**
- Check storage bucket permissions in Supabase dashboard
- Verify .env file has correct credentials

**Real-time not working:**
- Enable Realtime in Supabase dashboard: Project Settings > Realtime
- Make sure subscription listeners are enabled in code

**Queries return empty:**
- Check RLS policies in SQL
- Verify you're authenticated as the correct user
- Check admin bypass is setting the correct user ID
