-- ============================================================
-- NOMANCE MASTER CONSOLIDATED DATABASE SETUP
-- Safe to run in Supabase SQL Editor
-- Sets up all tables, relationships, RLS policies, storage buckets,
-- RPC functions, triggers, and demo data.
-- ============================================================

-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  birth_date DATE,
  gender TEXT,
  intent TEXT DEFAULT 'long_term',
  values TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  quality_score INTEGER DEFAULT 100,
  profile_strength INTEGER DEFAULT 80,
  mood TEXT DEFAULT 'vibing',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  push_subscription JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist on profiles even if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'long_term';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS values TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lat FLOAT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lng FLOAT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_strength INTEGER DEFAULT 80;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mood TEXT DEFAULT 'vibing';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_subscription JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_mood ON public.profiles(mood);

-- 3. POSTS TABLE (AURAS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  media_type TEXT DEFAULT 'image',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- 4. STORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);

-- 5. POST SKIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_skips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_skips_user_id ON public.post_skips(user_id);

-- 6. USER BLOCKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- 7. MATCHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_1, user_2)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_1 ON public.matches(user_1);
CREATE INDEX IF NOT EXISTS idx_matches_user_2 ON public.matches(user_2);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- 8. MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_seen_at ON public.messages(match_id, seen_at);

-- 9. PROFILE VIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON public.profile_views(viewed_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON public.profile_views(viewer_id);

-- 10. DISCOVERY HISTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.discovery_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  discovered_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT, -- 'like' | 'skip'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_history_user ON public.discovery_history(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_history_user_created ON public.discovery_history(user_id, created_at);

-- 11. REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meetup', -- 'meetup' | 'speed_dating' | 'interest_room' | 'online'
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 15,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

-- 13. EVENT PARTICIPANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);

-- 14. INTEREST ROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interest_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  topic TEXT,
  invite_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interest_rooms_created_by ON public.interest_rooms(created_by);

-- 15. ROOM MEMBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.interest_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_room ON public.room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON public.room_members(user_id);

-- 16. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_match' | 'new_message' | 'new_like' | 'event_reminder' | 'profile_view' | 'story_reply'
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 17. QUALITY SCORE LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quality_score_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  score_change INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_score_log_user ON public.quality_score_log(user_id);

-- ============================================================
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_skips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_score_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

  -- Posts
  DROP POLICY IF EXISTS "Public posts are readable" ON public.posts;
  DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
  DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
  DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

  -- Stories
  DROP POLICY IF EXISTS "Public stories are readable" ON public.stories;
  DROP POLICY IF EXISTS "Users can insert their own stories" ON public.stories;
  DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;

  -- Post Skips
  DROP POLICY IF EXISTS "Users can read their own post_skips" ON public.post_skips;
  DROP POLICY IF EXISTS "Users can insert their own post_skips" ON public.post_skips;

  -- User Blocks
  DROP POLICY IF EXISTS "Users can read blocks involving them" ON public.user_blocks;
  DROP POLICY IF EXISTS "Users can insert their own blocks" ON public.user_blocks;

  -- Matches
  DROP POLICY IF EXISTS "Users can read their matches" ON public.matches;
  DROP POLICY IF EXISTS "Users can insert matches" ON public.matches;
  DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;
  DROP POLICY IF EXISTS "Users can delete their matches" ON public.matches;

  -- Messages (FIXED: Allow recipients to read & update read receipts!)
  DROP POLICY IF EXISTS "Users can read their messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can update messages in their matches" ON public.messages;

  -- Profile Views
  DROP POLICY IF EXISTS "Users can read views on their profile" ON public.profile_views;
  DROP POLICY IF EXISTS "Users can insert their own profile views" ON public.profile_views;

  -- Discovery History
  DROP POLICY IF EXISTS "Users can read their discovery history" ON public.discovery_history;
  DROP POLICY IF EXISTS "Users can insert their discovery history" ON public.discovery_history;

  -- Reports
  DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;

  -- Events
  DROP POLICY IF EXISTS "Public events are readable" ON public.events;
  DROP POLICY IF EXISTS "Users can insert events" ON public.events;
  DROP POLICY IF EXISTS "Users can update their events" ON public.events;

  -- Event Participants
  DROP POLICY IF EXISTS "Public event participants are readable" ON public.event_participants;
  DROP POLICY IF EXISTS "Users can join events" ON public.event_participants;
  DROP POLICY IF EXISTS "Users can leave events" ON public.event_participants;

  -- Interest Rooms
  DROP POLICY IF EXISTS "Public rooms are readable" ON public.interest_rooms;
  DROP POLICY IF EXISTS "Users can create rooms" ON public.interest_rooms;

  -- Room Members
  DROP POLICY IF EXISTS "Public room members are readable" ON public.room_members;
  DROP POLICY IF EXISTS "Users can join rooms" ON public.room_members;
  DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_members;

  -- Notifications
  DROP POLICY IF EXISTS "Users can read their notifications" ON public.notifications;
  DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
  DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

  -- Quality Score Log
  DROP POLICY IF EXISTS "Users can read their score log" ON public.quality_score_log;
  DROP POLICY IF EXISTS "System can insert score log" ON public.quality_score_log;
END $$;

-- Profiles Policies
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Posts Policies
CREATE POLICY "Public posts are readable" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Stories Policies
CREATE POLICY "Public stories are readable" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Users can insert their own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- Post Skips Policies
CREATE POLICY "Users can read their own post_skips" ON public.post_skips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own post_skips" ON public.post_skips FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Blocks Policies
CREATE POLICY "Users can read blocks involving them" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);
CREATE POLICY "Users can insert their own blocks" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Matches Policies
CREATE POLICY "Users can read their matches" ON public.matches FOR SELECT USING (auth.uid() = user_1 OR auth.uid() = user_2);
CREATE POLICY "Users can insert matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user_1 OR auth.uid() = user_2);
CREATE POLICY "Users can update their matches" ON public.matches FOR UPDATE USING (auth.uid() = user_1 OR auth.uid() = user_2) WITH CHECK (auth.uid() = user_1 OR auth.uid() = user_2);
CREATE POLICY "Users can delete their matches" ON public.matches FOR DELETE USING (auth.uid() = user_1 OR auth.uid() = user_2);

-- Messages Policies (CRITICAL FIX: BOTH SENDER AND RECIPIENT CAN READ & UPDATE SEEN STATUS)
CREATE POLICY "Users can read their messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id
  OR match_id IN (
    SELECT m.id FROM public.matches m
    WHERE m.user_1 = auth.uid() OR m.user_2 = auth.uid()
  )
);

CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
  AND match_id IN (
    SELECT m.id FROM public.matches m
    WHERE m.user_1 = auth.uid() OR m.user_2 = auth.uid()
  )
);

CREATE POLICY "Users can update messages in their matches" ON public.messages FOR UPDATE USING (
  match_id IN (
    SELECT m.id FROM public.matches m
    WHERE m.user_1 = auth.uid() OR m.user_2 = auth.uid()
  )
);

-- Profile Views Policies
CREATE POLICY "Users can read views on their profile" ON public.profile_views FOR SELECT USING (auth.uid() = viewed_id OR auth.uid() = viewer_id);
CREATE POLICY "Users can insert their own profile views" ON public.profile_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Discovery History Policies
CREATE POLICY "Users can read their discovery history" ON public.discovery_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their discovery history" ON public.discovery_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Events Policies
CREATE POLICY "Public events are readable" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their events" ON public.events FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- Event Participants Policies
CREATE POLICY "Public event participants are readable" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events" ON public.event_participants FOR DELETE USING (auth.uid() = user_id);

-- Interest Rooms Policies
CREATE POLICY "Public rooms are readable" ON public.interest_rooms FOR SELECT USING (true);
CREATE POLICY "Users can create rooms" ON public.interest_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Room Members Policies
CREATE POLICY "Public room members are readable" ON public.room_members FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_members FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can read their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Quality Score Log Policies
CREATE POLICY "Users can read their score log" ON public.quality_score_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert score log" ON public.quality_score_log FOR INSERT WITH CHECK (true);

-- ============================================================
-- 19. RPC FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: get_recommended_profiles
CREATE OR REPLACE FUNCTION public.get_recommended_profiles(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.id != p_user_id
    -- Exclude already discovered profiles
    AND p.id NOT IN (
      SELECT dh.discovered_user_id
      FROM public.discovery_history dh
      WHERE dh.user_id = p_user_id
    )
    -- Exclude already matched profiles (both directions)
    AND p.id NOT IN (
      SELECT m.user_2 FROM public.matches m WHERE m.user_1 = p_user_id
      UNION
      SELECT m.user_1 FROM public.matches m WHERE m.user_2 = p_user_id
    )
    -- Exclude blocked users (both directions)
    AND p.id NOT IN (
      SELECT ub.blocked_id FROM public.user_blocks ub WHERE ub.blocker_id = p_user_id
      UNION
      SELECT ub.blocker_id FROM public.user_blocks ub WHERE ub.blocked_id = p_user_id
    )
  ORDER BY p.last_active DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- Function: increment_likes_count
CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- Trigger: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, quality_score, profile_strength, mood)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    100,
    80,
    'vibing'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: notify on match
CREATE OR REPLACE FUNCTION public.handle_new_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  u1_name TEXT;
  u2_name TEXT;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    SELECT COALESCE(full_name, 'Someone') INTO u1_name FROM public.profiles WHERE id = NEW.user_1;
    SELECT COALESCE(full_name, 'Someone') INTO u2_name FROM public.profiles WHERE id = NEW.user_2;

    -- Notify user 1
    INSERT INTO public.notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_1,
      'new_match',
      'It''s a Match! 🎉',
      format('You matched with %s!', u2_name),
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_2)
    );

    -- Notify user 2
    INSERT INTO public.notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_2,
      'new_match',
      'It''s a Match! 🎉',
      format('You matched with %s!', u1_name),
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_1)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_match ON public.matches;
CREATE TRIGGER trigger_notify_on_match
  AFTER INSERT OR UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_match();

-- Trigger: notify on message
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Determine recipient
  SELECT CASE WHEN m.user_1 = NEW.sender_id THEN m.user_2 ELSE m.user_1 END
  INTO recipient_id
  FROM public.matches m
  WHERE m.id = NEW.match_id;

  IF recipient_id IS NOT NULL THEN
    SELECT COALESCE(full_name, 'Someone') INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

    INSERT INTO public.notifications (user_id, type, title, body, metadata)
    VALUES (
      recipient_id,
      'new_message',
      format('New message from %s', sender_name),
      substring(NEW.content from 1 for 100),
      jsonb_build_object('match_id', NEW.match_id, 'sender_id', NEW.sender_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_message ON public.messages;
CREATE TRIGGER trigger_notify_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();

-- ============================================================
-- 20. STORAGE BUCKETS SETUP
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile_photos', 'profile_photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public Access Posts Storage" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload posts" ON storage.objects;
  DROP POLICY IF EXISTS "Public Access Stories Storage" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload stories" ON storage.objects;
  DROP POLICY IF EXISTS "Public Access Profile Photos Storage" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload profile photos" ON storage.objects;
  DROP POLICY IF EXISTS "Public Access Avatars Storage" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
END $$;

CREATE POLICY "Public Access Posts Storage" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Anyone can upload posts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Public Access Stories Storage" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
CREATE POLICY "Anyone can upload stories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stories');

CREATE POLICY "Public Access Profile Photos Storage" ON storage.objects FOR SELECT USING (bucket_id = 'profile_photos');
CREATE POLICY "Anyone can upload profile photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile_photos');

CREATE POLICY "Public Access Avatars Storage" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- ============================================================
-- 21. REALTIME PUBLICATION SETUP
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.interest_rooms;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
