"use client";

import { NdaData } from "../types";

interface Props {
  data: NdaData;
  onEdit: () => void;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function mndaTermLabel(data: NdaData): string {
  if (data.mndaTermType === "expires") {
    return `Expires ${data.mndaTermYears} year(s) from Effective Date.`;
  }
  return "Continues until terminated in accordance with the terms of the MNDA.";
}

function confidentialityTermLabel(data: NdaData): string {
  if (data.confidentialityTermType === "years") {
    return `${data.confidentialityTermYears} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`;
  }
  return "In perpetuity.";
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-blue-50 text-blue-800 px-1 rounded font-medium">
      {children}
    </span>
  );
}

function generateMarkdown(data: NdaData): string {
  const mndaTerm = mndaTermLabel(data);
  const confidentialityTerm = confidentialityTermLabel(data);
  const effectiveDateStr = formatDate(data.effectiveDate);

  return `# Mutual Non-Disclosure Agreement

## Cover Page

**Purpose:** ${data.purpose}

**Effective Date:** ${effectiveDateStr}

**MNDA Term:** ${mndaTerm}

**Term of Confidentiality:** ${confidentialityTerm}

**Governing Law:** ${data.governingLaw}

**Jurisdiction:** ${data.jurisdiction}

| | PARTY 1 | PARTY 2 |
|:---|:---:|:---:|
| Company | ${data.party1Company} | ${data.party2Company} |
| Print Name | ${data.party1Name} | ${data.party2Name} |
| Title | ${data.party1Title} | ${data.party2Title} |
| Notice Address | ${data.party1Address} | ${data.party2Address} |
| Signature | | |
| Date | | |

---

## Standard Terms

1. **Introduction**. This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) ("**MNDA**") allows each party ("**Disclosing Party**") to disclose or make available information in connection with the **${data.purpose}** which (1) the Disclosing Party identifies to the receiving party ("**Receiving Party**") as "confidential", "proprietary", or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure ("**Confidential Information**"). Each party's Confidential Information also includes the existence and status of the parties' discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms ("**Cover Page**"). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.

2. **Use and Protection of Confidential Information**. The Receiving Party shall: (a) use Confidential Information solely for the **${data.purpose}**; (b) not disclose Confidential Information to third parties without the Disclosing Party's prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the **${data.purpose}**, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.

3. **Exceptions**. The Receiving Party's obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.

4. **Disclosures Required by Law**. The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party's expense, with the Disclosing Party's efforts to obtain confidential treatment for the Confidential Information.

5. **Term and Termination**. This MNDA commences on the **${effectiveDateStr}** and expires at the end of the **${mndaTerm}** Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party's obligations relating to Confidential Information will survive for the **${confidentialityTerm}**, despite any expiration or termination of this MNDA.

6. **Return or Destruction of Confidential Information**. Upon expiration or termination of this MNDA or upon the Disclosing Party's earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party's written request, destroy all Confidential Information in the Receiving Party's possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.

7. **Proprietary Rights**. The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.

8. **Disclaimer**. ALL CONFIDENTIAL INFORMATION IS PROVIDED "AS IS", WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.

9. **Governing Law and Jurisdiction**. This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of **${data.governingLaw}**, without regard to the conflict of laws provisions of such **${data.governingLaw}**. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in **${data.jurisdiction}**. Each party irrevocably submits to the exclusive jurisdiction of such **${data.jurisdiction}** in any such suit, action, or proceeding.

10. **Equitable Relief**. A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.

11. **General**. Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party's permitted successors and assigns. Waivers must be signed by the waiving party's authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.

---

Common Paper Mutual Non-Disclosure Agreement Version 1.0 — free to use under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
`;
}

export default function NdaPreview({ data, onEdit }: Props) {
  const effectiveDateStr = formatDate(data.effectiveDate);
  const mndaTerm = mndaTermLabel(data);
  const confidentialityTerm = confidentialityTermLabel(data);

  const handleDownloadMarkdown = () => {
    const content = generateMarkdown(data);
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Mutual-NDA.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Action Bar */}
      <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Edit Details
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadMarkdown}
            className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Download .md
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="document-container max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-10 font-serif text-gray-900">
        <h1 className="text-2xl font-bold text-center mb-1">Mutual Non-Disclosure Agreement</h1>
        <p className="text-center text-sm text-gray-500 mb-8">
          Common Paper Mutual NDA — Version 1.0
        </p>

        {/* Cover Page */}
        <section className="mb-10">
          <h2 className="text-base font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-2 mb-5">
            Cover Page
          </h2>

          <div className="space-y-5 text-sm leading-relaxed">
            <div>
              <span className="font-bold">Purpose: </span>
              <Highlight>{data.purpose}</Highlight>
            </div>
            <div>
              <span className="font-bold">Effective Date: </span>
              <Highlight>{effectiveDateStr}</Highlight>
            </div>
            <div>
              <span className="font-bold">MNDA Term: </span>
              <Highlight>{mndaTerm}</Highlight>
            </div>
            <div>
              <span className="font-bold">Term of Confidentiality: </span>
              <Highlight>{confidentialityTerm}</Highlight>
            </div>
            <div>
              <span className="font-bold">Governing Law: </span>
              <Highlight>{data.governingLaw}</Highlight>
            </div>
            <div>
              <span className="font-bold">Jurisdiction: </span>
              <Highlight>{data.jurisdiction}</Highlight>
            </div>
          </div>

          {/* Signature Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 w-36"></th>
                  <th className="text-center py-2 px-4 font-bold border border-gray-300 bg-gray-50">
                    {data.party1Company || "Party 1"}
                  </th>
                  <th className="text-center py-2 px-4 font-bold border border-gray-300 bg-gray-50">
                    {data.party2Company || "Party 2"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Company", data.party1Company, data.party2Company],
                  ["Print Name", data.party1Name, data.party2Name],
                  ["Title", data.party1Title, data.party2Title],
                  ["Notice Address", data.party1Address, data.party2Address],
                  ["Signature", "", ""],
                  ["Date", "", ""],
                ].map(([label, val1, val2]) => (
                  <tr key={label}>
                    <td className="py-3 pr-4 font-medium text-gray-600">{label}</td>
                    <td className="py-3 px-4 border border-gray-300 text-center min-h-[2.5rem]">{val1}</td>
                    <td className="py-3 px-4 border border-gray-300 text-center min-h-[2.5rem]">{val2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Standard Terms */}
        <section>
          <h2 className="text-base font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-2 mb-5">
            Standard Terms
          </h2>

          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              <span className="font-bold">1. Introduction.</span> This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;<strong>Disclosing Party</strong>&rdquo;) to disclose or make available information in connection with the <Highlight>{data.purpose}</Highlight> which (1) the Disclosing Party identifies to the receiving party (&ldquo;<strong>Receiving Party</strong>&rdquo;) as &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;, or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure (&ldquo;<strong>Confidential Information</strong>&rdquo;). Each party&apos;s Confidential Information also includes the existence and status of the parties&apos; discussions and information on the Cover Page. Confidential Information includes technical or business information, product designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard Terms (&ldquo;<strong>Cover Page</strong>&rdquo;). Each party is identified on the Cover Page and capitalized terms have the meanings given herein or on the Cover Page.
            </p>

            <p>
              <span className="font-bold">2. Use and Protection of Confidential Information.</span> The Receiving Party shall: (a) use Confidential Information solely for the <Highlight>{data.purpose}</Highlight>; (b) not disclose Confidential Information to third parties without the Disclosing Party&apos;s prior written approval, except that the Receiving Party may disclose Confidential Information to its employees, agents, advisors, contractors and other representatives having a reasonable need to know for the <Highlight>{data.purpose}</Highlight>, provided these representatives are bound by confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect Confidential Information using at least the same protections the Receiving Party uses for its own similar information but no less than a reasonable standard of care.
            </p>

            <p>
              <span className="font-bold">3. Exceptions.</span> The Receiving Party&apos;s obligations in this MNDA do not apply to information that it can demonstrate: (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully obtained from a third party without confidentiality restrictions; or (d) it independently developed without using or referencing the Confidential Information.
            </p>

            <p>
              <span className="font-bold">4. Disclosures Required by Law.</span> The Receiving Party may disclose Confidential Information to the extent required by law, regulation or regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the Disclosing Party&apos;s expense, with the Disclosing Party&apos;s efforts to obtain confidential treatment for the Confidential Information.
            </p>

            <p>
              <span className="font-bold">5. Term and Termination.</span> This MNDA commences on the <Highlight>{effectiveDateStr}</Highlight> and expires at the end of the <Highlight>{mndaTerm}</Highlight> Either party may terminate this MNDA for any or no reason upon written notice to the other party. The Receiving Party&apos;s obligations relating to Confidential Information will survive for the <Highlight>{confidentialityTerm}</Highlight>, despite any expiration or termination of this MNDA.
            </p>

            <p>
              <span className="font-bold">6. Return or Destruction of Confidential Information.</span> Upon expiration or termination of this MNDA or upon the Disclosing Party&apos;s earlier request, the Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party&apos;s written request, destroy all Confidential Information in the Receiving Party&apos;s possession or control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may retain Confidential Information in accordance with its standard backup or record retention policies or as required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.
            </p>

            <p>
              <span className="font-bold">7. Proprietary Rights.</span> The Disclosing Party retains all of its intellectual property and other rights in its Confidential Information and its disclosure to the Receiving Party grants no license under such rights.
            </p>

            <p>
              <span className="font-bold">8. Disclaimer.</span> ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
            </p>

            <p>
              <span className="font-bold">9. Governing Law and Jurisdiction.</span> This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the State of <Highlight>{data.governingLaw}</Highlight>, without regard to the conflict of laws provisions of such <Highlight>{data.governingLaw}</Highlight>. Any legal suit, action, or proceeding relating to this MNDA must be instituted in the federal or state courts located in <Highlight>{data.jurisdiction}</Highlight>. Each party irrevocably submits to the exclusive jurisdiction of such <Highlight>{data.jurisdiction}</Highlight> in any such suit, action, or proceeding.
            </p>

            <p>
              <span className="font-bold">10. Equitable Relief.</span> A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an injunction, in addition to its other remedies.
            </p>

            <p>
              <span className="font-bold">11. General.</span> Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the other party, except that either party may assign this MNDA in connection with a merger, reorganization, acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party&apos;s permitted successors and assigns. Waivers must be signed by the waiving party&apos;s authorized representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified, waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which is deemed an original and which together form the same agreement.
            </p>
          </div>

          <p className="mt-8 text-xs text-gray-400 text-center">
            Common Paper Mutual Non-Disclosure Agreement{" "}
            <a
              href="https://commonpaper.com/standards/mutual-nda/1.0/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Version 1.0
            </a>{" "}
            — free to use under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 4.0
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
