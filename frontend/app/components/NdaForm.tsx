"use client";

import { useState } from "react";
import { NdaData } from "../types";

interface Props {
  onSubmit: (data: NdaData) => void;
  initialData: NdaData | null;
}

const today = new Date().toISOString().split("T")[0];

const defaults: NdaData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: today,
  mndaTermType: "expires",
  mndaTermYears: 1,
  confidentialityTermType: "years",
  confidentialityTermYears: 1,
  governingLaw: "",
  jurisdiction: "",
  party1Company: "",
  party1Name: "",
  party1Title: "",
  party1Address: "",
  party2Company: "",
  party2Name: "",
  party2Title: "",
  party2Address: "",
};

export default function NdaForm({ onSubmit, initialData }: Props) {
  const [form, setForm] = useState<NdaData>(initialData ?? defaults);

  const set = (field: keyof NdaData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mutual NDA Creator</h1>
          <p className="mt-2 text-gray-500">Fill in the details below to generate your Mutual Non-Disclosure Agreement.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Agreement Details */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Agreement Details</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">How Confidential Information may be used</p>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.purpose}
                  onChange={(e) => set("purpose", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Effective Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.effectiveDate}
                  onChange={(e) => set("effectiveDate", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Term Settings */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Term Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MNDA Term <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-3">The length of this MNDA</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mndaTermType"
                      value="expires"
                      checked={form.mndaTermType === "expires"}
                      onChange={() => set("mndaTermType", "expires")}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Expires after</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      value={form.mndaTermYears}
                      disabled={form.mndaTermType !== "expires"}
                      onChange={(e) => set("mndaTermYears", Number(e.target.value))}
                    />
                    <span className="text-sm text-gray-700">year(s) from Effective Date</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="mndaTermType"
                      value="continuous"
                      checked={form.mndaTermType === "continuous"}
                      onChange={() => set("mndaTermType", "continuous")}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Continues until terminated</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term of Confidentiality <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-3">How long Confidential Information is protected</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="confidentialityTermType"
                      value="years"
                      checked={form.confidentialityTermType === "years"}
                      onChange={() => set("confidentialityTermType", "years")}
                      className="text-blue-600"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
                      value={form.confidentialityTermYears}
                      disabled={form.confidentialityTermType !== "years"}
                      onChange={(e) => set("confidentialityTermYears", Number(e.target.value))}
                    />
                    <span className="text-sm text-gray-700">year(s) from Effective Date (trade secrets protected until no longer legally a trade secret)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="confidentialityTermType"
                      value="perpetuity"
                      checked={form.confidentialityTermType === "perpetuity"}
                      onChange={() => set("confidentialityTermType", "perpetuity")}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">In perpetuity</span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Governing Law &amp; Jurisdiction</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Governing Law (State) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. California"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.governingLaw}
                  onChange={(e) => set("governingLaw", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jurisdiction <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. courts located in San Francisco, CA"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.jurisdiction}
                  onChange={(e) => set("jurisdiction", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Party 1 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Party 1</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party1Company}
                  onChange={(e) => set("party1Company", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party1Name}
                  onChange={(e) => set("party1Name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party1Title}
                  onChange={(e) => set("party1Title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Email or postal address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party1Address}
                  onChange={(e) => set("party1Address", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Party 2 */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Party 2</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party2Company}
                  onChange={(e) => set("party2Company", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party2Name}
                  onChange={(e) => set("party2Name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party2Title}
                  onChange={(e) => set("party2Title", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Email or postal address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.party2Address}
                  onChange={(e) => set("party2Address", e.target.value)}
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-brand-purple hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-opacity text-sm"
          >
            Generate Mutual NDA →
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Based on the{" "}
          <a
            href="https://commonpaper.com/standards/mutual-nda/1.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Common Paper Mutual NDA v1.0
          </a>{" "}
          — free to use under CC BY 4.0.
        </p>
      </div>
    </div>
  );
}
