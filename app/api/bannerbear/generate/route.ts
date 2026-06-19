import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateBBSlides, generateBBThumbnails } from "@/lib/bannerbear";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, slides, concepts, templateId } = body;

    if (!templateId) {
      return NextResponse.json({ ok: false, error: "Missing Bannerbear template ID" }, { status: 400 });
    }

    if (type === "carousel" && slides?.length) {
      const images = await generateBBSlides(slides, templateId);
      return NextResponse.json({ ok: true, images });
    }

    if (type === "thumbnail" && concepts?.length) {
      const images = await generateBBThumbnails(concepts, templateId);
      return NextResponse.json({ ok: true, images });
    }

    return NextResponse.json({ ok: false, error: "Invalid type or missing data" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
