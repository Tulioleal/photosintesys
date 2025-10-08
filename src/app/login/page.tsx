"use client";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "react-toastify";

export default function LoginPage() {
  const { session, loading, signInWithEmail, signInWithPassword, signOut } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password) {
        await signInWithPassword(email, password);
        toast.success("Signed in successfully!");
      } else {
        await signInWithEmail(email);
        toast.success("Check your email for the sign-in link");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg ?? "Could not sign in");
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
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input w-full"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (optional for magic link)"
            className="input w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading
              ? "Signing in..."
              : password
              ? "Sign in"
              : "Send magic link"}
          </button>
        </form>
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
