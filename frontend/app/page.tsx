"use client";

import { useState } from "react";
import NdaForm from "./components/NdaForm";
import NdaPreview from "./components/NdaPreview";
import { NdaData } from "./types";

export default function Home() {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [ndaData, setNdaData] = useState<NdaData | null>(null);

  const handleFormSubmit = (data: NdaData) => {
    setNdaData(data);
    setStep("preview");
  };

  return (
    <main>
      {step === "form" ? (
        <NdaForm onSubmit={handleFormSubmit} initialData={ndaData} />
      ) : (
        <NdaPreview data={ndaData!} onEdit={() => setStep("form")} />
      )}
    </main>
  );
}
