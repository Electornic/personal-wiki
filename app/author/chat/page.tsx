import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ChatView } from "@/app/author/chat/_components/chat-view";
import { requireAuthorAccess } from "@/lib/wiki/auth";
import { hasOpenAIEnv } from "@/shared/config/env";

export default function ChatPage() {
  return (
    <main className="site-shell flex min-h-[calc(100dvh-60px)] flex-col pb-4 pt-[72px]">
      <Suspense fallback={<ChatSkeleton />}>
        <ChatContent />
      </Suspense>
    </main>
  );
}

async function ChatContent() {
  await connection();

  const access = await requireAuthorAccess();

  if (!access.configured) {
    redirect("/author");
  }

  if (!hasOpenAIEnv()) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-[6px] border border-[rgba(42,36,25,0.08)] bg-white px-6 py-5 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-[15px] font-medium text-[#2a2419]">Chat is not available</p>
          <p className="mt-1 text-[13px] text-[#6b6354]">
            Set the <code className="rounded bg-[#f0ece6] px-1.5 py-0.5 text-[12px]">OPENAI_API_KEY</code> environment variable to enable chat.
          </p>
        </div>
      </div>
    );
  }

  return <ChatView />;
}

function ChatSkeleton() {
  return (
    <div className="flex flex-1 flex-col animate-pulse">
      <div className="flex-1" />
      <div className="mx-auto w-full max-w-[640px]">
        <div className="h-[48px] rounded-[6px] bg-[rgba(42,36,25,0.08)]" />
      </div>
    </div>
  );
}
