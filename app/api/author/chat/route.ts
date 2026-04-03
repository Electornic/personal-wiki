import { NextRequest, NextResponse } from "next/server";

import { getOpenAIClient } from "@/shared/api/openai/client";
import { getServerSupabaseClient } from "@/shared/api/supabase/server";

import { CHAT_SYSTEM_PROMPT } from "@/app/author/chat/_lib/system-prompt";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Set OPENAI_API_KEY in your environment." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const messages: ChatMessage[] = body.messages ?? [];

  if (messages.length === 0) {
    return NextResponse.json({ error: "Messages are required" }, { status: 400 });
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...messages],
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
