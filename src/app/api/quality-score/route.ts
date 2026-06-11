import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint recalculates quality scores for users.
// In production, you'd call this from a cron job or Edge Function.
// For now it can be called manually or via a Supabase scheduled function.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ScoreFactors {
  hasPhotos: boolean;
  hasBio: boolean;
  hasValues: boolean;
  hasIntent: boolean;
  hasLocation: boolean;
  matchCount: number;
  messagesCount: number;
  reportsCount: number;
  lastActive: string | null;
}

function calculateQualityScore(factors: ScoreFactors): number {
  let score = 50; // Base score

  // Profile completeness (+30 max)
  if (factors.hasPhotos) score += 8;
  if (factors.hasBio) score += 8;
  if (factors.hasValues) score += 6;
  if (factors.hasIntent) score += 4;
  if (factors.hasLocation) score += 4;

  // Activity bonus (+40 max)
  score += Math.min(15, factors.matchCount * 3);
  score += Math.min(15, factors.messagesCount * 0.5);

  // Recency bonus (+10 max)
  if (factors.lastActive) {
    const hoursSinceActive =
      (Date.now() - new Date(factors.lastActive).getTime()) / (1000 * 60 * 60);
    if (hoursSinceActive < 24) score += 10;
    else if (hoursSinceActive < 72) score += 7;
    else if (hoursSinceActive < 168) score += 3;
  }

  // Report penalty (-20 per report)
  score -= factors.reportsCount * 20;

  return Math.max(0, Math.min(200, Math.round(score)));
}

export async function POST(request: NextRequest) {
  try {
    // Optional: validate a secret key for cron security
    const body = await request.json().catch(() => ({}));
    const userId = body.user_id;

    // If a specific user ID is provided, update just that user
    if (userId) {
      const newScore = await updateUserScore(userId);
      return NextResponse.json({ success: true, user_id: userId, score: newScore });
    }

    // Otherwise, batch update all active users
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .order("last_active", { ascending: false, nullsFirst: false })
      .limit(500);

    if (error) throw error;

    let updated = 0;
    for (const profile of profiles || []) {
      await updateUserScore(profile.id);
      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error("Quality score update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update quality scores" },
      { status: 500 }
    );
  }
}

async function updateUserScore(userId: string): Promise<number> {
  // Fetch profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return 100;

  // Fetch match count
  const { count: matchCount } = await supabaseAdmin
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`user_1.eq.${userId},user_2.eq.${userId}`);

  // Fetch messages count
  const { count: messagesCount } = await supabaseAdmin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", userId);

  // Fetch reports count
  const { count: reportsCount } = await supabaseAdmin
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("reported_user_id", userId);

  const factors: ScoreFactors = {
    hasPhotos: !!(profile.photos && profile.photos.length > 0) || !!profile.avatar_url,
    hasBio: !!(profile.bio && profile.bio.length > 10),
    hasValues: !!(profile.values && profile.values.length > 0),
    hasIntent: !!profile.intent,
    hasLocation: !!(profile.location_lat && profile.location_lng),
    matchCount: matchCount || 0,
    messagesCount: messagesCount || 0,
    reportsCount: reportsCount || 0,
    lastActive: profile.last_active,
  };

  const newScore = calculateQualityScore(factors);

  // Update profile
  await supabaseAdmin
    .from("profiles")
    .update({ quality_score: newScore })
    .eq("id", userId);

  // Log the update
  await supabaseAdmin.from("quality_score_log").insert({
    user_id: userId,
    event_type: "scheduled_recalculation",
    score_change: newScore - (profile.quality_score || 100),
    new_score: newScore,
  });

  return newScore;
}

// GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    description: "POST to this endpoint to trigger quality score recalculation",
    params: {
      "user_id (optional)": "UUID - recalculate for specific user",
      "no params": "Batch recalculate for all active users",
    },
  });
}
