import { describe, expect, it } from "vitest";
import { fillGeneric, fillTerms, toPlainMarkdown } from "./fillGeneric";

const md = 'During the <span class="orderform_link">Pilot Period</span>, <span class="orderform_link">Customer’s</span> use is limited.';

describe("fillTerms", () => {
  it("substitutes values and keeps the possessive", () => {
    expect(fillTerms(md, { "Pilot Period": "60 days", Customer: "Acme" })).toBe(
      "During the 60 days, Acme’s use is limited.",
    );
  });

  it("leaves unset terms as their name", () => {
    expect(fillTerms(md, { Customer: "Acme" })).toContain("During the Pilot Period,");
  });
});

describe("fillGeneric", () => {
  it("puts a key terms table before the standard terms", () => {
    const info = { name: "Pilot Agreement", files: [md], terms: ["Pilot Period", "Customer"] };
    const out = fillGeneric(info, { Customer: "Acme" });
    expect(out).toContain("# Pilot Agreement");
    expect(out).toContain("| Customer | Acme |");
    expect(out).toContain("| Pilot Period |  |");
    expect(out.indexOf("Key Terms")).toBeLessThan(out.indexOf("During the"));
  });
});

describe("toPlainMarkdown", () => {
  it("strips span tags", () => {
    expect(toPlainMarkdown(md)).not.toContain("<span");
  });
});
