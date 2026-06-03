"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

interface GrowthAudit {
  content_quality: number;
  posting_consistency: number;
  seo_optimization: number;
  engagement_rate: number;
  strengths: string[];
  weaknesses: string[];
  growth_levers: string[];
}

interface WeekPlan {
  week_number: number;
  theme: string;
  content_focus: string[];
  growth_tactic: string;
  milestone: string;
}

interface MonetizationPhase {
  phase: string;
  timeframe: string;
  tactics: string[];
  revenue_target: string;
}

interface GrowthStrategyData {
  audit: GrowthAudit;
  plan: WeekPlan[];
  monetization: MonetizationPhase[];
  algorithm_tips: string[];
}

export async function generateGrowthStrategy(niche: string, followers: number, platform: string, goals: string) {
  try {
    const result = await generateJSON<GrowthStrategyData>({
      systemPrompt: `You are a content growth strategist. Generate a complete growth strategy. Return as JSON with:
        audit: {content_quality (1-10), posting_consistency (1-10), seo_optimization (1-10), engagement_rate (1-10), strengths (string[]), weaknesses (string[]), growth_levers (string[])}
        plan: array of 12 week plans, each with {week_number, theme, content_focus (string[3-5]), growth_tactic, milestone}
        monetization: array of 3 phase objects with {phase, timeframe, tactics (string[]), revenue_target}
        algorithm_tips: string[] of platform-specific algorithm optimization tips`,
      prompt: `Niche: ${niche}. Current followers: ${followers}. Primary platform: ${platform}. Goals: ${goals}.${followers < 1000 ? " Note: Small audience — prioritize discovery tactics." : ""}`,
    });
    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function saveGrowthStrategy(title: string, data: GrowthStrategyData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "growth-strategy",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "growth_strategy",
      contentJson: data as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
