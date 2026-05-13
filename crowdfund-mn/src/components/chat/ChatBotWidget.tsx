"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Minimize2, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "assistant" | "user";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

interface ChatApiResponse {
  message?: string;
  error?: string;
}

const STORAGE_KEY = "crowdfund-ai-chat";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Сайн байна уу? Би Crowdfund.mn AI туслагч. Төсөл эхлүүлэх, хандив өгөх, QPay төлбөр, төслийн мэдээлэлтэй холбоотой асуултад тусална.",
};

const QUICK_PROMPTS = [
  "Төсөл яаж эхлүүлэх вэ?",
  "QPay-р яаж хандив өгөх вэ?",
  "Идэвхтэй төслүүд хаана байна?",
];

function createMessage(role: Role, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  };
}

function loadStoredMessages() {
  if (typeof window === "undefined") return [WELCOME_MESSAGE];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME_MESSAGE];

    const parsed = JSON.parse(raw) as ChatMessage[];
    const validMessages = parsed.filter(
      (message) =>
        typeof message.id === "string" &&
        (message.role === "assistant" || message.role === "user") &&
        typeof message.content === "string"
    );

    return validMessages.length > 0 ? validMessages : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

async function readChatApiResponse(response: Response): Promise<ChatApiResponse> {
  const raw = await response.text();

  if (!raw.trim()) return {};

  try {
    return JSON.parse(raw) as ChatApiResponse;
  } catch {
    throw new Error(
      response.ok
        ? "AI route-аас буруу форматтай хариу ирлээ."
        : "AI route JSON биш хариу буцаалаа. Dev server restart хийсэн эсэхээ шалгана уу."
    );
  }
}

export function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0 && !loading;

  const visibleMessages = useMemo(
    () => messages.filter((message) => message.content.trim().length > 0),
    [messages]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMessages(loadStoredMessages());
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  }, [hasHydrated, messages]);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      inputRef.current?.focus();
    }, 80);

    return () => window.clearTimeout(id);
  }, [open, messages.length, loading]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== WELCOME_MESSAGE.id)
            .slice(-12)
            .map(({ role, content: messageContent }) => ({ role, content: messageContent })),
        }),
      });

      const data = await readChatApiResponse(response);

      if (!response.ok) {
        throw new Error(data.error ?? "AI туслагчтай холбогдоход алдаа гарлаа.");
      }

      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          data.message ?? "Уучлаарай, одоогоор хариу авах боломжгүй байна."
        ),
      ]);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? error.message
          : "AI туслагч түр хугацаанд ажиллахгүй байна. Дахин оролдоно уу.";

      setMessages((current) => [...current, createMessage("assistant", fallback)]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleReset() {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      {open && (
        <section
          aria-label="Crowdfund.mn AI туслагч"
          className={cn(
            "mb-3 flex h-[min(640px,calc(100vh-6rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl",
            "sm:h-[620px] sm:w-[390px]"
          )}
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-950 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <Bot className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">Crowdfund AI</h2>
                <p className="truncate text-xs text-slate-300">Монгол хэлтэй туслагч</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Чатыг цэвэрлэх"
                title="Чатыг цэвэрлэх"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Чатыг жижигрүүлэх"
                title="Чатыг жижигрүүлэх"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-blue-700 text-white"
                      : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start gap-2">
                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-3.5 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={loading}
                  className="flex-shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (canSend) void sendMessage(input);
                  }
                }}
                rows={1}
                maxLength={800}
                placeholder="Асуултаа бичнэ үү..."
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-cta transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="Илгээх"
                title="Илгээх"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-cta transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
        aria-label={open ? "AI чатыг хаах" : "AI чатыг нээх"}
        aria-expanded={open}
        title={open ? "AI чатыг хаах" : "AI туслагч"}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.4} />
        ) : (
          <MessageCircle className="h-6 w-6 transition group-hover:scale-105" strokeWidth={2.4} />
        )}
      </button>
    </div>
  );
}
