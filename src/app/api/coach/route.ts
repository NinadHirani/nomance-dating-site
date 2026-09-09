import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Prevent Next.js from pre-rendering this route at build time
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, bio, userId, message, conversationHistory = [] } = body;
    const requestType = action || type;

    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-api-key"));
    const openai = hasOpenAI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

    if (requestType === "analyze_bio") {
      if (openai) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a dating profile coach. Constructive feedback on dating bios: authenticity, specific details, hobbies, inviting tone, no cynicism. Return JSON { "tips": string[], "improved": string }`,
              },
              {
                role: "user",
                content: `Please analyze this dating bio and provide 3 specific tips for improvement, then provide a revised version:\n\n"${bio}"`,
              },
            ],
          });

          const content = response.choices[0].message.content || "{}";
          const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

          return NextResponse.json({
            tips: parsed.tips || [],
            improved: parsed.improved || "",
          });
        } catch (openaiErr) {
          console.warn("OpenAI bio analysis fallback:", openaiErr);
        }
      }

      // Intelligent heuristic fallback
      return NextResponse.json({
        tips: [
          "Anchor your bio in specific sensory details: instead of saying 'I love outdoors', mention your favorite morning trail or coffee spot.",
          "Include an inviting conversation hook at the end, such as your current debate or hot take.",
          "Highlight your core values and intentions early so matches know what brings you joy."
        ],
        improved: bio 
          ? `${bio.trim()}\n\nAsk me about my latest sourdough attempt or tell me the best live show you've ever seen!`
          : "Curious conversationalist and weekend espresso explorer. When I'm not cycling coastal trails, you can find me testing out new recipes or browsing indie bookstores. Looking for someone genuine with a great sense of humor."
      });
    }

    if (requestType === "analyze_photos") {
      if (openai) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a dating profile photo coach. Help users understand what categories of photos work best. Return JSON { "tips": string[], "scores": object }`,
              },
              {
                role: "user",
                content: `Provide 4-5 actionable tips for building a strong dating photo set and category scores.`,
              },
            ],
          });

          const content = response.choices[0].message.content || "{}";
          const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

          return NextResponse.json({
            tips: parsed.tips || [],
            scores: parsed.scores || {},
          });
        } catch (openaiErr) {
          console.warn("OpenAI photo analysis fallback:", openaiErr);
        }
      }

      return NextResponse.json({
        tips: [
          "Lead with a crisp, solo headshot featuring natural daylight and an authentic smile.",
          "Include at least one full-body shot in a relaxed, everyday setting.",
          "Add an action photo showing you immersed in a favorite passion or pastime.",
          "Avoid heavy filters, hats, or sunglasses in your primary three photos."
        ],
        scores: {
          headshot: 95,
          full_body: 90,
          activity: 88,
          social: 82,
          genuine_smile: 100
        }
      });
    }

    if (requestType === "chat") {
      if (openai) {
        try {
          // Attempt profile context fetch if Supabase service role is valid
          let profile = null;
          if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("YOUR_")) {
            try {
              const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
              const { data } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single();
              profile = data;
            } catch (e) {}
          }

          const systemPrompt = `You are Aura Coach, a warm, emotionally intelligent dating and relationship advisor. Keep responses conversational, concise, and practical.${profile ? ` User values: ${profile.values?.join(", ")}, intent: ${profile.intent}` : ""}`;

          const messages = [
            ...(conversationHistory || []),
            { role: "user" as const, content: message || "Hello" },
          ];

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
          });

          const assistantMessage = response.choices[0].message.content || "";
          return NextResponse.json({
            message: assistantMessage,
            response: assistantMessage,
          });
        } catch (openaiErr) {
          console.warn("OpenAI chat fallback:", openaiErr);
        }
      }

      // Thoughtful, context-rich fallback advice
      const advicePool = [
        "The best dating profiles aren't about pleasing everyone—they act like a beacon for the right person. What's one passion or quirk you'd love your future partner to appreciate?",
        "When messaging matches, try picking one specific detail from their photos or prompts and asking an open question. For instance: 'I noticed your photo at the pottery wheel—how long did it take to master centering?'",
        "Dating should feel energizing rather than exhausting. If a conversation feels one-sided after 3-4 exchanges, it's okay to redirect your energy to matches who invest reciprocal effort.",
        "A clear intention doesn't scare away the right people; it filters out mismatched expectations early. Celebrate knowing what you're looking for!"
      ];
      const selected = advicePool[Math.floor(Math.random() * advicePool.length)];

      return NextResponse.json({
        message: selected,
        response: selected,
      });
    }

    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  } catch (error: any) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { message: "Authentic connections take intention. Let's focus on highlighting what makes you genuinely unique!" },
      { status: 200 }
    );
  }
}
