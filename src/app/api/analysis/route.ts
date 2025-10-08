import { NextRequest, NextResponse } from "next/server";
import { PlantController } from "@/controllers/platController";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id parameter" }, { status: 400 });
    }

    const result = await PlantController.getUserAnalyses(user_id);

    if (result.success) {
      return NextResponse.json({ data: result.data });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
