"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[12px] rounded-br-[4px] bg-[#2a2419] px-4 py-2.5 text-[14px] leading-relaxed text-[#faf8f5] whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-[12px] rounded-bl-[4px] border border-[rgba(42,36,25,0.08)] bg-white px-4 py-2.5 text-[14px] leading-relaxed text-[#2a2419] shadow-[0px_1px_3px_rgba(0,0,0,0.04)] whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
