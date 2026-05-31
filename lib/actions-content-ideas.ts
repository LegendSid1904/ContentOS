"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON, generateText } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface Idea {
  id: string;
  title: string;
  format: "video" | "post" | "carousel";
  pillar: string;
  effort: "Low" | "Medium" | "High";
  shareability: number;
  seo_value: number;
  viral_angle: string;
}

export interface IdeaWithAngles extends Idea {
  angles: string[];
}

interface IdeasResponse {
  pillars: string[];
  ideas: Idea[];
}

interface AnglesResponse {
  angles: string[];
}

interface CalendarDay {
  day: number;
  title: string;
  format: string;
  platform: string;
  pillar: string;
}

interface CalendarResponse {
  calendar: CalendarDay[];
}

export async function generateIdeas(
  niche: string,
  audience: string,
  trendContext?: string
) {
  try {
    const trendSection = trendContext
      ? `\nIncorporate these trending topics: ${trendContext}`
      : "";

    const result = await generateJSON<IdeasResponse>({
      systemPrompt: `You are a content strategist. Generate 30 content ideas for the given niche and audience. Each idea must have: title (string), format ("video" | "post" | "carousel"), pillar (string — one of 4-5 strategic pillars for this niche), effort ("Low" | "Medium" | "High"), shareability (number 1-10), seo_value (number 1-10), viral_angle (string — one-sentence viral hook). Return as JSON with fields: pillars (string[] — list of pillar names), ideas (Idea[]).`,
      prompt: `Niche: ${niche}. Audience: ${audience}.${trendSection}`,
    });

    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function generateAngles(
  niche: string,
  audience: string,
  ideaTitle: string
) {
  try {
    const result = await generateJSON<AnglesResponse>({
      systemPrompt: `You are a viral content strategist. For the given topic, generate 10 unique angles to make it go viral. Return as JSON with field: angles (string[]).`,
      prompt: `Niche: ${niche}. Audience: ${audience}. Topic: ${ideaTitle}.`,
      temperature: 0.8,
    });

    return { ok: true as const, data: result.angles };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Angle generation failed" };
  }
}

export async function generateCalendar(
  ideas: { title: string; format: string }[]
) {
  try {
    const result = await generateJSON<CalendarResponse>({
      systemPrompt: `You are a content scheduler. Organize these ideas into a 30-day content calendar with platform assignments. Return as JSON with field: calendar (array of {day: number, title: string, format: string, platform: string, pillar: string}).`,
      prompt: `Ideas: ${JSON.stringify(ideas)}`,
    });

    return { ok: true as const, data: result.calendar };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Calendar generation failed" };
  }
}

export async function saveIdeas(title: string, ideasJson: IdeasResponse) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "content-ideas",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "ideas",
      contentJson: ideasJson as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
