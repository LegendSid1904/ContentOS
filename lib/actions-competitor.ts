"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

interface CompetitorProfile {
  content_pillars: string[];
  posting_frequency: string;
  engagement_patterns: string[];
  hook_styles: string[];
  thumbnail_patterns: string[];
  overall_score: number;
}

interface ContentGap {
  topic: string;
  rationale: string;
  opportunity_score: number;
}

interface CompetitorAnalysis {
  profile: CompetitorProfile;
  gaps: ContentGap[];
}

export async function analyzeCompetitor(competitorUrl: string, niche: string, depth: "basic" | "deep") {
  try {
    const result = await generateJSON<CompetitorAnalysis>({
      systemPrompt: `You are a content analyst. Analyze this competitor's content strategy. For the profile, identify: content_pillars (array), posting_frequency (string), engagement_patterns (array), hook_styles (array), thumbnail_patterns (array), overall_score (1-10). For gaps, identify 5-10 content gaps with topic, rationale, and opportunity_score (1-10). Return as JSON with "profile" and "gaps" fields.${depth === "deep" ? " Provide a comprehensive deep analysis with detailed recommendations." : ""}`,
      prompt: `Competitor URL: ${competitorUrl}. Niche: ${niche}. Analysis depth: ${depth}.`,
    });
    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Analysis failed" };
  }
}

export async function saveCompetitorIntel(title: string, analysis: CompetitorAnalysis) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "competitor-intel",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "competitor_intel",
      contentJson: analysis as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
