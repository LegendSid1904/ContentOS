"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ThumbnailConcept {
  concept_name: string;
  headline_text: string;
  visual_description: string;
  color_palette: string[];
  facial_expression_hint: string;
  background_suggestion: string;
  props: string[];
}

interface ThumbnailResponse {
  concepts: ThumbnailConcept[];
}

export async function generateThumbnails(topic: string, platform: string, audience: string) {
  try {
    const result = await generateJSON<ThumbnailResponse>({
      systemPrompt: `You are a thumbnail strategist. Generate 5 unique thumbnail concepts. Each concept must have: concept_name, headline_text (2-5 words), visual_description, color_palette (array of hex colors), facial_expression_hint, background_suggestion, props (array of strings). Return as JSON with a "concepts" array.`,
      prompt: `Topic: ${topic}. Platform: ${platform}. Audience: ${audience}.`,
      temperature: 0.8,
    });
    return { ok: true as const, data: result.concepts };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function saveThumbnailBrief(title: string, concepts: ThumbnailConcept[]) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "thumbnail-maker",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "thumbnail_brief",
      contentJson: { concepts } as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
