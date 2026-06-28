"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON, generateText } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";
import { APP_MODULES } from "@/lib/constants";
import { SERIES_FORMATS } from "@/lib/series-formats";

interface Hook {
  id: string;
  hook_text: string;
  framework: string;
}

interface ScriptSection {
  timestamp: string;
  content: string;
  broll: string;
}

interface FullScript {
  title: string;
  sections: ScriptSection[];
  cta: string;
}

const APP_HOOK_PROMPTS: Record<string, string> = {
  youtube: "Focus on long-form hooks that tease value, create curiosity loops, and set up deep-dive content. Suitable for 8-20 minute videos.",
  instagram: "Focus on short-form Reels hooks — fast, visual, scroll-stopping hooks optimized for high retention in the first 2 seconds.",
  tiktok: "Focus on 15-60 second viral hooks — trend-aware, controversy-driven, or pattern-interrupt hooks designed for the For You Page.",
  linkedin: "Focus on thought-leadership hooks — professional, authority-driven openings that challenge industry assumptions and drive comments.",
};

function getAppScriptPrompt(appId: string | undefined, platform: string): string {
  switch (appId) {
    case "youtube":
      return `You are a professional YouTube script writer. Write a ${platform}-optimized long-form script using this structure:
1. HOOK (first 5-10 seconds) — Use the selected hook with the "Common Belief + Contradiction" framework.
2. FEEL SEEN (15-20 seconds) — Validate the audience's pain point. Show you understand their struggle.
3. NET NEW VALUE (60-70% of runtime) — Deep-dive insights, frameworks, strategies, case studies. Include timestamps for each major section.
4. PROOF (15-20 seconds) — Credibility, credentials, results, testimonials.
5. CONTRADICTION / PLOT TWIST (10 seconds) — A final surprising insight that reframes everything.
6. CTA (5-10 seconds) — Like, subscribe, comment prompt with a specific reason.

Include timestamps for each section, detailed B-roll and visual cues, and pacing notes for the editor.`;
    case "instagram":
      return `You are a professional Instagram Reels script writer. Write a ${platform}-optimized Reel script using this structure:
1. HOOK (first 1-2 seconds) — Ultra-fast visual or text hook. Must stop the scroll immediately.
2. VALUE DELIVERY (20-30 seconds) — Quick, punchy insights delivered in rapid succession. No fluff. Each sentence should stand alone.
3. RETENTION TECHNIQUE — Include a "wait for it" moment or visual change-up at the 50% mark to beat the drop-off.
4. CTA (last 2-3 seconds) — Engagement-driven CTA (comment, save, share).

Include visual direction, text overlay suggestions, and transition cues. Each section should be 1-3 sentences max. Timestamps in seconds.`;
    case "tiktok":
      return `You are a professional TikTok script writer. Write a ${platform}-optimized viral script using this structure:
1. HOOK (first 1 second) — Immediate pattern interrupt. Must make the viewer stop scrolling.
2. BODY (15-45 seconds) — Fast-paced content delivery with sound cues. Use hooks every 5-7 seconds to maintain retention.
3. CLIFFHANGER / PLOT TWIST — A surprise at the 60-70% mark that rewards viewers for staying.
4. CTA (last 2 seconds) — Save, follow, or comment CTA tailored to TikTok behavior.

Include sound/music suggestions, transition points, text-on-screen cues, and timing for each segment.`;
    case "linkedin":
      return `You are a professional LinkedIn post writer. Write a ${platform}-optimized thought-leadership post using this structure:
1. HOOK LINE (first line) — A provocative or vulnerable opening that stops the scroll in the feed.
2. STORY / INSIGHT (3-5 paragraphs) — Personal experience, industry insight, or contrarian take with specific examples.
3. KEY TAKEAWAY (1 paragraph) — The single most important lesson or framework the reader should save.
4. CTA — A question or discussion prompt that drives comments.

Do NOT write timestamps, B-roll cues, or pacing notes. This is a text post. Format for short paragraphs, line breaks, and emoji where appropriate.`;
    default:
      return `You are a professional script writer. Write a ${platform}-optimized script using this exact structure:
1. HOOK (first 3-5 seconds) — Use the selected hook. Follow the "Common Belief + Contradiction" framework.
2. FEEL SEEN (next 10-15 seconds) — Validate the audience's pain point or desire.
3. NET NEW VALUE (body, 60-70% of runtime) — Unique insights, frameworks, or strategies.
4. PROOF (15-20 seconds) — Social proof, credentials, or results.
5. CONTRADICTION / PLOT TWIST (10 seconds) — A final surprising insight.
6. CTA (5-10 seconds) — Clear, specific call to action.

Include timestamps for each section, B-roll and visual cues, and pacing notes.`;
  }
}

export async function generateHooks(topic: string, audience: string, platform: string, tone: string, language: string = "English", appId?: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const langInstr = language === "Hinglish"
      ? "Write in Hinglish — a natural mix of Hindi (Devanagari script for Hindi words) and English, as Indian creators speak. Use casual Indian social media tone. Code-switch naturally between Hindi and English within sentences."
      : "";

    const appHookInstr = appId ? APP_HOOK_PROMPTS[appId] ?? "" : "";

    const hooks = await generateJSON<{ hooks: Hook[] }>({
      systemPrompt: `You are a hook specialist for content creators. Generate 5 high-impact hooks using PAS, AIDA, and Open Loop frameworks. Return as JSON with a "hooks" array, each with fields: id (string), hook_text (string), framework (string). ${langInstr} ${appHookInstr}`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Tone: ${tone}.`,
    });
    return { ok: true as const, data: hooks.hooks };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function generateScript(topic: string, audience: string, platform: string, tone: string, selectedHook: string, context?: string, language: string = "English", appId?: string) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const langInstr = language === "Hinglish"
      ? "Write in Hinglish — a natural mix of Hindi (Devanagari script for Hindi words) and English, as Indian creators speak. Use casual Indian social media tone. Code-switch naturally between Hindi and English within sentences."
      : "";

    const appScriptInstr = getAppScriptPrompt(appId, platform);

    const script = await generateJSON<FullScript>({
      systemPrompt: `${appScriptInstr}\n\nReturn as JSON with fields: title (string), sections (array of {timestamp, content, broll}), cta (string).${langInstr ? `\n\n${langInstr}` : ""}`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Tone: ${tone}. Selected hook: "${selectedHook}".${context ? ` Additional context: ${context}` : ""}`,
      temperature: 0.7,
    });
    return { ok: true as const, data: script };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Script generation failed" };
  }
}

export async function generateSeriesScript(
  topic: string,
  audience: string,
  platform: string,
  tone: string,
  formatId: string,
  selectedHook: string,
  language: string = "English"
) {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, error: "You need to sign in first" };
  try {
    const format = SERIES_FORMATS.find((f) => f.id === formatId);
    if (!format) return { ok: false as const, error: "Invalid series format" };

    const stepsBlock = format.steps.map((s, i) =>
      `${i + 1}. ${s} — ${format.templates[i]?.text ?? ""}`
    ).join("\n");

    const langInstr = language === "Hinglish"
      ? "Write in Hinglish — a natural mix of Hindi and English, as Indian creators speak. Code-switch naturally."
      : "";

    const script = await generateText({
      systemPrompt: `You are a professional short-form series script writer. Write a ${platform}-optimized script for a "${format.name}" series episode.

Use this ${format.steps.length}-step structure with the exact template format:
${stepsBlock}

Secret Sauce for this format: ${format.secretSauce}

For each section, include:
- The section header matching the step name
- The script content (speaker lines, voiceover, dialogue)
- Timestamp for the section
- B-roll / visual direction in brackets
- Pacing notes where relevant

Format the output with clear section breaks using "=== SECTION ===" markers between steps.${langInstr ? `\n\n${langInstr}` : ""}`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Tone: ${tone}. Series format: "${format.name}". Selected hook: "${selectedHook}".`,
      temperature: 0.7,
      maxTokens: 4096,
    });

    return { ok: true as const, data: script };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Series script generation failed" };
  }
}

export async function getScriptVersions(limit: number = 5) {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false as const, error: "Unauthorized" };

    const user = await ensureUser(userId);

    const rows = await db
      .select({
        projectId: projects.id,
        projectTitle: projects.title,
        outputId: contentOutputs.id,
        version: contentOutputs.version,
        createdAt: contentOutputs.createdAt,
        contentJson: contentOutputs.contentJson,
      })
      .from(projects)
      .innerJoin(contentOutputs, eq(contentOutputs.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, user.id),
          eq(projects.module, "script-writer"),
          eq(projects.status, "completed")
        )
      )
      .orderBy(desc(contentOutputs.createdAt))
      .limit(limit);

    const data = rows.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toString() ?? "",
    }));

    return { ok: true as const, data };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Fetch failed" };
  }
}

export async function getScriptVersionByOutputId(outputId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { ok: false as const, error: "Unauthorized" };

    const result = await db
      .select({
        contentJson: contentOutputs.contentJson,
        version: contentOutputs.version,
        createdAt: contentOutputs.createdAt,
      })
      .from(contentOutputs)
      .where(eq(contentOutputs.id, outputId))
      .limit(1);

    if (!result.length) return { ok: false as const, error: "Version not found" };
    return { ok: true as const, data: result[0] };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Fetch failed" };
  }
}

export async function saveScript(title: string, scriptJson: FullScript) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await ensureUser(userId);

    const [project] = await db.insert(projects).values({
      userId: user.id,
      module: "script-writer",
      title,
      status: "completed",
    }).returning();

    await db.insert(contentOutputs).values({
      projectId: project.id,
      type: "script",
      contentJson: scriptJson as unknown as Record<string, unknown>,
      version: 1,
    });

    return { ok: true as const, data: project };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Save failed" };
  }
}
