CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);

ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read views on their profile" ON profile_views;
CREATE POLICY "Users can read views on their profile"
  ON profile_views FOR SELECT
  USING (auth.uid() = viewed_id OR auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Users can insert their own profile views" ON profile_views;
CREATE POLICY "Users can insert their own profile views"
  ON profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);
