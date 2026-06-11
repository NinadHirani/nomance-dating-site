import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, bio, userId, message, conversationHistory } = body;
    const requestType = action || type;

    if (requestType === "analyze_bio") {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a dating profile coach. Your job is to help users write better dating bios that increase matches and conversations.

Provide constructive feedback on dating bios and suggest improvements. Be encouraging but honest. Focus on:
- Authenticity and personality
- Specific details over generic statements
- Showing hobbies/interests clearly
- Having a tone that invites conversation
- Avoiding red flags like negativity or cynicism`,
          },
          {
            role: "user",
            content: `Please analyze this dating bio and provide 3-4 specific tips for improvement, then provide a revised version:

"${bio}"

Format your response as JSON with this structure:
{
  "tips": ["tip 1", "tip 2", "tip 3"],
  "improved": "your improved bio here"
}`,
          },
        ],
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(content);

      return NextResponse.json({
        tips: parsed.tips || [],
        improved: parsed.improved || "",
      });
    }

    if (requestType === "analyze_photos") {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a dating profile photo coach. Help users understand what types of photos work best for dating apps.

Even without seeing their actual photos, provide guidance on what categories of photos they should have and why. Common categories: headshot, full body, activity/hobby, social/friends, genuine smile, outdoors, dressed up.`,
          },
          {
            role: "user",
            content: `Provide 4-5 actionable tips for building a strong dating photo set. Also provide hypothetical scores (0-100) for different photo categories to help them understand what matters.

Format your response as JSON:
{
  "tips": ["tip 1", "tip 2", "tip 3"],
  "scores": {
    "headshot": 95,
    "full_body": 90,
    "activity": 85,
    "friends": 75,
    "genuine_smile": 100
  }
}`,
          },
        ],
      });

      const content = response.choices[0].message.content || "{}";
      const parsed = JSON.parse(content);

      return NextResponse.json({
        tips: parsed.tips || [],
        scores: parsed.scores || {},
      });
    }

    if (requestType === "chat") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId required for chat" },
          { status: 400 }
        );
      }

      // Fetch user profile for context
      let profile = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        profile = data;
      } catch (e) {
        // Continue without profile context
      }

      const systemPrompt = `You are Aura Coach, a warm and supportive dating and relationship advisor. Your role is to help users:
- Build confidence in their dating journey
- Write better profiles and bios
- Improve their photography strategy
- Navigate dating conversations and relationships
- Handle rejection, ghosting, and dating challenges with grace

Keep responses conversational, warm, and encouraging. Be practical but also emotionally intelligent.
${
  profile
    ? `The user's profile shows: Intent: ${profile.intent}, Values: ${profile.values?.join(", ") || "not set"}`
    : ""
}`;

      const messages = [
        ...conversationHistory,
        {
          role: "user" as const,
          content: message,
        },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
      });

      const assistantMessage = response.choices[0].message.content || "";

      return NextResponse.json({
        message: assistantMessage,
        response: assistantMessage,
      });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
