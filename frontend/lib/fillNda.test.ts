import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { defaultValues, fillCoverPage, fillNda, fillStandardTerms, toDownloadMarkdown, type NdaValues } from "./fillNda";

const read = (name: string) => readFileSync(join(__dirname, "../../templates", name), "utf8");
const coverPage = read("Mutual-NDA-coverpage.md");
const standardTerms = read("Mutual-NDA.md");

const values: NdaValues = {
  ...defaultValues,
  effectiveDate: "January 1, 2027",
  governingLaw: "Delaware",
  jurisdiction: "courts located in New Castle, DE",
};

describe("fillCoverPage", () => {
  it("fills text fields and leaves no placeholders", () => {
    const out = fillCoverPage(coverPage, { ...values, purpose: "Evaluating a merger." });
    expect(out).toContain("Evaluating a merger.");
    expect(out).toContain("January 1, 2027");
    expect(out).toContain("Governing Law: Delaware");
    expect(out).toContain("Jurisdiction: courts located in New Castle, DE");
    expect(out).not.toMatch(/\[Fill in|\[Today/);
  });

  it("checks the matching MNDA term and confidentiality boxes", () => {
    const out = fillCoverPage(coverPage, { ...values, mndaTermYears: 3, confidentialityYears: null });
    expect(out).toContain("- [x]     Expires 3 year(s) from Effective Date.");
    expect(out).toContain("- [ ]     Continues until terminated");
    expect(out).toContain("- [ ]     1 year(s) from Effective Date, but");
    expect(out).toContain("- [x]     In perpetuity.");
  });

  it("checks the until-terminated box", () => {
    const out = fillCoverPage(coverPage, { ...values, mndaTermYears: null });
    expect(out).toContain("- [ ]     Expires 1 year(s) from Effective Date.");
    expect(out).toContain("- [x]     Continues until terminated");
  });

  it("writes None when there are no modifications", () => {
    expect(fillCoverPage(coverPage, values)).toContain("None.");
    expect(fillCoverPage(coverPage, { ...values, modifications: "Add clause X." })).toContain("Add clause X.");
  });
});

describe("fillStandardTerms", () => {
  it("replaces every variable span", () => {
    const out = fillStandardTerms(standardTerms, values);
    expect(out).not.toContain("coverpage_link");
    expect(out).toContain("laws of the State of Delaware");
    expect(out).toContain("courts located in New Castle, DE");
    expect(out).toContain("commences on January 1, 2027 and expires 1 year(s) from Effective Date.");
  });

  it("describes perpetual confidentiality", () => {
    const out = fillStandardTerms(standardTerms, { ...values, confidentialityYears: null });
    expect(out).toContain("will survive in perpetuity, despite any expiration");
  });

  it("describes an MNDA that continues until terminated", () => {
    const out = fillStandardTerms(standardTerms, { ...values, mndaTermYears: null });
    expect(out).toContain("continues until terminated in accordance with the terms of this MNDA");
    expect(out).not.toContain("coverpage_link");
  });
});

describe("toDownloadMarkdown", () => {
  it("strips label tags", () => {
    const out = toDownloadMarkdown(fillNda(coverPage, standardTerms, values));
    expect(out).not.toContain("<label>");
    expect(out).toContain("### Purpose\n");
  });
});

describe("fillNda", () => {
  it("joins the cover page and standard terms", () => {
    const out = fillNda(coverPage, standardTerms, values);
    expect(out.indexOf("# Mutual Non-Disclosure Agreement")).toBeLessThan(out.indexOf("# Standard Terms"));
  });
});
