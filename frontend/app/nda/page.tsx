"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import NdaChat from "../components/NdaChat";

export default function NdaPage() {
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
    <div className="flex flex-col h-screen">
      <Navbar email={email} />
      <NdaChat />
    </div>
  );
}
