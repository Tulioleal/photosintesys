// src/controllers/plantController.ts
import { z } from "zod";
import { PlantModel } from "@/models/plantModel";
import { AIService } from "@/services/aiService";
import { validateBase64Image, sanitizeString, UserActionLimiter } from "@/lib/security";

const IdentifySchema = z.object({
  image: z.string().min(10),
  user_id: z.string().uuid(),
});

export class PlantController {
  static async identifyPlant(req: Request) {
    try {
      const body = await req.json();
      const { image, user_id } = IdentifySchema.parse(body);

      // Validate image data
      const imageValidation = validateBase64Image(image);
      if (!imageValidation.valid) {
        return { success: false, error: imageValidation.error };
      }

      // Rate limit user actions (max 5 identifications per hour)
      const canIdentify = UserActionLimiter.canPerformAction(
        user_id,
        "identify_plant",
        5,
        60 * 60 * 1000 // 1 hour
      );

      if (!canIdentify) {
        return { success: false, error: "Rate limit exceeded. Please try again later." };
      }

      const aiResult = await AIService.identifyPlant(image);

      // Sanitize AI results
      const sanitizedResult = {
        name: sanitizeString(aiResult.name, 100),
        confidence: aiResult.confidence,
        description: aiResult.description ? sanitizeString(aiResult.description, 500) : undefined,
        tips: aiResult.tips?.map(tip => sanitizeString(tip, 200)) || [],
      };

      const savedAnalysis = await PlantModel.saveAnalysis(user_id, image, sanitizedResult);

      return { success: true, data: { ...sanitizedResult, saved: savedAnalysis } };
    } catch (error) {
      console.error("Plant identification error:", error);
      const message = error instanceof Error ? error.message : "Failed to identify plant";
      return { success: false, error: message };
    }
  }

  static async getUserAnalyses(user_id: string) {
    try {
      const analyses = await PlantModel.getUserAnalyses(user_id);
      return { success: true, data: analyses };
    } catch (error) {
      console.error("Get user analyses error:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch analyses";
      return { success: false, error: message };
    }
  }
}
