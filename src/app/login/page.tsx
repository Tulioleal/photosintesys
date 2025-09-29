"use client";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function LoginPage() {
  const { session, loading, signInWithEmail, signInWithProvider, signOut } =
    useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await signInWithEmail(email);
      setMessage("Check your email for the sign-in link");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg ?? "Could not send magic link");
    }
  };

  const onProvider = async (provider: "google" | "github") => {
    setMessage(null);
    setError(null);
    try {
      await signInWithProvider(provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg ?? "Could not sign in");
    }
  };

  if (session) {
    const user = session.user as User;
    return (
      <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-white">
        <header className="px-5 pt-8 pb-4">
          <h1 className="font-display text-2xl">Account</h1>
          <p className="text-sm text-neutral-500">Signed in as {user.email}</p>
        </header>
        <main className="px-5 pb-28 space-y-6">
          <button
            disabled={loading}
            onClick={signOut}
            className="btn btn-primary w-full"
          >
            Sign out
          </button>
        </main>
        <nav className="navbar">
          <div className="grid grid-cols-1 px-6 py-3">
            <Link href="/" className="text-center text-white/90">
              Back to Home
            </Link>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-white">
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-display text-2xl">Login</h1>
        <p className="text-sm text-neutral-500">Sign in to save your plants</p>
      </header>

      <main className="px-5 pb-28 space-y-6">
        <form onSubmit={onEmailSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onProvider("google")}
            disabled={loading}
            className="btn w-full"
          >
            Continue with Google
          </button>
          <button
            onClick={() => onProvider("github")}
            disabled={loading}
            className="btn w-full"
          >
            Continue with GitHub
          </button>
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </main>

      <nav className="navbar">
        <div className="grid grid-cols-1 px-6 py-3">
          <Link href="/" className="text-center text-white/90">
            Back to Home
          </Link>
        </div>
      </nav>
    </div>
  );
}
