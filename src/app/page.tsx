"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CameraIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/providers/AuthProvider";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ImageUpload } from "@/components/ImageUpload";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type IdentifyResult = {
  name: string;
  confidence: number;
  description?: string;
  tips?: string[];
  image_url?: string;
};

type PlantAnalysis = {
  id: number;
  created_at: string;
  image_url: string;
  name: string;
  confidence: number;
  description?: string;
  tips?: string[];
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  // Fetch user's recent analysis using React Query
  const { data: analysis = [], isLoading: analysisLoading } = useQuery<
    PlantAnalysis[]
  >({
    queryKey: ["analysis", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(
        `/api/analysis?user_id=${encodeURIComponent(user.id)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch analysis");
      return (json.data as PlantAnalysis[]) ?? [];
    },
    enabled: Boolean(user?.id),
  });

  const { mutate, status } = useMutation<IdentifyResult, Error, File>({
    mutationFn: async (file: File) => {
      const b64 = await fileToBase64(file);
      if (!user?.id) {
        router.push("/login");
        throw new Error("Not authenticated");
      }
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64, user_id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al identificar");
      return data as IdentifyResult;
    },
    onSuccess(data: IdentifyResult) {
      setResult(data);
      // Invalidate any queries that might depend on identification results
      qc.invalidateQueries({ queryKey: ["identify"] });
    },
    onError(err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    },
  });

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr_auto] bg-white">
      {/* Top bar */}
      <header
        className="px-5 pt-8 pb-4 flex items-center gap-3 justify-between"
        role="banner"
      >
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
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <UserIcon className="w-4 h-4 mr-2" />
                  My Plants
                </Button>
              </Link>
              <Link
                href="/login"
                className="text-sm text-[var(--color-primary-700)]"
              >
                Account
              </Link>
            </>
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
      <main className="px-5 pb-28 space-y-4" role="main">
        {!user && (
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Login to Save Your Plants
            </Button>
          </Link>
        )}

        {/* Search */}
        <div className="flex items-center gap-2" role="search">
          <div className="flex-1 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <MagnifyingGlassIcon
              className="size-5 text-[var(--color-primary-600)]"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants..."
              className="border-0 p-0 h-auto focus-visible:ring-0"
              aria-label="Search for plants"
            />
          </div>
        </div>

        {/* Image Upload */}
        <ImageUpload
          onImageSelect={(file) => {
            setError(null);
            setResult(null);
            mutate(file);
          }}
          loading={status === "pending"}
        />

        {/* Result */}
        {status === "pending" && (
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {result && (
          <PlantCard
            name={result.name}
            confidence={result.confidence}
            description={result.description}
            tips={result.tips}
            image_url={result.image_url}
          />
        )}

        {/* Recent Analysis */}
        {analysisLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {analysis.length === 0 && !analysisLoading && user && (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500 mb-4">
              No plants identified yet. Upload a photo to get started!
            </p>
          </div>
        )}

        {analysis.length > 0 && (
          <section>
            <h3 className="font-display text-lg mb-4">Recent Plants</h3>
            <div className="grid grid-cols-1 gap-4">
              {analysis.slice(0, 5).map((a: PlantAnalysis) => (
                <PlantCard
                  key={a.id}
                  name={a.name || "Unknown Plant"}
                  confidence={Number(a.confidence) || 0}
                  description={a.description}
                  tips={a.tips}
                  image_url={a.image_url}
                />
              ))}
            </div>
            {analysis.length > 5 && (
              <div className="text-center mt-4">
                <Link href="/dashboard">
                  <Button variant="outline">
                    View All Plants ({analysis.length})
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="grid grid-cols-4 gap-2 px-6 py-3">
          <NavItem icon={<HomeIcon className="size-6" />} label="Home" active />
          <NavItem icon={<CameraIcon className="size-6" />} label="Identify" />
          {user ? (
            <Link href="/dashboard">
              <NavItem
                icon={<UserIcon className="size-6" />}
                label="My Plants"
              />
            </Link>
          ) : (
            <Link href="/login">
              <NavItem icon={<UserIcon className="size-6" />} label="Login" />
            </Link>
          )}
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
