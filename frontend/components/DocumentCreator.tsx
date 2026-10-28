"use client";

import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultValues, fillNda, toDownloadMarkdown, type NdaValues } from "@/lib/fillNda";
import { fillGeneric, toPlainMarkdown, type TemplateInfo } from "@/lib/fillGeneric";
import ChatPanel, { type ChatMessage } from "./ChatPanel";

const NDA_ID = "mutual-nda";

type ChatReply = {
  reply: string;
  document: string | null;
  ndaValues: NdaValues;
  terms: Record<string, string>;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I can help you draft legal agreements such as an NDA, cloud service agreement, SLA, DPA or pilot agreement. What do you need?",
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

export default function DocumentCreator() {
  const [docId, setDocId] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateInfo | null>(null);
  const [ndaValues, setNdaValues] = useState<NdaValues>(defaultValues);
  const [terms, setTerms] = useState<Record<string, string>>({});
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
        body: JSON.stringify({ messages: history, document: docId, ndaValues, terms }),
      });
      if (!res.ok) throw new Error(`Chat failed (${res.status})`);
      const data: ChatReply = await res.json();
      if (data.document && data.document !== docId) {
        const t = await fetch(`/api/templates/${data.document}`);
        if (!t.ok) throw new Error(`Template failed (${t.status})`);
        setTemplate(await t.json());
      }
      setDocId(data.document);
      setNdaValues(data.ndaValues);
      setTerms(data.terms);
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([...history, { role: "assistant", content: `Sorry, something went wrong: ${e}` }]);
    } finally {
      setBusy(false);
    }
  }

  const isNda = docId === NDA_ID;

  const filled = useMemo(() => {
    if (!template) return "";
    if (isNda) return fillNda(template.files[0], template.files[1], withLongDate(ndaValues));
    return fillGeneric(template, terms);
  }, [isNda, template, ndaValues, terms]);

  const ready =
    isNda
      ? ndaValues.effectiveDate && ndaValues.governingLaw && ndaValues.jurisdiction && ndaValues.purpose
      : Object.keys(terms).length > 0;
  const filename = `${docId}.md`;
  const markdown = isNda ? toDownloadMarkdown(filled) : toPlainMarkdown(filled);

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 p-6 lg:grid-cols-[26rem_1fr]">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Prelegal</h1>
        <ChatPanel messages={messages} busy={busy} onSend={send} />
        <button
          type="button"
          disabled={!ready}
          onClick={() => download(filename, markdown)}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Download (.md)
        </button>
      </section>
      <article className="nda-preview rounded border border-zinc-200 p-6 dark:border-zinc-800">
        {filled ? (
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {filled}
          </Markdown>
        ) : (
          <p className="text-sm text-zinc-500">Your document will appear here once you choose one.</p>
        )}
      </article>
    </main>
  );
}
