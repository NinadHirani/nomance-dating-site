import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const { count: unreadCount } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    return NextResponse.json({
      notifications: data || [],
      unread_count: unreadCount || 0,
    });
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST: Create a notification (internal/admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, title, body: notifBody, metadata } = body;

    if (!user_id || !type || !title) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, type, title" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id,
        type,
        title,
        body: notifBody || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, notification: data });
  } catch (error: any) {
    console.error("Notification create error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: 500 }
    );
  }
}

// PATCH: Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_ids, mark_all } = body;

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (mark_all) {
      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);

      if (error) throw error;
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notification_ids && Array.isArray(notification_ids)) {
      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", notification_ids)
        .eq("user_id", user.id);

      if (error) throw error;
      return NextResponse.json({ success: true, updated: notification_ids.length });
    }

    return NextResponse.json({ error: "Provide notification_ids or mark_all" }, { status: 400 });
  } catch (error: any) {
    console.error("Notification update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}
