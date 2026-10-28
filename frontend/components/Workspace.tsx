"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import DocumentCreator, { type SavedDocument } from "./DocumentCreator";
import Sidebar, { type DocSummary } from "./Sidebar";

const fetchDocs = (): Promise<DocSummary[]> => fetch("/api/documents").then((r) => (r.ok ? r.json() : []));

/** Signed-in app shell: header, document sidebar and the creator. */
export default function Workspace() {
  const { user, signOut } = useAuth();
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [session, setSession] = useState<{ key: number; saved: SavedDocument | null }>({ key: 0, saved: null });
  const [activeId, setActiveId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => fetchDocs().then(setDocs);

  useEffect(() => {
    fetchDocs().then(setDocs);
  }, []);

  function startNew() {
    setActiveId(null);
    setSession((s) => ({ key: s.key + 1, saved: null }));
  }

  async function open(id: number) {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) return;
    const doc: SavedDocument = { id, ...(await res.json()) };
    setActiveId(id);
    setSession((s) => ({ key: s.key + 1, saved: doc }));
  }

  async function remove(id: number) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    if (id === activeId) startNew();
    refresh();
  }

  function saved(id: number) {
    setActiveId(id);
    refresh();
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between bg-navy px-6 text-white">
        <p className="text-lg font-semibold">
          Pre<span className="text-accent">legal</span>
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/70">{user?.email}</span>
          <button type="button" onClick={signOut} className="rounded-lg border border-white/30 px-3 py-1.5 hover:bg-white/10">
            Sign out
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <Sidebar docs={docs} activeId={activeId} disabled={busy} onNew={startNew} onOpen={open} onDelete={remove} />
        <DocumentCreator key={session.key} saved={session.saved} onSaved={saved} onBusyChange={setBusy} />
      </div>
    </div>
  );
}
