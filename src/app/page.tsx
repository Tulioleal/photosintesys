"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  CameraIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  BellIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/providers/AuthProvider";

type IdentifyResult = {
  name: string;
  confidence: number;
  description?: string;
  tips?: string[];
  imageUrl?: string;
};

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const onPickImage = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al identificar");
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-white">
      {/* Top bar */}
      <header className="px-5 pt-8 pb-4 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-[var(--color-primary-100)]" />
          <div>
            <h1 className="font-display text-2xl text-[var(--color-primary-600)]">
              Photosintesys
            </h1>
            <p className="text-xs text-neutral-500">
              Identify and care for your plants
            </p>
          </div>
        </div>
        <div>
          {session ? (
            <Link
              href="/login"
              className="text-sm text-[var(--color-primary-700)]"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[var(--color-primary-700)]"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-28 space-y-4">
        <Link href="/login" className="btn btn-ghost w-full text-center">
          Go to Login
        </Link>
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <MagnifyingGlassIcon className="size-5 text-[var(--color-primary-600)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 outline-none text-sm"
            />
          </div>
          <button
            onClick={onPickImage}
            className="btn btn-primary whitespace-nowrap"
          >
            <CameraIcon className="size-5 mr-2" /> Identify
          </button>
          <input
            ref={fileRef}
            accept="image/*"
            type="file"
            capture="environment"
            hidden
            onChange={onFileChange}
          />
        </div>

        {/* Result card */}
        {loading && (
          <div className="card p-4 animate-pulse">
            <div className="h-4 w-24 bg-black/10 rounded mb-2" />
            <div className="h-3 w-40 bg-black/10 rounded" />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && (
          <article className="card overflow-hidden">
            {result.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.imageUrl}
                alt={result.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4 space-y-2">
              <h2 className="font-display text-xl">{result.name}</h2>
              <p className="text-xs text-neutral-500">
                Confidence: {(result.confidence * 100).toFixed(0)}%
              </p>
              {result.description && (
                <p className="text-sm leading-relaxed">{result.description}</p>
              )}
              {result.tips && result.tips.length > 0 && (
                <div>
                  <h3 className="font-display text-lg mb-1">Care tips</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {result.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </article>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="navbar">
        <div className="grid grid-cols-4 gap-2 px-6 py-3">
          <NavItem icon={<HomeIcon className="size-6" />} label="Home" active />
          <NavItem
            icon={<CameraIcon className="size-6" />}
            label="Identify"
            onClick={onPickImage}
          />
          <NavItem icon={<BellIcon className="size-6" />} label="Reminders" />
          <NavItem
            icon={<Cog6ToothIcon className="size-6" />}
            label="Settings"
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-1 rounded-xl ${
        active ? "bg-white/10" : ""
      }`}
    >
      <span className="text-white">{icon}</span>
      <span className="text-[11px] text-white/90">{label}</span>
    </button>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
