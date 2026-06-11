# Nomance — Remaining Features Roadmap

> Generated from full codebase audit of `nomance-dating-site-main`.  
> Stack: Next.js 15 · React 19 · Supabase · TypeScript

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 | Broken / completely missing — app won't work without this |
| 🟠 | Partially built — UI exists but logic is absent or wrong |
| 🟡 | Works but with a known flaw or shortcut |
| ✅ | Fully working |

---

## Current State — What's Already Built

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (email + Google OAuth) | ✅ | Middleware-protected routes work |
| Onboarding (4-step flow) | ✅ | Basics, intent, values, photos |
| Profile view + edit | ✅ | Photo crop, drag-reorder via react-easy-crop + @hello-pangea/dnd |
| Social / Auras feed | ✅ | Posts, likes/sparks, realtime, block, report |
| Stories upload | ✅ | Supabase Storage, expires_at column, realtime refresh |
| Matches / Discovery (swipe cards) | ✅ | Like/pass, mutual match detection, mood filter |
| Messages list | ✅ | Shows accepted matches, last message preview |
| Chat (`/messages/[id]`) | ✅ | Realtime via Supabase channel, typing indicator, online presence |
| Search | ✅ | Name, age range, intent filter, Haversine distance |
| Events & Interest Rooms UI | 🟠 | Tables exist, page renders — see item 7 below |
| Coach page UI | 🟠 | Calls `/api/coach` which doesn't exist — see item 1 |

---

## Features to Build (Priority Order)

---

### 1. 🔴 `/api/coach` — AI Coach API Route

**What's broken:** `src/app/coach/page.tsx` calls `fetch("/api/coach", ...)` for three actions — bio analysis, photo tips, and free-form chat. The route `src/app/api/coach/route.ts` does not exist. The entire Coach page is dead.

**What to build:**

```
src/app/api/coach/
└── route.ts
```

The page sends a `POST` with a JSON body containing `{ action, bio?, photos?, messages?, profile? }`.

- `action: "analyze_bio"` → returns `{ tips: string[] }`
- `action: "analyze_photos"` → returns `{ tips: string[] }`
- `action: "chat"` → returns `{ message: string }`

Use Claude (`claude-sonnet-4-20250514`) or OpenAI. System prompt should reference the user's profile (intent, values, bio) as context.

**DB changes:** None.

---

### 2. 🔴 Unread Message Count + Navbar Badge

**What's broken:** The messages list page has no unread logic. The navbar has no badge. Users don't know they have new messages.

**What to build:**

- In `src/app/messages/page.tsx`: count messages where `sender_id != currentUser.id AND seen_at IS NULL` per match. Display count on each chat row.
- In `src/components/navbar.tsx`: show a red dot / number badge on the Messages icon using a global unread count (fetch on mount, subscribe to realtime inserts on `messages` table filtered to current user's matches).

**DB changes:** None — `seen_at` column already exists on `messages`.

---

### 3. 🟠 Mark Messages as Seen (Read Receipts)

**What's broken:** `seen_at` and `delivered_at` columns exist in the `messages` table and the double-checkmark icons are rendered in the chat UI. But the page never calls `UPDATE messages SET seen_at = NOW()` when a message is viewed. The checkmarks are always grey.

**What to build:**

In `src/app/messages/[id]/page.tsx`:

```ts
// Call this when chat page mounts and when new messages arrive
const markMessagesAsSeen = async () => {
  await supabase
    .from("messages")
    .update({ seen_at: new Date().toISOString() })
    .eq("match_id", matchId)
    .neq("sender_id", user.id)
    .is("seen_at", null);
};
```

Also update `delivered_at` on message insert for the recipient side.

**DB changes:** None.

---

### 4. 🔴 Discovery History Filter (Stop Showing Same Profiles)

**What's broken:** `discovery_history` table exists in the DB but the matches/discovery page has this comment:

```ts
// Skip discovery_history for now - simplified approach
setDailyLimitReached(false);
```

Discovery just fetches `.limit(5)` with no filtering. Users see the same 5 people every time they open the app.

**What to build:**

After fetching the current user's matches and likes, exclude already-seen profiles:

```ts
// Fetch IDs already liked or passed
const { data: history } = await supabase
  .from("discovery_history")
  .select("seen_user_id")
  .eq("user_id", activeUser.id);

const seenIds = history?.map(h => h.seen_user_id) ?? [];

// Also exclude already-matched users
const matchedIds = [...];

const { data: profiles } = await supabase
  .from("profiles")
  .select("*")
  .neq("id", activeUser.id)
  .not("id", "in", `(${[...seenIds, ...matchedIds].join(",")})`)
  .limit(10);
```

On every like/pass action, insert into `discovery_history`.

**DB changes:** Verify `discovery_history` has `user_id` and `seen_user_id` columns (check migration/database-setup.sql).

---

### 5. 🔴 Implement the Matching Algorithm

**What's broken:** `src/lib/matching_algorithm.md` describes a scoring system (intent 50%, values 30%, quality score 20%) but it is never implemented. Discovery is just a raw unordered `.limit(5)` query.

**What to build:**

Create `src/lib/matching.ts`:

```ts
export function scoreMatch(viewer: Profile, candidate: Profile): number {
  // Intent score (0–1, multiplied by 0.5)
  const intentScore = getIntentScore(viewer.intent, candidate.intent);

  // Values score: shared values / max possible, multiplied by 0.3
  const sharedValues = viewer.values.filter(v => candidate.values.includes(v)).length;
  const valuesScore = Math.min(sharedValues * 0.1, 1.0);

  // Quality score multiplier (0–1.2+)
  const qualityMultiplier = (candidate.quality_score ?? 100) / 100;

  return (intentScore * 0.5 + valuesScore * 0.3) * qualityMultiplier;
}
```

Apply in the discovery page: fetch a larger pool (50 profiles), score them client-side, sort descending, take top 10.

**DB changes:** None — `quality_score`, `intent`, and `values` already exist on `profiles`.

---

### 6. 🟠 Location Capture (GPS → Profile)

**What's broken:** `location_lat` / `location_lng` columns exist on `profiles` and search uses them for distance filtering. But there is no place in the app that asks for location permission and persists coordinates. Distance filter silently shows everyone when coordinates are null.

**What to build:**

In `src/app/onboarding/page.tsx` (step "final") and `src/app/profile/edit/page.tsx`:

```ts
const requestLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setFormData(prev => ({
        ...prev,
        location_lat: pos.coords.latitude,
        location_lng: pos.coords.longitude,
      }));
    },
    (err) => console.warn("Location denied:", err)
  );
};
```

Save to Supabase on profile update. Show a subtle "Enable location for better matches" prompt — don't block the flow if denied.

**DB changes:** None.

---

### 7. 🟠 Event Creation UI

**What's broken:** The `events`, `event_participants`, `interest_rooms`, and `room_members` tables are created in `migration/complete-realtime-setup.sql`. The events page fetches and displays them. But there is no UI for anyone to create an event or room — so the page always shows empty state.

**What to build:**

Add a "Create Event" dialog/sheet in `src/app/events/page.tsx` with fields:
- Title, description, date/time, location, max participants, category/interest tags.

Add a "Create Room" dialog for interest rooms with: room name, topic/interest, and optional invite-only toggle.

On submit, `supabase.from("events").insert(...)` / `supabase.from("interest_rooms").insert(...)`.

**DB changes:** Add `created_by UUID REFERENCES profiles(id)` to `events` and `interest_rooms` if not already present (check migration).

---

### 8. 🟠 Story Reply Handler

**What's broken:** Inside the story viewer in `src/app/social/page.tsx` (around line 1089), there is an `<Input placeholder="Say something..." />` and a send button. Neither has any event handler — it's pure decoration.

**What to build:**

Wire the input to a message send. When a user replies to a story, it should:
1. Find or create the `match` between the two users (or create a pending one).
2. Insert a message into the `messages` table referencing that match.
3. Redirect the sender to `/messages/[matchId]` or show a toast "Reply sent!".

```ts
const handleStoryReply = async (storyOwnerId: string, replyText: string) => {
  // 1. Upsert a match
  const { data: match } = await supabase.from("matches")
    .upsert({ user_1: user.id, user_2: storyOwnerId, status: "pending" }, { onConflict: "user_1,user_2" })
    .select().single();

  // 2. Send message
  await supabase.from("messages").insert({
    match_id: match.id,
    sender_id: user.id,
    content: replyText,
  });

  toast.success("Reply sent!");
};
```

**DB changes:** None.

---

### 9. 🟡 Profile Views Tracking

**What's broken:** In `src/app/profile/page.tsx`:

```ts
profileViews: Math.floor(Math.random() * 200) + 50,  // FAKE
```

This is a random number. Displayed on the profile stats dashboard but means nothing.

**What to build:**

Create a `profile_views` table:

```sql
CREATE TABLE profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_profile_views_viewed_id ON profile_views(viewed_id);
```

In `src/app/profile/[id]/page.tsx` (public profile view), insert on mount:

```ts
await supabase.from("profile_views").insert({
  viewer_id: currentUser.id,
  viewed_id: profileId,
});
```

In `src/app/profile/page.tsx`, query `COUNT(*)` from `profile_views` where `viewed_id = user.id`.

**DB changes:** New `profile_views` table — add migration file.

---

### 10. 🟡 Quality Score Updates

**What's broken:** `quality_score` defaults to 100 and is never changed. The matching algorithm doc defines clear rules but nothing implements them.

**What to build:**

Create a Supabase Edge Function or a Next.js cron API route that runs nightly (or event-triggered):

| Event | Score Change |
|-------|-------------|
| Reply to message within 6 hours | +5 |
| Received a report | −20 |
| Ghosted a mutual match (no reply in 7 days) | −10 |
| Match rate milestone | +10 |

For real-time triggers (reports, message reply time): use Supabase `postgres_changes` listener or a trigger function in the DB itself.

**DB changes:** Add a `quality_score_log` table for auditability (optional).

---

### 11. 🔴 Push Notifications

**What's broken:** There is zero notification infrastructure. No in-app notification center, no push, no email. Users have no way to know about new matches or messages unless they have the app open.

**What to build (phased):**

**Phase 1 — In-app notification center:**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,  -- 'new_match' | 'new_message' | 'new_like' | 'event_reminder'
  title TEXT,
  body TEXT,
  read_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```
Add a bell icon to `src/components/navbar.tsx` with a badge and dropdown list.

**Phase 2 — Web Push (PWA):**
- Add `next-pwa` and a service worker.
- Register push subscription on login.
- Store `push_subscription JSONB` on the `profiles` table.
- Trigger push from a Supabase Edge Function on new message/match insert.

**Phase 3 — Email (transactional):**
- Integrate Resend or SendGrid.
- Send "You have a new match!" emails via a Supabase webhook on `matches` insert with `status = accepted`.

**DB changes:** New `notifications` table (Phase 1), `push_subscription JSONB` column on `profiles` (Phase 2).

---

## DB Migration Checklist

Before deploying, run these migrations in order:

```
migration/database-setup.sql              ✅ already exists
migration/complete-realtime-setup.sql     ✅ already exists (events/rooms)
migration/add-missing-columns.sql         ✅ already exists
migration/fix-profiles-table.sql          ✅ already exists

-- NEW migrations to write:
migration/add-profile-views.sql           🔴 needed for item 9
migration/add-notifications.sql           🔴 needed for item 11
migration/add-quality-score-log.sql       🟡 optional for item 10
```

---

## Schema Inconsistency Note

`dbschema.txt` documents a `conversations` table sitting between `matches` and `messages`. The actual migration skips this and puts `match_id` directly on `messages`. The code uses `match_id`. This works fine for 1:1 chats. If you ever need group chats, you'll need to migrate to the 3-layer model (`matches → conversations → messages`). Not urgent — just don't build new features that assume the old schema doc.

---

## Summary Table

| # | Feature | File(s) to touch | DB change? | Effort |
|---|---------|-----------------|------------|--------|
| 1 | `/api/coach` route | `src/app/api/coach/route.ts` (create) | No | Small |
| 2 | Unread badge | `messages/page.tsx`, `navbar.tsx` | No | Small |
| 3 | Mark messages seen | `messages/[id]/page.tsx` | No | Small |
| 4 | Discovery history filter | `matches/page.tsx` | No | Small |
| 5 | Matching algorithm | `src/lib/matching.ts` (create), `matches/page.tsx` | No | Medium |
| 6 | Location capture | `onboarding/page.tsx`, `profile/edit/page.tsx` | No | Small |
| 7 | Event creation UI | `events/page.tsx` | Maybe (created_by col) | Medium |
| 8 | Story reply handler | `social/page.tsx` | No | Small |
| 9 | Profile views tracking | `profile/[id]/page.tsx`, `profile/page.tsx` | Yes (new table) | Small |
| 10 | Quality score updates | Edge Function or cron API | Optional (log table) | Medium |
| 11 | Push notifications | `navbar.tsx`, service worker, Edge Function | Yes (new table + col) | Large |