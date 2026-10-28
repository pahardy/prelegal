/** Fills the generic (non-NDA) templates, whose key terms are marked as <span class="..._link"> elements. */

export type TemplateInfo = { name: string; files: string[]; terms: string[] };

const TERM_SPAN = /<span class="(?:coverpage|orderform|keyterms|sow)_link">([^<]+)<\/span>/g;
const POSSESSIVE = /[’']s$/;

/** Replaces each key-term span with its value; terms without a value keep their name. */
export function fillTerms(markdown: string, values: Record<string, string>): string {
  return markdown.replace(TERM_SPAN, (_, text: string) => {
    const name = text.replace(POSSESSIVE, "");
    const value = values[name];
    return value ? `${value}${text.slice(name.length)}` : text;
  });
}

/** Builds the full document: a Key Terms table followed by the standard terms. */
export function fillGeneric(info: TemplateInfo, values: Record<string, string>): string {
  const rows = info.terms.map((t) => `| ${t} | ${values[t] ?? ""} |`).join("\n");
  const table = `## Key Terms\n\n| Term | Value |\n| --- | --- |\n${rows}`;
  return `# ${info.name}\n\n${table}\n\n---\n\n${fillTerms(info.files.join("\n\n"), values)}`;
}

/** Removes leftover HTML spans so the downloaded file is plain markdown. */
export function toPlainMarkdown(filled: string): string {
  return filled.replace(/<\/?span[^>]*>/g, "");
}
