"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateCarouselSlideImages } from "@/lib/image";
import { ensureUser } from "@/lib/ensure-user";

export interface Slide {
  slide_number: number;
  headline: string;
  copy: string;
  visual_direction: string;
}

export interface SlideImage {
  slide_number: number;
  image: { index: number; b64_json: string; revised_prompt: string; storageUrl?: string };
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
      systemPrompt: `You are a carousel strategist. Create a ${slideCount}-slide narrative arc. Each slide must have: slide_number (number), headline (string — short, punchy), copy (string — 1-3 lines, engagement-optimized), visual_direction (string — describe the visual layout). Return as JSON with a "slides" array.`,
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

export async function generateCarouselImages(slides: { slide_number: number; headline: string; visual_direction: string }[], topic: string, brandColor?: string) {
  try {
    const images = await generateCarouselSlideImages({ slides, topic, brandColor });
    return { ok: true as const, data: images };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Image generation failed" };
  }
}

export async function generateCarouselCTA(topic: string, audience: string, platform: string) {
  try {
    const result = await generateJSON<{ ctas: { slide: number; text: string; style: string }[] }>({
      systemPrompt: `You are a carousel CTA specialist. Generate 4 CTA options: 2 for the second slide (engagement/curiosity hooks to keep scrolling) and 2 for the final slide (conversion/drive action). Each CTA must have: slide (number — 2 or final), text (string), style ("curiosity" | "engagement" | "conversion" | "social"). Return as JSON with a "ctas" array.`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}.`,
      temperature: 0.7,
    });
    return { ok: true as const, data: result.ctas };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "CTA generation failed" };
  }
}

export async function generateCanvaPrompt(topic: string, brandColor?: string) {
  try {
    const result = await generateJSON<{ templates: { name: string; prompt: string; colors: string[]; fonts: string[] }[] }>({
      systemPrompt: `You are a Canva template designer. For the given carousel topic, generate 3 Canva template design prompts. Each template must have: name (string), prompt (string — detailed Canva design prompt ready to paste), colors (string[] — hex color palette), fonts (string[] — font pairings). Return as JSON with a "templates" array.`,
      prompt: `Topic: ${topic}.${brandColor ? ` Brand color: ${brandColor}.` : ""}`,
    });
    return { ok: true as const, data: result.templates };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Canva prompt generation failed" };
  }
}

export async function saveCarousel(title: string, slides: Slide[], headlines: string[], images?: SlideImage[]) {
  try {
    const sess = await auth();
    const userId = sess.userId;
    if (!userId) return { ok: false as const, error: "You need to sign in first" };

    const user = await ensureUser(userId);

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "carousel-maker",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "carousel",
      contentJson: { slides, headlines, images } as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed";
    console.error("Save carousel error:", msg);
    return { ok: false as const, error: msg.includes("ECONNREFUSED") || msg.includes("connection") ? "Database connection failed. Check SUPABASE_DATABASE_URL." : msg };
  }
}
