"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Slide {
  slide_number: number;
  headline: string;
  copy: string;
  visual_direction: string;
}

interface CoverHeadlines {
  variants: string[];
}

interface CarouselOutline {
  slides: Slide[];
}

export async function generateCarouselOutline(topic: string, audience: string, platform: string, slideCount: number) {
  try {
    const result = await generateJSON<CarouselOutline>({
      systemPrompt: `You are a carousel strategist. Create a ${slideCount}-slide narrative arc. Each slide must have: slide_number, headline, copy (1-3 lines), visual_direction. Return as JSON with a "slides" array.`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Generate exactly ${slideCount} slides.`,
    });
    return { ok: true as const, data: result.slides };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function generateCoverHeadlines(topic: string, audience: string) {
  try {
    const result = await generateJSON<CoverHeadlines>({
      systemPrompt: `Generate 5 cover slide headline variants for a carousel. Each should be click-stopping and curiosity-driven. Return as JSON with a "variants" array of strings.`,
      prompt: `Topic: ${topic}. Audience: ${audience}.`,
      temperature: 0.8,
    });
    return { ok: true as const, data: result.variants };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function saveCarousel(title: string, slides: Slide[], headlines: string[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "carousel-maker",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "carousel",
      contentJson: { slides, headlines } as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
