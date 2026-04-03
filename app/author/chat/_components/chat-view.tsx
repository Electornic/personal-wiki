"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChatMessage } from "@/app/author/chat/_components/chat-message";
import {
  DocumentPreviewCard,
  type DocumentProposal,
} from "@/app/author/chat/_components/document-preview-card";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function extractProposal(text: string): DocumentProposal | null {
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[1]);
    if (parsed.type === "document_proposal" && parsed.title && parsed.contents) {
      return parsed as DocumentProposal;
    }
  } catch {
    // invalid JSON, ignore
  }
  return null;
}

function stripJsonBlock(text: string): string {
  return text.replace(/```json\s*[\s\S]*?```/, "").trim();
}

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  async function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };

    setMessages([...updatedMessages, assistantMessage]);

    try {
      const response = await fetch("/api/author/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error ?? "Something went wrong. Please try again.";
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: errorMsg } : m)),
        );
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: accumulated } : m,
                ),
              );
            }
          } catch {
            // incomplete JSON, will be completed in next chunk
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: "Failed to connect. Please check your connection and try again." }
            : m,
        ),
      );
    }

    setIsStreaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-[640px] space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[18px] font-medium text-[#2a2419]">
                What have you been reading?
              </p>
              <p className="mt-2 text-[14px] text-[#6b6354]">
                Share your thoughts and I&apos;ll help turn them into a document for your library.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const proposal =
              message.role === "assistant" ? extractProposal(message.content) : null;
            const textContent =
              message.role === "assistant" ? stripJsonBlock(message.content) : message.content;

            return (
              <div key={message.id} className="space-y-3">
                {textContent && <ChatMessage content={textContent} role={message.role} />}
                {proposal && <DocumentPreviewCard proposal={proposal} />}
              </div>
            );
          })}

          {isStreaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="rounded-[12px] rounded-bl-[4px] border border-[rgba(42,36,25,0.08)] bg-white px-4 py-2.5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#6b6354] [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#6b6354] [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#6b6354] [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-[rgba(42,36,25,0.08)] bg-[#faf8f5] px-4 py-3">
        <div className="mx-auto flex max-w-[640px] gap-2">
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none rounded-[6px] border border-[rgba(42,36,25,0.12)] bg-white px-3 py-2.5 text-[14px] leading-relaxed text-[#2a2419] outline-none placeholder:text-[#a09888] focus:border-[rgba(42,36,25,0.3)] focus:shadow-[0_0_0_1px_rgba(42,36,25,0.1)]"
            disabled={isStreaming}
            onKeyDown={handleKeyDown}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what you've been reading or thinking about..."
            rows={1}
            value={input}
          />
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-[6px] bg-[#2a2419] text-[#faf8f5] hover:bg-[#3d362b] disabled:opacity-40"
            disabled={!input.trim() || isStreaming}
            onClick={handleSubmit}
            type="button"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
              <path
                d="M14 2L7.5 14 5.5 8.5 2 7l12-5z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.2"
              />
              <path d="M14 2L5.5 8.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
