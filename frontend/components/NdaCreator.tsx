"use client";

import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultValues, fillNda, toDownloadMarkdown, type NdaValues } from "@/lib/fillNda";
import ChatPanel, { type ChatMessage } from "./ChatPanel";

type Props = { coverPage: string; standardTerms: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I'll help you draft a Mutual NDA. What is the purpose of sharing confidential information?",
};

/** The API returns the effective date as ISO YYYY-MM-DD; the template wants a long date. */
function withLongDate(v: NdaValues): NdaValues {
  if (!v.effectiveDate) return v;
  const date = new Date(`${v.effectiveDate}T00:00`).toLocaleDateString("en-US", { dateStyle: "long" });
  return { ...v, effectiveDate: date };
}

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function NdaCreator({ coverPage, standardTerms }: Props) {
  const [values, setValues] = useState<NdaValues>(defaultValues);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, values }),
      });
      if (!res.ok) throw new Error(`Chat failed (${res.status})`);
      const data: { reply: string; values: NdaValues } = await res.json();
      setValues(data.values);
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([...history, { role: "assistant", content: `Sorry, something went wrong: ${e}` }]);
    } finally {
      setBusy(false);
    }
  }

  const filled = useMemo(
    () => fillNda(coverPage, standardTerms, withLongDate(values)),
    [coverPage, standardTerms, values],
  );
  const ready = values.effectiveDate && values.governingLaw && values.jurisdiction && values.purpose;

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 p-6 lg:grid-cols-[26rem_1fr]">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Mutual NDA Creator</h1>
        <ChatPanel messages={messages} busy={busy} onSend={send} />
        <button
          type="button"
          disabled={!ready}
          onClick={() => download("Mutual-NDA.md", toDownloadMarkdown(filled))}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Download NDA (.md)
        </button>
      </section>
      <article className="nda-preview rounded border border-zinc-200 p-6 dark:border-zinc-800">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {filled}
        </Markdown>
      </article>
    </main>
  );
}
