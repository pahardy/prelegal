/** Fills the Common Paper Mutual NDA templates with a user's key terms. */

export type NdaValues = {
  purpose: string;
  effectiveDate: string;
  /** Years until the MNDA expires, or null if it continues until terminated. */
  mndaTermYears: number | null;
  /** Years confidential information is protected, or null for in perpetuity. */
  confidentialityYears: number | null;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
};

export const defaultValues: NdaValues = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: "",
  mndaTermYears: 1,
  confidentialityYears: 1,
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
};

const TRADE_SECRET_NOTE =
  "but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws";

function years(n: number): string {
  return `${n} year(s) from Effective Date`;
}

/** Replaces "expires at the end of the MNDA Term" in the standard terms. */
function mndaTermClause(v: NdaValues): string {
  return v.mndaTermYears === null
    ? "continues until terminated in accordance with the terms of this MNDA"
    : `expires ${years(v.mndaTermYears)}`;
}

/** Replaces "survive for the Term of Confidentiality" in the standard terms. */
function confidentialityClause(v: NdaValues): string {
  return v.confidentialityYears === null
    ? "survive in perpetuity"
    : `survive for ${years(v.confidentialityYears)}, ${TRADE_SECRET_NOTE}`;
}

function checkbox(checked: boolean): string {
  return checked ? "[x]" : "[ ]";
}

/** Replaces the bracketed placeholders in the cover page template. */
export function fillCoverPage(template: string, v: NdaValues): string {
  const termYears = v.mndaTermYears ?? 1;
  const confYears = v.confidentialityYears ?? 1;
  return template
    .replace("[Evaluating whether to enter into a business relationship with the other party.]", v.purpose)
    .replace("[Today’s date]", v.effectiveDate)
    .replace(
      /- \[[ x]\]\s+Expires \[1 year\(s\)\] from Effective Date\./,
      `- ${checkbox(v.mndaTermYears !== null)}     Expires ${termYears} year(s) from Effective Date.`,
    )
    .replace(
      /- \[[ x]\]\s+Continues until terminated/,
      `- ${checkbox(v.mndaTermYears === null)}     Continues until terminated`,
    )
    .replace(
      /- \[[ x]\]\s+\[1 year\(s\)\] from Effective Date, but/,
      `- ${checkbox(v.confidentialityYears !== null)}     ${confYears} year(s) from Effective Date, but`,
    )
    .replace(
      /- \[[ x]\]\s+In perpetuity\./,
      `- ${checkbox(v.confidentialityYears === null)}     In perpetuity.`,
    )
    .replace("[Fill in state]", v.governingLaw)
    .replace(/\[Fill in city or county and state[^\]]*\]/, v.jurisdiction)
    .replace("List any modifications to the MNDA", v.modifications.trim() || "None.");
}

/** Replaces each cover-page variable span in the standard terms with its value. */
export function fillStandardTerms(template: string, v: NdaValues): string {
  const values: Record<string, string> = {
    Purpose: v.purpose,
    "Effective Date": v.effectiveDate,
    "Governing Law": v.governingLaw,
    Jurisdiction: v.jurisdiction,
  };
  const withTerms = template
    .replace(
      /commences on the <span class="coverpage_link">Effective Date<\/span>/,
      `commences on ${v.effectiveDate}`,
    )
    .replace(
      /expires at the end of the <span class="coverpage_link">MNDA Term<\/span>/,
      mndaTermClause(v),
    )
    .replace(
      /survive for the <span class="coverpage_link">Term of Confidentiality<\/span>/,
      confidentialityClause(v),
    );
  return withTerms.replace(
    /<span class="coverpage_link">([^<]+)<\/span>/g,
    (match, name: string) => values[name] ?? match,
  );
}

/** Removes the helper <label> tags so the downloaded file is plain markdown. */
export function toDownloadMarkdown(filled: string): string {
  return filled.replace(/<label>.*?<\/label>\n?/g, "");
}

/** Builds the full filled-in NDA: cover page followed by standard terms. */
export function fillNda(coverPage: string, standardTerms: string, v: NdaValues): string {
  return `${fillCoverPage(coverPage, v)}\n\n---\n\n${fillStandardTerms(standardTerms, v)}`;
}
