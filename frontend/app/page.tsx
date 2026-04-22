"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/Navbar";

interface DocumentCard {
  name: string;
  description: string;
  href?: string;
}

const DOCUMENTS: DocumentCard[] = [
  {
    name: "Mutual Non-Disclosure Agreement",
    description: "Standard mutual NDA for both parties to share confidential information for a defined purpose.",
    href: "/nda",
  },
  {
    name: "Mutual NDA Cover Page",
    description: "Cover page for the Mutual NDA with party details, effective date, and signature blocks.",
  },
  {
    name: "Cloud Service Agreement",
    description: "Comprehensive SaaS agreement covering access, privacy, payment, and liability.",
  },
  {
    name: "Design Partner Agreement",
    description: "Early-access program agreement: pre-release product access in exchange for structured feedback.",
  },
  {
    name: "Service Level Agreement",
    description: "Uptime targets, response times, service credit calculations, and remedies.",
  },
  {
    name: "Professional Services Agreement",
    description: "SOW-based delivery, IP assignment, payment terms, and confidentiality.",
  },
  {
    name: "Data Processing Agreement",
    description: "GDPR-compliant agreement governing personal data processing by a service provider.",
  },
  {
    name: "Software License Agreement",
    description: "On-premise or self-hosted software: license scope, restrictions, warranty, and subscriptions.",
  },
  {
    name: "Partnership Agreement",
    description: "Business partnerships covering co-obligations, trademark licensing, and indemnification.",
  },
  {
    name: "Pilot Agreement",
    description: "Short-term evaluation agreement before committing to a definitive contract.",
  },
  {
    name: "Business Associate Agreement",
    description: "HIPAA-required agreement governing the use and protection of protected health information.",
  },
  {
    name: "AI Addendum",
    description: "Addendum governing AI/ML services: model training restrictions, IP ownership, and disclaimers.",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/login");
      return;
    }
    try {
      setEmail(JSON.parse(raw).email);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={email} />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-navy">Documents</h2>
          <p className="mt-1 text-sm text-brand-gray">Choose a document type to get started.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENTS.map((doc) => {
            const isAvailable = Boolean(doc.href);
            const card = (
              <div
                className={`bg-white rounded-xl border p-5 flex flex-col gap-3 transition-shadow ${
                  isAvailable
                    ? "border-gray-200 hover:shadow-md cursor-pointer"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-brand-navy leading-snug">{doc.name}</h3>
                  {!isAvailable && (
                    <span className="shrink-0 text-xs bg-gray-100 text-brand-gray px-2 py-0.5 rounded-full">
                      Coming soon
                    </span>
                  )}
                  {isAvailable && (
                    <span className="shrink-0 text-xs bg-blue-50 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                      Available
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{doc.description}</p>
              </div>
            );

            return isAvailable ? (
              <Link key={doc.name} href={doc.href!}>
                {card}
              </Link>
            ) : (
              <div key={doc.name}>{card}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
