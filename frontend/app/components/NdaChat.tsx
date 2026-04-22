"use client";

import { useState, useRef, useEffect } from "react";
import NdaPreview from "./NdaPreview";
import { NdaData } from "../types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface NdaFields {
  purpose?: string | null;
  effectiveDate?: string | null;
  mndaTermType?: string | null;
  mndaTermYears?: number | null;
  confidentialityTermType?: string | null;
  confidentialityTermYears?: number | null;
  governingLaw?: string | null;
  jurisdiction?: string | null;
  party1Company?: string | null;
  party1Name?: string | null;
  party1Title?: string | null;
  party1Address?: string | null;
  party2Company?: string | null;
  party2Name?: string | null;
  party2Title?: string | null;
  party2Address?: string | null;
}

const today = new Date().toISOString().split("T")[0];

function fieldsToNdaData(fields: NdaFields): NdaData {
  return {
    purpose: fields.purpose ?? "",
    effectiveDate: fields.effectiveDate ?? today,
    mndaTermType: (fields.mndaTermType as "expires" | "continuous") ?? "expires",
    mndaTermYears: fields.mndaTermYears ?? 1,
    confidentialityTermType: (fields.confidentialityTermType as "years" | "perpetuity") ?? "years",
    confidentialityTermYears: fields.confidentialityTermYears ?? 1,
    governingLaw: fields.governingLaw ?? "",
    jurisdiction: fields.jurisdiction ?? "",
    party1Company: fields.party1Company ?? "",
    party1Name: fields.party1Name ?? "",
    party1Title: fields.party1Title ?? "",
    party1Address: fields.party1Address ?? "",
    party2Company: fields.party2Company ?? "",
    party2Name: fields.party2Name ?? "",
    party2Title: fields.party2Title ?? "",
    party2Address: fields.party2Address ?? "",
  };
}

function isComplete(fields: NdaFields): boolean {
  return !!(
    fields.purpose &&
    fields.effectiveDate &&
    fields.mndaTermType &&
    fields.confidentialityTermType &&
    fields.governingLaw &&
    fields.jurisdiction &&
    fields.party1Company &&
    fields.party1Name &&
    fields.party1Address &&
    fields.party2Company &&
    fields.party2Name &&
    fields.party2Address
  );
}

export default function NdaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<NdaFields>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function callChat(history: Message[]) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    return res.json();
  }

  async function initChat() {
    setLoading(true);
    try {
      const data = await callChat([]);
      setMessages([{ role: "assistant", content: data.message }]);
      setFields(data.fields ?? {});
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const data = await callChat(history);
      setMessages([...history, { role: "assistant", content: data.message }]);
      setFields(data.fields ?? {});
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const ndaData = fieldsToNdaData(fields);
  const complete = isComplete(fields);

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
      {/* Chat panel */}
      <div className="w-2/5 flex flex-col border-r border-gray-200 bg-white min-w-0">
        <div className="px-5 py-3 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-semibold" style={{ color: "#032147" }}>
            AI Assistant
          </h2>
          <p className="text-xs text-gray-400">Chat to build your Mutual NDA</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
                style={msg.role === "user" ? { backgroundColor: "#753991" } : undefined}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-gray-400">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#753991" }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      <div className="flex-1 overflow-y-auto bg-gray-50 min-w-0">
        {complete ? (
          <NdaPreview data={ndaData} />
        ) : (
          <div className="relative">
            <div className="sticky top-0 z-10 px-4 py-2 text-xs text-center font-medium text-amber-700 bg-amber-50 border-b border-amber-200">
              Preview updates as you chat — fields fill in automatically
            </div>
            <NdaPreview data={ndaData} />
          </div>
        )}
      </div>
    </div>
  );
}
