"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";

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

export async function generateHooks(topic: string, audience: string, platform: string, tone: string, language: string = "English") {
  try {
    const langInstr = language === "Hinglish"
      ? "Write in Hinglish — a natural mix of Hindi (Devanagari script for Hindi words) and English, as Indian creators speak. Use casual Indian social media tone. Code-switch naturally between Hindi and English within sentences."
      : "";

    const hooks = await generateJSON<{ hooks: Hook[] }>({
      systemPrompt: `You are a hook specialist for content creators. Generate 5 high-impact hooks using PAS, AIDA, and Open Loop frameworks. Return as JSON with a "hooks" array, each with fields: id (string), hook_text (string), framework (string). ${langInstr}`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Tone: ${tone}.`,
    });
    return { ok: true as const, data: hooks.hooks };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function generateScript(topic: string, audience: string, platform: string, tone: string, selectedHook: string, context?: string, language: string = "English") {
  try {
    const langInstr = language === "Hinglish"
      ? "Write in Hinglish — a natural mix of Hindi (Devanagari script for Hindi words) and English, as Indian creators speak. Use casual Indian social media tone. Code-switch naturally between Hindi and English within sentences."
      : "";

    const script = await generateJSON<FullScript>({
      systemPrompt: `You are a professional script writer. Write a ${platform}-optimized script using this exact structure:

1. HOOK (first 3-5 seconds) — Use the selected hook. Follow the "Common Belief + Contradiction" framework: state what most people think about the topic, then immediately contradict it with a surprising fact or perspective.
2. FEEL SEEN (next 10-15 seconds) — Validate the audience's pain point or desire. Show that you understand their struggle.
3. NET NEW VALUE (body, 60-70% of runtime) — Deliver unique insights, frameworks, or strategies they haven't heard before. Include specific examples, data points, or case studies.
4. PROOF (15-20 seconds) — Social proof, credentials, or results that build credibility. Can be woven into the value section.
5. CONTRADICTION / PLOT TWIST (10 seconds) — A final surprising insight that reframes everything they just learned.
6. CTA (5-10 seconds) — Clear, specific call to action.

Include timestamps for each section, B-roll and visual cues, and pacing notes. Return as JSON with fields: title (string), sections (array of {timestamp, content, broll}), cta (string).${langInstr ? `\n\n${langInstr}` : ""}`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Tone: ${tone}. Selected hook: "${selectedHook}".${context ? ` Additional context: ${context}` : ""}`,
      temperature: 0.7,
    });
    return { ok: true as const, data: script };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Script generation failed" };
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
