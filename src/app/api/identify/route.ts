import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

const BodySchema = z.object({ image: z.string().min(10) });

const ResultSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
  description: z.string().optional(),
  tips: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { image } = BodySchema.parse(json);

    const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });
    const structured = model.withStructuredOutput(ResultSchema, { name: "PlantRecognition" });

    const result = await structured.invoke([
      new HumanMessage({
        content: [
          { type: "text", text: "Identify the plant in the image. Return JSON with name (common or scientific), confidence (0-1), description and care tips." },
          { type: "image_url", image_url: { url: image } },
        ],
      }),
    ]);

    return NextResponse.json({ ...result, imageUrl: image });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
