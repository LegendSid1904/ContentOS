"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";

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
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
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

export async function generateAudiencePersona(niche: string, platform: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const result = await generateJSON<{ persona: { name: string; demographics: string; psychographics: string[]; pain_points: string[]; content_preferences: string[]; best_time_to_post: string; language_tone: string; platforms_frequent: string[]; influencers_they_follow: string[] } }>({
      systemPrompt: `You are an audience researcher. Create a detailed ideal audience persona for the given niche and platform. The persona must include: name (string), demographics (string), psychographics (string[] — values, interests, lifestyle), pain_points (string[]), content_preferences (string[]), best_time_to_post (string), language_tone (string), platforms_frequent (string[]), influencers_they_follow (string[]). Return as JSON with a "persona" field.`,
      prompt: `Niche: ${niche}. Platform: ${platform}.`,
      temperature: 0.7,
    });
    return { ok: true as const, data: result.persona };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Persona generation failed" };
  }
}

export async function generateEngagementPrompts(niche: string, platform: string, goals: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const result = await generateJSON<{ dm_scripts: { scenario: string; script: string }[]; comment_templates: { type: string; template: string }[]; cta_frameworks: { name: string; framework: string }[] }>({
      systemPrompt: `You are a community engagement strategist. Generate engagement prompts for the given niche and platform. Include: dm_scripts (array of {scenario, script} — 3 DM outreach scripts), comment_templates (array of {type, template} — 5 comment templates for different post types), cta_frameworks (array of {name, framework} — 4 CTA frameworks). Return as JSON.`,
      prompt: `Niche: ${niche}. Platform: ${platform}. Goals: ${goals}.`,
      temperature: 0.7,
    });
    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Prompt generation failed" };
  }
}

export async function saveGrowthStrategy(title: string, data: GrowthStrategyData) {
  try {
    const sess = await auth();
    const userId = sess.userId;
    if (!userId) return { ok: false as const, error: "You need to sign in first" };

    const user = await ensureUser(userId);

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
    const msg = e instanceof Error ? e.message : "Save failed";
    console.error("Save growth strategy error:", msg);
    return { ok: false as const, error: msg.includes("ECONNREFUSED") || msg.includes("connection") ? "Database connection failed. Check SUPABASE_DATABASE_URL." : msg };
  }
}
