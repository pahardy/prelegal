"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { DISCLAIMER } from "@/lib/disclaimer";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

/** Sign in / sign up card beside a brand panel. */
export default function AuthScreen() {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(await authenticate(mode, email, password));
    setBusy(false);
  }

  const signingIn = mode === "signin";
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
        <p className="text-2xl font-semibold">
          Pre<span className="text-accent">legal</span>
        </p>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Draft legal agreements by simply talking.</h2>
          <p className="mt-4 max-w-md text-white/70">
            Tell our AI what you need. It asks the right questions, fills in the terms and gives you a document to download.
          </p>
        </div>
        <p className="text-sm text-white/50">{DISCLAIMER}</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-navy">{signingIn ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted">{signingIn ? "Sign in to your documents." : "Start drafting in minutes."}</p>
          <label className="mt-6 block text-sm font-medium">
            Email
            <input type="email" required autoFocus className={`${inputClass} mt-1`} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              required
              minLength={8}
              maxLength={72}
              className={`${inputClass} mt-1`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg bg-submit px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {signingIn ? "Sign in" : "Create account"}
          </button>
          <p className="mt-4 text-center text-sm text-muted">
            {signingIn ? "New to Prelegal?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-brand hover:underline"
              onClick={() => {
                setMode(signingIn ? "signup" : "signin");
                setError(null);
              }}
            >
              {signingIn ? "Create an account" : "Sign in"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
