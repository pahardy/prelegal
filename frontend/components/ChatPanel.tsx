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
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3 lg:sticky lg:top-6">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded border border-zinc-200 p-3 dark:border-zinc-800">
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded px-3 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "self-start bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            {m.content}
          </p>
        ))}
        {busy && <p className="self-start text-sm text-zinc-500">Thinking...</p>}
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
          className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Send
        </button>
      </form>
    </div>
  );
}
