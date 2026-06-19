import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { prompt, apiKey } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ ok: false, error: "Missing prompt" }, { status: 400 });
    }

    const imageUrl = await generateImage(prompt, apiKey);
    return NextResponse.json({ ok: true, imageUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gemini generation failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
