"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";

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

function extractCompetitorName(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const path = u.pathname.replace(/\/$/, "").split("/").pop() || u.hostname;
    return path.replace(/^@/, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0] || url;
  }
}

export async function analyzeCompetitor(competitorUrl: string, niche: string, depth: "basic" | "deep") {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const name = extractCompetitorName(competitorUrl);
    const result = await generateJSON<CompetitorAnalysis>({
      systemPrompt: `You are a content analyst. Analyze the competitor "${name}" (${competitorUrl}) in the "${niche}" niche. For the profile, identify: content_pillars (array of 3-5 pillar names), posting_frequency (string), engagement_patterns (array of 3-4 patterns), hook_styles (array of 3-4 styles), thumbnail_patterns (array of 2-3 patterns), overall_score (1-10). For gaps, identify 5-10 content gaps the competitor is NOT covering, each with topic, rationale, and opportunity_score (1-10). Return as JSON with "profile" and "gaps" fields.${depth === "deep" ? " Provide a comprehensive deep analysis with detailed recommendations." : ""}`,
      prompt: `Competitor URL: ${competitorUrl}. Name: ${name}. Niche: ${niche}. Depth: ${depth}.`,
    });
    return { ok: true as const, data: { ...result, competitorName: name } };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Analysis failed" };
  }
}

export async function saveCompetitorIntel(title: string, analysis: CompetitorAnalysis & { competitorName?: string }) {
  try {
    const sess = await auth();
    const userId = sess.userId;
    if (!userId) return { ok: false as const, error: "You need to sign in first" };

    const user = await ensureUser(userId);

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
    const msg = e instanceof Error ? e.message : "Save failed";
    console.error("Save competitor intel error:", msg);
    return { ok: false as const, error: msg.includes("ECONNREFUSED") || msg.includes("connection") ? "Database connection failed. Check SUPABASE_DATABASE_URL." : msg };
  }
}
