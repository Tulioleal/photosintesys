"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";

type SessionType = Session | null;

type AuthContextType = {
  session: SessionType;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithProvider: (provider: "google" | "github") => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionType>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session as Session | null);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as Session | null);
      setInitializing(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Client-side redirect when unauthenticated and configured
  useEffect(() => {
    if (!initializing && !session) {
      const path = "/login";
      const current =
        typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`${path}?redirectedFrom=${encodeURIComponent(current)}`);
    }
  }, [initializing, session, router]);

  const signInWithEmail = async (email: string) => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}`
              : undefined,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithEmail,
    signInWithProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
