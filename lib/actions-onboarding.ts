"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/drizzle";
import { users, brandKits, profiles, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateJSON } from "@/lib/ai";
import { searchWeb } from "@/lib/search";
import { ensureUser } from "@/lib/ensure-user";

export interface OnboardingData {
  niche: string;
  tone: string;
  colors: string[];
  socialLinks: Record<string, string>;
  selectedPlatforms: string[];
  careerGoal: string;
  targetAudience: string;
  experienceLevel: string;
  postingFrequency: string;
  contentGoals: string[];
  contentFormats: string[];
  competitorUrls: string[];
  additionalContext: string;
}

interface CompetitorResult {
  name: string;
  platform: string;
  url?: string;
  followers?: string;
  contentStyle?: string;
}

interface CompetitorDiscovery {
  competitors: CompetitorResult[];
}

interface CalendarDay {
  day: number;
  title: string;
  format: string;
  platform: string;
  pillar: string;
  caption_hook: string;
  tips: string;
}

interface ThirtyDayPlan {
  overview: string;
  pillars: string[];
  calendar: CalendarDay[];
}

export async function saveOnboardingData(data: OnboardingData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser(userId);

  await db
    .update(users)
    .set({
      onboardingData: data as unknown as Record<string, unknown>,
      onboardingStep: 5,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, userId));

  const existing = await db.select().from(brandKits).where(eq(brandKits.userId, user.id)).then((r) => r[0]);
  if (existing) {
    await db
      .update(brandKits)
      .set({ niche: data.niche, tone: data.tone, colors: data.colors, platforms: data.selectedPlatforms, updatedAt: new Date() })
      .where(eq(brandKits.id, existing.id));
  } else {
    await db.insert(brandKits).values({ userId: user.id, niche: data.niche, tone: data.tone, colors: data.colors, platforms: data.selectedPlatforms });
  }

  const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, user.id)).then((r) => r[0]);
  const profileData = {
    socialLinks: data.socialLinks,
    experienceLevel: data.experienceLevel,
    postingSchedule: data.postingFrequency,
    contentDefaults: {
      defaultPlatform: data.selectedPlatforms[0] || "",
      defaultTone: data.tone,
      defaultFormat: data.contentFormats[0] || "",
    },
    bio: data.targetAudience,
  };

  if (existingProfile) {
    await db.update(profiles).set({ ...profileData, updatedAt: new Date() }).where(eq(profiles.id, existingProfile.id));
  } else {
    await db.insert(profiles).values({ userId: user.id, username: user.name || "", ...profileData });
  }

  revalidatePath("/onboarding");
  return { ok: true };
}

export async function discoverCompetitors(niche: string, platforms: string[]) {
  try {
    const platformQueries = platforms.map((p) => {
      const platform = p.toLowerCase().includes("youtube") ? "YouTube" :
        p.toLowerCase().includes("instagram") ? "Instagram" :
        p.toLowerCase().includes("tiktok") ? "TikTok" :
        p.toLowerCase().includes("linkedin") ? "LinkedIn" : p;
      return `top ${niche} creators on ${platform}`;
    });

    const searchResults = await Promise.all(
      platformQueries.map((q) => searchWeb(q, 5).catch(() => []))
    );

    const allResults = searchResults.flat().map((r) => ({
      title: r.title,
      snippet: r.content?.slice(0, 300) || "",
      url: r.url,
    }));

    const result = await generateJSON<CompetitorDiscovery>({
      systemPrompt: `You are a competitor research analyst. Based on the search results, identify 5-10 relevant competitors/creators in the "${niche}" niche across the specified platforms. For each competitor provide: name, platform, url (if found), estimated followers (if available), content style (brief description). Return as JSON with "competitors" array. Only include real creators that exist.`,
      prompt: `Niche: ${niche}. Platforms: ${platforms.join(", ")}.\n\nSearch results:\n${JSON.stringify(allResults, null, 2)}`,
      temperature: 0.3,
    });

    return { ok: true as const, data: result.competitors };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Competitor discovery failed" };
  }
}

export async function analyzeCompetitorsForOnboarding(
  niche: string,
  competitors: { name: string; platform: string; url?: string }[]
) {
  try {
    const competitorList = competitors.map((c) => `${c.name} (${c.platform}${c.url ? ` - ${c.url}` : ""})`).join("\n");

    const result = await generateJSON<{
      content_gaps: string[];
      common_patterns: string[];
      opportunities: string[];
      competitor_insights: string[];
    }>({
      systemPrompt: `You are a competitive content analyst. Analyze these competitors in the "${niche}" niche and identify: content_gaps (topics they're NOT covering), common_patterns (what they all do similarly), opportunities (unique angles the user can exploit), competitor_insights (key takeaways per competitor). Return as JSON.`,
      prompt: `Competitors:\n${competitorList}\n\nNiche: ${niche}`,
      temperature: 0.3,
    });

    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Competitor analysis failed" };
  }
}

export async function generateThirtyDayPlan(data: OnboardingData, competitorInsights?: string) {
  try {
    const competitorSection = competitorInsights
      ? `\n\nCompetitor Insights:\n${competitorInsights}`
      : "";

    const result = await generateJSON<ThirtyDayPlan>({
      systemPrompt: `You are a content strategist. Generate a 30-day content plan for a creator. Return as JSON with:
        overview (string — 2-3 sentence strategy overview),
        pillars (string[] — 4-5 content pillars for this niche),
        calendar (array of 30 objects, each with: day (1-30), title (string), format (string — one of: Short-form Video, Long-form Video, Carousel, Text Post, Infographic), platform (string — one of the user's platforms), pillar (string), caption_hook (string — the opening hook line), tips (string — production tip for this piece)).`,
      prompt: `Create a 30-day content plan.
Niche: ${data.niche}
Target Audience: ${data.targetAudience}
Tone: ${data.tone}
Career Goal: ${data.careerGoal}
Platforms: ${data.selectedPlatforms.join(", ")}
Content Goals: ${data.contentGoals.join(", ")}
Preferred Formats: ${data.contentFormats.join(", ")}
Posting Frequency: ${data.postingFrequency}
Experience Level: ${data.experienceLevel}
Additional Context: ${data.additionalContext || "None provided"}
${competitorSection}`,
      temperature: 0.7,
    });

    return { ok: true as const, data: result };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Plan generation failed" };
  }
}

export async function saveOnboardingPlan(
  title: string,
  plan: ThirtyDayPlan,
  competitors: CompetitorResult[],
  competitorAnalysis: Record<string, unknown> | null
) {
  try {
    const sess = await auth();
    const userId = sess.userId;
    if (!userId) return { ok: false as const, error: "Unauthorized" };

    const user = await ensureUser(userId);

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "content-ideas",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "ideas",
      contentJson: plan as unknown as Record<string, unknown>,
      version: 1,
    });

    if (competitors.length > 0) {
      const [compProject] = await db.insert(projects).values({
        userId: user.id,
        module: "competitor-intel",
        title: `Onboarding competitor research — ${title}`,
        status: "completed",
      }).returning();

      await db.insert(contentOutputs).values({
        projectId: compProject.id,
        type: "competitor_intel",
        contentJson: {
          competitors,
          analysis: competitorAnalysis,
        } as unknown as Record<string, unknown>,
        version: 1,
      });
    }

    await db
      .update(users)
      .set({ onboardingComplete: true, onboardingStep: null, updatedAt: new Date() })
      .where(eq(users.clerkId, userId));

    revalidatePath("/dashboard");
    return { ok: true as const, data: { plan, projectId: project.id } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed";
    return { ok: false as const, error: msg };
  }
}
