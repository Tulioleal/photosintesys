"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { PlantCard } from "@/components/PlantCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Leaf, TrendingUp, Calendar } from "lucide-react";

type PlantAnalysis = {
  id: number;
  created_at: string;
  image_url: string;
  name: string;
  confidence: number;
  description?: string;
  tips?: string[];
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: analyses = [], isLoading } = useQuery<PlantAnalysis[]>({
    queryKey: ["user-analyses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(
        `/api/analysis?user_id=${encodeURIComponent(user.id)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch analyses");
      return (json.data as PlantAnalysis[]) || [];
    },
    enabled: Boolean(user?.id),
  });

  const stats = {
    totalPlants: analyses.length,
    averageConfidence:
      analyses.length > 0
        ? analyses.reduce(
            (sum: number, a: PlantAnalysis) =>
              sum + (Number(a.confidence) || 0),
            0
          ) / analyses.length
        : 0,
    recentActivity: analyses.filter((a: PlantAnalysis) => {
      const createdAt = new Date(a.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh grid grid-rows-[auto_1fr] bg-white">
        <header className="px-5 pt-8 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-green-100 animate-pulse" />
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </header>
        <main className="px-5 py-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-8 w-8 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-32 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr] bg-white">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -m-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-green-700">
                My Plants
              </h1>
              <p className="text-sm text-gray-500">
                {user?.email
                  ? `Welcome back, ${user.email.split("@")[0]}!`
                  : "Your plant collection"}
              </p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Leaf className="w-4 h-4 mr-2" />
              Identify New
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {stats.totalPlants}
              </div>
              <div className="text-xs text-gray-500">Plants Identified</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {(stats.averageConfidence * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Avg Confidence</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {stats.recentActivity}
              </div>
              <div className="text-xs text-gray-500">This Week</div>
            </CardContent>
          </Card>
        </div>

        {/* Plant Collection */}
        <section>
          <h2 className="font-display text-xl mb-4">Your Plant Collection</h2>

          {analyses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  No plants identified yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by uploading a photo of a plant to identify it and add
                  it to your collection.
                </p>
                <Link href="/">
                  <Button>
                    <Leaf className="w-4 h-4 mr-2" />
                    Identify Your First Plant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyses.map((analysis: PlantAnalysis) => (
                <PlantCard
                  key={analysis.id}
                  name={analysis.name || "Unknown Plant"}
                  confidence={Number(analysis.confidence) || 0}
                  description={analysis.description}
                  tips={analysis.tips}
                  image_url={analysis.image_url}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
