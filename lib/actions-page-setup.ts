"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

interface BioVariant {
  variant: string;
  bio_text: string;
  keyword_usage: string;
  character_count: number;
}

interface KeywordData {
  keywords: string[];
  hashtags: string[];
}

interface HighlightRecommendation {
  name: string;
  description: string;
  content_to_include: string;
}

interface ProfileAudit {
  keyword_optimization: number;
  bio_clarity: number;
  brand_consistency: number;
  cta_effectiveness: number;
  suggestions: string[];
}

interface PageSetupData {
  bios: BioVariant[];
  keywords: KeywordData;
  highlights: HighlightRecommendation[];
  audit: ProfileAudit;
}

const PLATFORM_LIMITS: Record<string, number> = {
  YouTube: 1000,
  Instagram: 150,
  LinkedIn: 2600,
  Twitter: 160,
};

export async function generatePageSetup(platform: string, niche: string, currentBio: string) {
  try {
    const limit = PLATFORM_LIMITS[platform] || 500;

    const result = await generateJSON<PageSetupData>({
      systemPrompt: `You are a profile optimization expert. Generate a complete page setup for ${platform} in the ${niche} niche. Return as JSON with:
        bios: array of 3 bio variants, each with {variant (string), bio_text (string), keyword_usage (string), character_count (number)}. Keep under ${limit} chars.
        keywords: {keywords (string[15]), hashtags (string[20])}
        highlights: array of 5-8 recommendations, each with {name, description, content_to_include}
        audit: {keyword_optimization (1-10), bio_clarity (1-10), brand_consistency (1-10), cta_effectiveness (1-10), suggestions (string[])}`,
      prompt: `Platform: ${platform}. Niche: ${niche}. Current bio/description: "${currentBio || "None provided"}".`,
    });
    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function savePageSetup(title: string, data: PageSetupData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "page-setup",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "page_setup",
      contentJson: data as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
