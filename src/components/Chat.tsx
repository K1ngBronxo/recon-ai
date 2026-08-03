import { useEffect, useRef, useState } from "react";
import { Bot, FileText, KeyRound, Send, Sparkles, User } from "lucide-react";
import type { ChatMsg } from "../lib/types";
import { cn } from "./ui";
import { Markdown } from "../lib/markdown";

const QUICK_PROMPTS = [
  { label: "Summarize the project", icon: "📋" },
  { label: "Explain the architecture", icon: "🏗️" },
  { label: "Where is authentication?", icon: "🔐" },
  { label: "How are users stored?", icon: "👥" },
  { label: "Find database models", icon: "🗄️" },
  { label: "Where is routing handled?", icon: "🗺️" },
];

function MessageBubble({ msg, model }: { msg: ChatMsg; model: string }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isUser
            ? "bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950"
            : "border border-white/10 bg-white/[0.06] text-gold-400"
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[85%] flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed",
            isUser
              ? "rounded-tr-md border border-gold-500/25 bg-gradient-to-br from-gold-500/15 to-gold-500/5 text-gold-100"
              : "rounded-tl-md border border-white/[0.06] bg-white/[0.03] text-zinc-200"
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{msg.content}</div>
          ) : (
            <Markdown md={msg.content} />
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 px-1 text-[10px] text-zinc-600">
          <span className="text-zinc-500">{isUser ? "You" : "RECON"}</span>
          {!isUser && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-600">{model}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({
  messages,
  busy,
  model,
  hasKey,
  selectedFile,
  onSend,
  onOpenSettings,
}: {
  messages: ChatMsg[];
  busy: boolean;
  model: string;
  hasKey: boolean;
  selectedFile: string | null;
  onSend: (text: string) => void;
  onOpenSettings: () => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const send = () => {
    const t = input.trim();
    if (!t || busy) return;
    setInput("");
    onSend(t);
  };

  const hasMessages = messages.length > 0;

  return (
    <aside className="flex w-[420px] shrink-0 flex-col border-l border-white/[0.06] bg-ink-850/80 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-500/20">
          <Bot size={18} className="text-gold-400" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-zinc-100">Project Assistant</div>
          <div className="text-[11px] text-zinc-500">
            {hasKey ? "AI-powered answers from the indexed project" : "Set an API key in Settings to enable"}
          </div>
        </div>
        {!hasKey && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] text-amber-200 transition hover:bg-amber-500/20"
          >
            <KeyRound size={12} />
            Add key
          </button>
        )}
      </div>

      {/* File context indicator */}
      {selectedFile && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-gold-500/20 bg-gold-500/[0.06] px-3.5 py-2.5">
          <FileText size={13} className="shrink-0 text-gold-400" />
          <span className="min-w-0 flex-1 truncate text-[12px] text-gold-200">{selectedFile}</span>
          <span className="shrink-0 rounded-md bg-gold-500/15 px-2 py-0.5 text-[10px] text-gold-400">in context</span>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {!hasMessages ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 -z-10 animate-pulseGold rounded-full" />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-400/15 to-transparent">
                <Sparkles size={28} className="text-gold-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-[15px] font-semibold text-zinc-100">Ask anything about your project</h3>
              <p className="max-w-xs text-[12.5px] leading-relaxed text-zinc-500">
                Architecture, auth, data models, routing, or a specific file — the assistant has full context.
              </p>
            </div>

            {!hasKey && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-200 transition hover:bg-amber-500/15"
              >
                <KeyRound size={14} />
                <span>Connect OpenRouter to enable AI responses</span>
              </button>
            )}

            <div className="grid w-full max-w-sm grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => onSend(q.label)}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left text-[12px] text-zinc-400 transition-all hover:border-gold-500/30 hover:bg-gold-500/[0.06] hover:text-gold-200"
                >
                  <span className="text-[14px]">{q.icon}</span>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="space-y-5">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} model={model} />
            ))}

            {busy && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Bot size={14} className="text-gold-400" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="ml-1 text-[11px] text-zinc-500">Thinking…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/[0.06] bg-ink-900/50 p-4">
        <div className="flex items-end gap-3">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask about the project…"
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-ink-800/80 px-4 py-3 text-[13.5px] text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-gold-500/40 focus:bg-ink-800 focus:ring-1 focus:ring-gold-500/20"
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim() || busy}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-lg shadow-gold-500/20 transition-all hover:from-gold-300 hover:to-gold-500 hover:shadow-gold-500/30 disabled:opacity-30 disabled:shadow-none"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-600">
          <span>Shift+Enter for newline</span>
          <span>Context capped to save tokens</span>
        </div>
      </div>
    </aside>
  );
}
