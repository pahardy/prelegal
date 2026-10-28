"use client";

import AuthScreen from "@/components/AuthScreen";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import Workspace from "@/components/Workspace";

function Gate() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-8 text-sm text-muted">Loading...</p>;
  return user ? <Workspace /> : <AuthScreen />;
}

export default function Home() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
