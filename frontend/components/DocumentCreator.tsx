"use client";

import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultValues, fillNda, toDownloadMarkdown, type NdaValues } from "@/lib/fillNda";
import { DISCLAIMER } from "@/lib/disclaimer";
import { fillGeneric, toPlainMarkdown, type TemplateInfo } from "@/lib/fillGeneric";
import ChatPanel, { type ChatMessage } from "./ChatPanel";

const NDA_ID = "mutual-nda";

export type SavedDocument = {
  id: number;
  title: string;
  state: { messages: ChatMessage[]; document: string; ndaValues: NdaValues; terms: Record<string, string> };
};

type Props = {
  saved: SavedDocument | null;
  onSaved: (id: number) => void;
  onBusyChange: (busy: boolean) => void;
};

type ChatReply = {
  reply: string;
  documentId: number | null;
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

function loadTemplate(id: string): Promise<TemplateInfo> {
  return fetch(`/api/templates/${id}`).then((r) => {
    if (!r.ok) throw new Error(`Template failed (${r.status})`);
    return r.json();
  });
}

function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DocumentCreator({ saved, onSaved, onBusyChange }: Props) {
  const [docId, setDocId] = useState<string | null>(saved?.state.document ?? null);
  const [documentId, setDocumentId] = useState<number | null>(saved?.id ?? null);
  const [template, setTemplate] = useState<TemplateInfo | null>(null);
  const [ndaValues, setNdaValues] = useState<NdaValues>(saved?.state.ndaValues ?? defaultValues);
  const [terms, setTerms] = useState<Record<string, string>>(saved?.state.terms ?? {});
  const [messages, setMessages] = useState<ChatMessage[]>(saved?.state.messages ?? [GREETING]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!saved) return;
    loadTemplate(saved.state.document)
      .then(setTemplate)
      .catch(() => setMessages((m) => [...m, { role: "assistant", content: "Sorry, this document could not be loaded." }]));
  }, [saved]);

  async function send(text: string) {
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setBusy(true);
    onBusyChange(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, documentId, document: docId, ndaValues, terms }),
      });
      if (!res.ok) throw new Error(`Chat failed (${res.status})`);
      const data: ChatReply = await res.json();
      if (data.document && data.document !== docId) {
        setTemplate(await loadTemplate(data.document));
      }
      setDocId(data.document);
      setDocumentId(data.documentId);
      if (data.documentId) onSaved(data.documentId);
      setNdaValues(data.ndaValues);
      setTerms(data.terms);
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([...history, { role: "assistant", content: `Sorry, something went wrong: ${e}` }]);
    } finally {
      setBusy(false);
      onBusyChange(false);
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
    <main className="grid min-h-0 flex-1 gap-6 p-6 lg:grid-cols-[24rem_1fr]">
      <section className="flex min-h-0 flex-col gap-3">
        <h1 className="text-xl font-semibold text-navy">Draft with AI</h1>
        <ChatPanel messages={messages} busy={busy} onSend={send} />
        <button
          type="button"
          disabled={!ready}
          onClick={() => download(filename, `> **DRAFT.** ${DISCLAIMER}\n\n${markdown}`)}
          className="rounded-lg bg-submit px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
        >
          Download (.md)
        </button>
      </section>
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <p className="shrink-0 border-b border-accent/40 bg-accent/10 px-6 py-2 text-xs font-medium text-navy">
          DRAFT - {DISCLAIMER}
        </p>
        <article className="nda-preview flex-1 overflow-y-auto p-8">
          {filled ? (
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {filled}
            </Markdown>
          ) : (
            <p className="text-sm text-muted">Your document will appear here once you choose one.</p>
          )}
        </article>
      </div>
    </main>
  );
}
