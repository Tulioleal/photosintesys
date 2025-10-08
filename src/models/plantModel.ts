// src/models/plantModel.ts
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export const PlantAnalysisSchema = z.object({
  id: z.number().optional().nullable(),
  user_id: z.string().uuid(),
  image_url: z.string().url(),
  name: z.string().min(1),
  confidence: z.number().min(0).max(1),
  description: z.string().optional().nullable(),
  tips: z.array(z.string()).optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

export type PlantAnalysisInput = z.infer<typeof PlantAnalysisSchema>;

export class PlantModel {
  static async saveAnalysis(user_id: string, image_url: string, aiResult: Omit<PlantAnalysisInput, 'id' | 'user_id' | 'image_url' | 'createdAt'>) {
    const validated = PlantAnalysisSchema.omit({ id: true, createdAt: true }).parse({
      user_id,
      image_url,
      ...aiResult,
    });

    const { data, error } = await supabaseServer
      .from("plant_analysis")
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserAnalyses(user_id: string) {
    const { data, error } = await supabaseServer
      .from("plant_analysis")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
