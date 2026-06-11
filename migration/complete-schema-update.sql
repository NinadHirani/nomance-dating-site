-- ============================================================
-- NOMANCE COMPLETE SCHEMA UPDATE MIGRATION
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to profiles table
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_strength INTEGER DEFAULT 80;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- 2. Create events table
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meetup',
  location TEXT,
  event_date TIMESTAMP,
  max_participants INTEGER DEFAULT 15,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interest_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are readable"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Users can insert events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their events"
  ON events FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 3. Create event_participants table
-- ============================================================
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public event participants are readable"
  ON event_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join events"
  ON event_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events"
  ON event_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Create interest_rooms table
-- ============================================================
CREATE TABLE IF NOT EXISTS interest_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  topic TEXT,
  invite_only BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interest_rooms_created_by ON interest_rooms(created_by);

ALTER TABLE interest_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public rooms are readable"
  ON interest_rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can create rooms"
  ON interest_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- 5. Create room_members table
-- ============================================================
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES interest_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public room members are readable"
  ON room_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join rooms"
  ON room_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON room_members FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create notifications table
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'new_match' | 'new_message' | 'new_like' | 'event_reminder' | 'profile_view' | 'story_reply'
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 7. Create quality_score_log table
-- ============================================================
CREATE TABLE IF NOT EXISTS quality_score_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  score_change INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_score_log_user ON quality_score_log(user_id);

ALTER TABLE quality_score_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their score log"
  ON quality_score_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert score log"
  ON quality_score_log FOR INSERT
  WITH CHECK (true);

-- 8. Create RPC function: get_recommended_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION get_recommended_profiles(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS SETOF profiles
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.id != p_user_id
    -- Exclude already discovered profiles
    AND p.id NOT IN (
      SELECT dh.discovered_user_id
      FROM discovery_history dh
      WHERE dh.user_id = p_user_id
    )
    -- Exclude already matched profiles (both directions)
    AND p.id NOT IN (
      SELECT m.user_2 FROM matches m WHERE m.user_1 = p_user_id
      UNION
      SELECT m.user_1 FROM matches m WHERE m.user_2 = p_user_id
    )
    -- Exclude blocked users (both directions)
    AND p.id NOT IN (
      SELECT ub.blocked_id FROM user_blocks ub WHERE ub.blocker_id = p_user_id
      UNION
      SELECT ub.blocker_id FROM user_blocks ub WHERE ub.blocked_id = p_user_id
    )
  ORDER BY p.quality_score DESC, p.last_active DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

-- 9. Create RPC function: increment_likes_count
-- ============================================================
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$;

-- 10. Fix messages RLS - allow recipients to read messages too
-- ============================================================
DROP POLICY IF EXISTS "Users can read their messages" ON messages;
CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR match_id IN (
      SELECT m.id FROM matches m
      WHERE m.user_1 = auth.uid() OR m.user_2 = auth.uid()
    )
  );

-- Allow message seen_at updates (for read receipts)
DROP POLICY IF EXISTS "Users can update messages in their matches" ON messages;
CREATE POLICY "Users can update messages in their matches"
  ON messages FOR UPDATE
  USING (
    match_id IN (
      SELECT m.id FROM matches m
      WHERE m.user_1 = auth.uid() OR m.user_2 = auth.uid()
    )
  );

-- Allow matches deletion (for unmatch feature)
DROP POLICY IF EXISTS "Users can delete their matches" ON matches;
CREATE POLICY "Users can delete their matches"
  ON matches FOR DELETE
  USING (auth.uid() = user_1 OR auth.uid() = user_2);

-- 11. Create trigger: Auto-create notification on new match
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_match()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  matcher_name TEXT;
BEGIN
  -- Only notify when match becomes accepted (mutual)
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    -- Get the matcher's name
    SELECT full_name INTO matcher_name FROM profiles WHERE id = NEW.user_1;

    -- Notify user_2 (the person who originally sent the like that just got reciprocated)
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_2,
      'new_match',
      'New Match! 🎉',
      COALESCE(matcher_name, 'Someone') || ' matched with you!',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_1)
    );

    -- Also notify user_1
    SELECT full_name INTO matcher_name FROM profiles WHERE id = NEW.user_2;
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_1,
      'new_match',
      'New Match! 🎉',
      COALESCE(matcher_name, 'Someone') || ' matched with you!',
      jsonb_build_object('match_id', NEW.id, 'other_user_id', NEW.user_2)
    );
  END IF;

  -- Notify on new like (pending match)
  IF NEW.status = 'pending' AND OLD IS NULL THEN
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_2,
      'new_like',
      'Someone''s interested! ✨',
      'You have a new spark! Check your matches.',
      jsonb_build_object('match_id', NEW.id, 'from_user_id', NEW.user_1)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_match ON matches;
CREATE TRIGGER trigger_notify_on_match
  AFTER INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_match();

-- 12. Create trigger: Auto-create notification on new message
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  sender_name TEXT;
  recipient_id UUID;
  match_record RECORD;
BEGIN
  -- Get match info
  SELECT * INTO match_record FROM matches WHERE id = NEW.match_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- Determine recipient
  IF NEW.sender_id = match_record.user_1 THEN
    recipient_id := match_record.user_2;
  ELSE
    recipient_id := match_record.user_1;
  END IF;

  -- Get sender name
  SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (
    recipient_id,
    'new_message',
    COALESCE(sender_name, 'Someone') || ' sent a message',
    LEFT(NEW.content, 100),
    jsonb_build_object('match_id', NEW.match_id, 'message_id', NEW.id, 'sender_id', NEW.sender_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_message ON messages;
CREATE TRIGGER trigger_notify_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_message();

-- 13. Create trigger: Notification on profile view
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_profile_view()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  viewer_name TEXT;
BEGIN
  SELECT full_name INTO viewer_name FROM profiles WHERE id = NEW.viewer_id;

  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (
    NEW.viewed_id,
    'profile_view',
    'Profile View 👀',
    COALESCE(viewer_name, 'Someone') || ' viewed your profile',
    jsonb_build_object('viewer_id', NEW.viewer_id)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_on_profile_view ON profile_views;
CREATE TRIGGER trigger_notify_on_profile_view
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_profile_view();

-- 14. Create quality score update function
-- ============================================================
CREATE OR REPLACE FUNCTION update_quality_score(
  p_user_id UUID,
  p_event_type TEXT,
  p_change INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_score INTEGER;
  new_score INTEGER;
BEGIN
  SELECT quality_score INTO current_score FROM profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RETURN 100; END IF;

  new_score := GREATEST(0, LEAST(200, COALESCE(current_score, 100) + p_change));

  UPDATE profiles SET quality_score = new_score WHERE id = p_user_id;

  INSERT INTO quality_score_log (user_id, event_type, score_change, new_score)
  VALUES (p_user_id, p_event_type, p_change, new_score);

  RETURN new_score;
END;
$$;

-- 15. Auto-update quality score on report
-- ============================================================
CREATE OR REPLACE FUNCTION quality_on_report()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_quality_score(NEW.reported_user_id, 'received_report', -20);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_quality_on_report ON reports;
CREATE TRIGGER trigger_quality_on_report
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION quality_on_report();

-- 16. Enable realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;

-- Done!
-- ============================================================
