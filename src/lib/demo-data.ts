export interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  birth_date: string;
  gender: string;
  intent: string;
  values: string[];
  photos: string[];
  avatar_url: string;
  location_lat: number | null;
  location_lng: number | null;
  quality_score: number;
  profile_strength: number;
  mood: string;
  created_at: string;
}

export const DEMO_PROFILES: Profile[] = [
  {
    id: "d1111111-1111-1111-1111-111111111111",
    username: "maya_sky",
    full_name: "Maya Chen",
    bio: "Architecture designer by day, ceramicist by night. Always down for sunset ramen or scouring flea markets for mid-century lamps. 🍜✨",
    birth_date: "1998-04-12",
    gender: "female",
    intent: "long_term",
    values: ["Creativity", "Kindness", "Ambition", "Adventure"],
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    ],
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    location_lat: 37.7749,
    location_lng: -122.4194,
    quality_score: 115,
    profile_strength: 92,
    mood: "talking",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "d2222222-2222-2222-2222-222222222222",
    username: "liam_peaks",
    full_name: "Liam Vance",
    bio: "Trail runner, vinyl hoarder, and specialty coffee nerd. Looking for someone to trade Spotify playlists and embark on impromptu road trips with. ☕🏔️",
    birth_date: "1996-09-24",
    gender: "male",
    intent: "life_partner",
    values: ["Honesty", "Growth", "Adventure", "Family"],
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
    ],
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    location_lat: 37.7833,
    location_lng: -122.4167,
    quality_score: 125,
    profile_strength: 95,
    mood: "meeting",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "d3333333-3333-3333-3333-333333333333",
    username: "sophia_art",
    full_name: "Sophia Martinez",
    bio: "Curator at an indie gallery. Lover of 35mm film, negronis, and spirited debates on postmodern literature. Tell me about your current hyperfixation! 🎨📚",
    birth_date: "1997-11-03",
    gender: "female",
    intent: "long_term",
    values: ["Creativity", "Freedom", "Kindness", "Honesty"],
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    ],
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    location_lat: 37.7699,
    location_lng: -122.4469,
    quality_score: 110,
    profile_strength: 88,
    mood: "vibing",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "d4444444-4444-4444-4444-444444444444",
    username: "julian_sound",
    full_name: "Julian Brooks",
    bio: "Sound engineer and documentary filmmaker. When not behind mixers, you can catch me bouldering or attempting sourdough baking with questionable results. 🧗‍♂️🎧",
    birth_date: "1995-02-18",
    gender: "male",
    intent: "life_partner",
    values: ["Kindness", "Growth", "Stability", "Humor"],
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    ],
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    location_lat: 37.7558,
    location_lng: -122.4449,
    quality_score: 120,
    profile_strength: 90,
    mood: "talking",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "d5555555-5555-5555-5555-555555555555",
    username: "elena_wave",
    full_name: "Elena Rostova",
    bio: "Marine biologist and scuba instructor. Passionate about ocean conservation, spicy Thai food, and stargazing away from city lights. 🌊🤿",
    birth_date: "1999-07-30",
    gender: "female",
    intent: "short_term_open",
    values: ["Adventure", "Freedom", "Honesty", "Growth"],
    photos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80",
    ],
    avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    location_lat: 37.8044,
    location_lng: -122.2712,
    quality_score: 105,
    profile_strength: 85,
    mood: "vibing",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

export const DEMO_POSTS = [
  {
    id: "p1111111-1111-1111-1111-111111111111",
    user_id: "d1111111-1111-1111-1111-111111111111",
    content: "Golden hour pottery session. Finally mastered the centering technique on the wheel! 🏺✨",
    image_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    likes_count: 24,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    profiles: DEMO_PROFILES[0],
  },
  {
    id: "p2222222-2222-2222-2222-222222222222",
    user_id: "d2222222-2222-2222-2222-222222222222",
    content: "Summit view after an early morning 12k run. The fog rolling over the bay never gets old. 🏃‍♂️🌲",
    image_url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    likes_count: 38,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    profiles: DEMO_PROFILES[1],
  },
  {
    id: "p3333333-3333-3333-3333-333333333333",
    user_id: "d3333333-3333-3333-3333-333333333333",
    content: "Setting up the spring photography showcase. Nothing beats genuine analog grain. 📸🎞️",
    image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    media_type: "image",
    likes_count: 19,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    profiles: DEMO_PROFILES[2],
  },
];

export const DEMO_STORIES = [
  {
    id: "s1111111-1111-1111-1111-111111111111",
    user_id: "d1111111-1111-1111-1111-111111111111",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    media_type: "image",
    expires_at: new Date(Date.now() + 18 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    profiles: DEMO_PROFILES[0],
  },
  {
    id: "s2222222-2222-2222-2222-222222222222",
    user_id: "d2222222-2222-2222-2222-222222222222",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    media_type: "image",
    expires_at: new Date(Date.now() + 20 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    profiles: DEMO_PROFILES[1],
  },
];

export const DEMO_MATCHES = [
  {
    id: "m1111111-1111-1111-1111-111111111111",
    user_1: "00000000-0000-0000-0000-000000000001",
    user_2: "d1111111-1111-1111-1111-111111111111",
    status: "accepted",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    otherProfile: DEMO_PROFILES[0],
    lastMessage: {
      id: "msg-1",
      match_id: "m1111111-1111-1111-1111-111111111111",
      sender_id: "d1111111-1111-1111-1111-111111111111",
      content: "Hey Alex! Loved your vibe. Do you know that little café on 4th street?",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      seen_at: null,
    },
    unreadCount: 1,
  },
  {
    id: "m2222222-2222-2222-2222-222222222222",
    user_1: "00000000-0000-0000-0000-000000000001",
    user_2: "d3333333-3333-3333-3333-333333333333",
    status: "accepted",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    otherProfile: DEMO_PROFILES[2],
    lastMessage: {
      id: "msg-2",
      match_id: "m2222222-2222-2222-2222-222222222222",
      sender_id: "00000000-0000-0000-0000-000000000001",
      content: "That gallery exhibition was unbelievable! Let's definitely catch the next one.",
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      seen_at: new Date(Date.now() - 3600000 * 11).toISOString(),
    },
    unreadCount: 0,
  }
];

export const DEMO_EVENTS = [
  {
    id: "e1111111-1111-1111-1111-111111111111",
    title: "Sunset Wine & Vinyl Tasting",
    description: "Relaxed evening listening to vintage jazz and funk records while tasting natural wines with fellow music lovers.",
    event_type: "meetup",
    location: "Dolores Park Overlook, SF",
    event_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    max_participants: 20,
    current_participants: 14,
    interest_tags: ["Music", "Wine", "Vinyl", "Casual"],
    host: { full_name: "Liam Vance", avatar_url: DEMO_PROFILES[1].avatar_url },
  },
  {
    id: "e2222222-2222-2222-2222-222222222222",
    title: "Philosophy & Dating Speed Talks",
    description: "5-minute rounds discussing life's big questions: free will, modern romance, and what makes a meaningful life.",
    event_type: "speed_dating",
    location: "City Lights Books Annex",
    event_date: new Date(Date.now() + 6 * 86400000).toISOString(),
    max_participants: 16,
    current_participants: 12,
    interest_tags: ["Books", "Deep Talk", "Speed Dating"],
    host: { full_name: "Maya Chen", avatar_url: DEMO_PROFILES[0].avatar_url },
  },
  {
    id: "e3333333-3333-3333-3333-333333333333",
    title: "Lands End Morning Coastal Hike",
    description: "Breezy ocean trail walk followed by matcha lattes. Friendly dogs and good energy welcome!",
    event_type: "meetup",
    location: "Lands End Lookout Trailhead",
    event_date: new Date(Date.now() + 8 * 86400000).toISOString(),
    max_participants: 15,
    current_participants: 9,
    interest_tags: ["Outdoors", "Hiking", "Dogs"],
    host: { full_name: "Julian Brooks", avatar_url: DEMO_PROFILES[3].avatar_url },
  }
];

export const DEMO_ROOMS = [
  { id: "r1", name: "Foodies & Natural Wine", members: 245, active: true },
  { id: "r2", name: "Creatives & Designers", members: 189, active: true },
  { id: "r3", name: "Book Worms & Essayists", members: 162, active: true },
  { id: "r4", name: "Adventure & Hiking Seekers", members: 320, active: true },
];
