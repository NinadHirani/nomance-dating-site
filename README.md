# Nomance

A dating platform built around intentional connections — matching people by shared values and relationship goals instead of surface-level swiping.

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **UI**: Radix primitives + custom components

## Running locally

```bash
npm install
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/           # Pages and routes
│   ├── auth/      # Login / signup
│   ├── social/    # Main feed with swipeable posts
│   ├── messages/  # Conversations and real-time chat
│   ├── matches/   # Match management
│   ├── search/    # Discovery with filters
│   ├── events/    # Community events
│   ├── coach/     # AI dating coach (bio review, photo tips)
│   ├── profile/   # Profile view and edit
│   └── onboarding/
├── components/    # Shared components
│   └── ui/        # Base UI primitives
├── hooks/         # Custom React hooks
└── lib/           # Supabase client, utilities
```

## Environment variables

Create a `.env` file with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
