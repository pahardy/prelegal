"use client";

import { useEffect, useRef, useState } from "react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
};

/** Message list plus an input box; the input regains focus after each reply. */
export default function ChatPanel({ messages, busy, onSend }: Props) {
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
    if (!busy) input.current?.focus();
  }, [messages, busy]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-line bg-white p-3 shadow-sm">
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-brand text-white"
                : "self-start bg-background text-foreground"
            }`}
          >
            {m.content}
          </p>
        ))}
        {busy && <p className="self-start text-sm text-muted">Thinking...</p>}
        <div ref={end} />
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          ref={input}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          placeholder="Type your answer..."
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
