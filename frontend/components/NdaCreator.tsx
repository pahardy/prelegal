"use client";

import { useMemo, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { defaultValues, fillNda, toDownloadMarkdown, type NdaValues } from "@/lib/fillNda";

type Props = { coverPage: string; standardTerms: string };

const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

/** Choice between a fixed number of years and an open-ended alternative. */
function TermField(props: {
  label: string;
  openLabel: string;
  years: number | null;
  onChange: (years: number | null) => void;
}) {
  const { label, openLabel, years, onChange } = props;
  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="font-medium">{label}</legend>
      <div className="flex items-center gap-2">
        <input type="radio" checked={years !== null} onChange={() => onChange(1)} aria-label="Fixed number of years" />
        <input
          type="number"
          min={1}
          className={`${inputClass} w-20`}
          value={years ?? ""}
          disabled={years === null}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
          aria-label={`${label} in years`}
        />
        <span>year(s) from the Effective Date</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="radio" checked={years === null} onChange={() => onChange(null)} aria-label={openLabel} />
        <span>{openLabel}</span>
      </div>
    </fieldset>
  );
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
  const set = <K extends keyof NdaValues>(key: K, value: NdaValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const filled = useMemo(() => fillNda(coverPage, standardTerms, values), [coverPage, standardTerms, values]);
  const ready = values.effectiveDate && values.governingLaw && values.jurisdiction && values.purpose;

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 p-6 lg:grid-cols-[22rem_1fr]">
      <form className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" onSubmit={(e) => e.preventDefault()}>
        <h1 className="text-2xl font-semibold">Mutual NDA Creator</h1>
        <Field label="Purpose">
          <textarea
            className={inputClass}
            rows={3}
            value={values.purpose}
            onChange={(e) => set("purpose", e.target.value)}
          />
        </Field>
        <Field label="Effective date">
          <input
            type="date"
            className={inputClass}
            onChange={(e) =>
              set(
                "effectiveDate",
                e.target.value
                  ? new Date(`${e.target.value}T00:00`).toLocaleDateString("en-US", { dateStyle: "long" })
                  : "",
              )
            }
          />
        </Field>
        <TermField
          label="MNDA term"
          openLabel="Continues until terminated"
          years={values.mndaTermYears}
          onChange={(y) => set("mndaTermYears", y)}
        />
        <TermField
          label="Term of confidentiality"
          openLabel="In perpetuity"
          years={values.confidentialityYears}
          onChange={(y) => set("confidentialityYears", y)}
        />
        <Field label="Governing law (state)">
          <input
            className={inputClass}
            placeholder="Delaware"
            value={values.governingLaw}
            onChange={(e) => set("governingLaw", e.target.value)}
          />
        </Field>
        <Field label="Jurisdiction">
          <input
            className={inputClass}
            placeholder="courts located in New Castle, DE"
            value={values.jurisdiction}
            onChange={(e) => set("jurisdiction", e.target.value)}
          />
        </Field>
        <Field label="Modifications (optional)">
          <textarea
            className={inputClass}
            rows={3}
            value={values.modifications}
            onChange={(e) => set("modifications", e.target.value)}
          />
        </Field>
        <button
          type="button"
          disabled={!ready}
          onClick={() => download("Mutual-NDA.md", toDownloadMarkdown(filled))}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Download NDA (.md)
        </button>
        {!ready && <p className="text-xs text-zinc-500">Fill in all required fields to download.</p>}
      </form>
      <article className="nda-preview rounded border border-zinc-200 p-6 dark:border-zinc-800">
        <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {filled}
        </Markdown>
      </article>
    </main>
  );
}
