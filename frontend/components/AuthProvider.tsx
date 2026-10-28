"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type User = { id: number; email: string };

type Auth = {
  user: User | null;
  loading: boolean;
  /** Signs in or up; resolves to an error message, or null on success. */
  authenticate: (mode: "signin" | "signup", email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth>(null!);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(mode: "signin" | "signup", email: string, password: string) {
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setUser(await res.json());
      return null;
    }
    const body = await res.json().catch(() => ({}));
    return typeof body.detail === "string" ? body.detail : "Enter a valid email and a password of 8 to 72 characters.";
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, authenticate, signOut }}>{children}</AuthContext.Provider>;
}
