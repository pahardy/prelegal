"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NdaForm from "../components/NdaForm";
import NdaPreview from "../components/NdaPreview";
import Navbar from "../components/Navbar";
import { NdaData } from "../types";

export default function NdaPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [ndaData, setNdaData] = useState<NdaData | null>(null);

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

  const handleFormSubmit = (data: NdaData) => {
    setNdaData(data);
    setStep("preview");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={email} />
      {step === "form" ? (
        <NdaForm onSubmit={handleFormSubmit} initialData={ndaData} />
      ) : (
        <NdaPreview data={ndaData!} onEdit={() => setStep("form")} />
      )}
    </div>
  );
}
