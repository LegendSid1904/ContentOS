"use server";

import { auth } from "@clerk/nextjs/server";
import { generateJSON } from "@/lib/ai";
import { db } from "@/lib/drizzle";
import { users, projects, contentOutputs } from "@/db/schema";
import { eq } from "drizzle-orm";

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

export async function generateHooks(topic: string, audience: string, platform: string, tone: string) {
  try {
    const hooks = await generateJSON<{ hooks: Hook[] }>({
      systemPrompt: `You are a hook specialist for content creators. Generate 5 high-impact hooks using PAS, AIDA, and Open Loop frameworks. Return as JSON with a "hooks" array, each with fields: id (string), hook_text (string), framework (string).`,
      prompt: `Topic: ${topic}. Audience: ${audience}. Platform: ${platform}. Tone: ${tone}.`,
    });
    return { ok: true as const, data: hooks.hooks };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Generation failed" };
  }
}

export async function generateScript(topic: string, audience: string, platform: string, tone: string, selectedHook: string, context?: string) {
  try {
    const script = await generateJSON<FullScript>({
      systemPrompt: `You are a professional script writer. Write a ${platform}-optimized script with timestamps, B-roll cues, and a CTA. Use the selected hook as the opening. Return as JSON with fields: title (string), sections (array of {timestamp, content, broll}), cta (string).`,
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

    const user = await db.select().from(users).where(eq(users.clerkId, userId)).then((r) => r[0]);
    if (!user) throw new Error("User not found");

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
