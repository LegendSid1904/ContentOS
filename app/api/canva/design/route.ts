import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCanvaDesign, exportDesign } from "@/lib/canva";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, designType, slides, brandTemplateId } = body;

    if (!title || !slides?.length) {
      return NextResponse.json({ ok: false, error: "Missing title or slides" }, { status: 400 });
    }

    const data: Record<string, string> = {};
    slides.forEach((slide: { headline: string; copy: string; slide_number: number }, i: number) => {
      data[`slide_${i + 1}_headline`] = slide.headline;
      data[`slide_${i + 1}_copy`] = slide.copy;
    });

    const result = await createCanvaDesign(userId, {
      title,
      designType: designType || "custom",
      brandTemplateId,
      templateId: brandTemplateId,
      data,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Design creation failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
