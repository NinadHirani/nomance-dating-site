// Shared shapes for rows read from Supabase and for the demo data.
// Fields are optional because pages select different columns and demo rows are partial.

export interface ProfileRow {
  id: string;
  username?: string | null;
  full_name?: string | null;
  bio?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  intent?: string;
  intents?: string[] | null;
  values?: string[];
  photos?: string[] | null;
  avatar_url?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  quality_score?: number;
  profile_strength?: number | null;
  mood?: string | null;
  lifestyle?: { sleep?: string; fitness?: string; drinking?: string; smoking?: string } | null;
  last_active?: string | null;
  created_at?: string;
}

export interface PostRow {
  id: string;
  user_id: string;
  content: string | null;
  image_url?: string | null;
  media_type?: string | null;
  likes_count?: number | null;
  created_at: string;
  profiles: ProfileRow;
}

export interface StoryRow {
  id: string;
  user_id: string;
  image_url?: string | null;
  media_type?: string | null;
  expires_at?: string | null;
  created_at?: string;
  profiles: ProfileRow;
}

/** Stories grouped per author, as shown in the story tray. */
export interface StoryGroup {
  user: ProfileRow;
  items: StoryRow[];
}

export interface EventRow {
  id: string;
  title: string;
  description?: string | null;
  event_type: string;
  location?: string | null;
  event_date: string;
  max_participants?: number | null;
  current_participants?: number | null;
  interest_tags?: string[] | null;
  created_by?: string | null;
  /** Joined host profile from Supabase, or the simple host shown for local/demo events. */
  host?: { full_name?: string | null; avatar_url?: string | null; name?: string; avatar?: string | null } | null;
}

export interface RoomRow {
  id: string;
  name: string;
  members?: number;
  active?: boolean;
  is_active?: boolean;
  icon?: unknown;
}

export interface MessageRow {
  id: string;
  match_id?: string;
  sender_id: string;
  content: string;
  created_at: string;
  seen_at?: string | null;
  /** Set on a message shown before the server confirmed it. */
  _optimistic?: boolean;
}

export interface MatchRow {
  id: string;
  user_1: string;
  user_2: string;
  status: string;
  created_at?: string;
}

/** One conversation in the messages list. */
export interface ChatSummary extends MatchRow {
  otherProfile?: ProfileRow;
  lastMessage?: MessageRow | null;
  unreadCount: number;
}
