import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

const PlantIdentificationSchema = z.object({
  name: z.string().min(1, "Plant name is required"),
  confidence: z.number().min(0).max(1, "Confidence must be between 0 and 1"),
  description: z.string().optional().nullable(),
  tips: z.array(z.string()).optional().nullable(),
});

export type PlantIdentificationResult = z.infer<typeof PlantIdentificationSchema>;

export class AIService {
  private static model: ChatOpenAI | null = null;

  private static getModel(): ChatOpenAI {
    if (!this.model) {
      this.model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        maxTokens: 1000,
      });
    }
    return this.model;
  }

  static async identifyPlant(imageBase64: string): Promise<PlantIdentificationResult> {
    try {
      const model = this.getModel();
      const structuredModel = model.withStructuredOutput(PlantIdentificationSchema, {
        name: "PlantIdentification",
      });

      const messages = [
        new HumanMessage({
          content: [
            {
              type: "text",
              text: `Identify this plant from the image. Provide:
              - name: Common or scientific name
              - confidence: Your confidence level (0-1)
              - description: Brief description of the plant
              - tips: Array of care tips (watering, sunlight, soil, etc.)

              Be accurate and helpful for plant care.`,
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 },
            },
          ],
        }),
      ];

      const result = await structuredModel.invoke(messages);

      // Validate the result with Zod
      const validatedResult = PlantIdentificationSchema.parse(result);

      return validatedResult;
    } catch (error) {
      console.error("AI Service Error:", error);

      if (error instanceof z.ZodError) {
        throw new Error(`AI response validation failed: ${error.message}`);
      }

      throw new Error(
        error instanceof Error
          ? `Plant identification failed: ${error.message}`
          : "Plant identification failed due to an unknown error"
      );
    }
  }

  static async generatePlantCareGuide(plantName: string, description?: string): Promise<string[]> {
    try {
      const model = this.getModel();

      const prompt = `Generate detailed care tips for the plant "${plantName}".
      ${description ? `Description: ${description}` : ''}

      Provide 5-8 specific, actionable care tips covering:
      - Watering frequency and method
      - Light requirements
      - Soil type and pH
      - Temperature preferences
      - Fertilizing schedule
      - Common problems to watch for
      - Propagation methods

      Return as a JSON array of strings.`;

      const response = await model.invoke([new HumanMessage(prompt)]);
      const content = response.content as string;

      // Try to parse as JSON array
      try {
        const tips = JSON.parse(content);
        if (Array.isArray(tips) && tips.every(tip => typeof tip === 'string')) {
          return tips;
        }
      } catch {
        // If not valid JSON, split by lines or periods
        return content
          .split(/[.\n]/)
          .map(tip => tip.trim())
          .filter(tip => tip.length > 10)
          .slice(0, 8);
      }

      return [];
    } catch (error) {
      console.error("Care guide generation error:", error);
      return [];
    }
  }
}