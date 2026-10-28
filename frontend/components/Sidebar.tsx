"use client";

export type DocSummary = { id: number; title: string; updated_at: string };

type Props = {
  docs: DocSummary[];
  activeId: number | null;
  /** True while an AI reply is pending; switching documents then would mix up state. */
  disabled: boolean;
  onNew: () => void;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
};

/** SQLite stores UTC as "YYYY-MM-DD HH:MM:SS". */
function formatDate(value: string): string {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleDateString("en-US", { dateStyle: "medium" });
}

/** New document button and the user's saved documents, newest first. */
export default function Sidebar({ docs, activeId, disabled, onNew, onOpen, onDelete }: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 border-r border-line bg-white p-4">
      <button
        type="button"
        onClick={onNew}
        disabled={disabled}
        className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        + New document
      </button>
      <h2 className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">My documents</h2>
      {docs.length === 0 && <p className="text-sm text-muted">Documents you draft will appear here.</p>}
      <ul className="flex flex-col gap-1 overflow-y-auto">
        {docs.map((d) => (
          <li
            key={d.id}
            className={`group flex items-center justify-between rounded-lg px-3 py-2 ${
              d.id === activeId ? "bg-brand/10" : "hover:bg-background"
            }`}
          >
            <button type="button" disabled={disabled} onClick={() => onOpen(d.id)} className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-navy">{d.title}</span>
              <span className="block text-xs text-muted">{formatDate(d.updated_at)}</span>
            </button>
            <button
              type="button"
              aria-label={`Delete ${d.title}`}
              disabled={disabled}
              onClick={() => onDelete(d.id)}
              className="ml-2 rounded px-1.5 text-muted opacity-0 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
